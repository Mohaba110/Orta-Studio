import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/runtime-mode";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const requiredFields = ["name", "email", "country", "preferredLanguage", "service", "industry", "productName", "description", "preferredDelivery"] as const;

type FileDescriptor = {
  name: string;
  type: string;
  size: number;
};

type CompletedFile = FileDescriptor & {
  path: string;
};

function parseFileDescriptors(value: unknown): FileDescriptor[] | null {
  if (!Array.isArray(value)) return [];
  const files = value.map((item) => ({
    name: String(item && typeof item === "object" && "name" in item ? item.name : "").trim(),
    type: String(item && typeof item === "object" && "type" in item ? item.type : "").trim(),
    size: Number(item && typeof item === "object" && "size" in item ? item.size : NaN),
  }));
  return files.every((file) => file.name && Number.isInteger(file.size) && file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES)
    ? files
    : null;
}

function parseCompletedFiles(value: unknown): CompletedFile[] | null {
  const files = parseFileDescriptors(value);
  if (!files || !Array.isArray(value)) return null;
  const completed = files.map((file, index) => ({
    ...file,
    path: String(value[index] && typeof value[index] === "object" && "path" in value[index] ? value[index].path : "").trim(),
  }));
  return completed.every((file) => file.path) ? completed : null;
}

async function sendOrtaNotification(projectId: string, values: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORTA_NOTIFICATION_EMAIL;
  console.log("ORTA_EMAIL_CONFIG", {
    hasApiKey: Boolean(apiKey),
    hasRecipient: Boolean(to),
  });

  if (!apiKey || !to) {
    console.error("ORTA_EMAIL_CONFIG_MISSING", {
      hasApiKey: Boolean(apiKey),
      hasRecipient: Boolean(to),
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "ORTA-Studio/1.0",
    },
    body: JSON.stringify({
      from: "ORTA Studio <projects@mail.orta-studio.com>",
      to: [to],
      subject: `New ORTA Project — ${projectId}`,
      html: `
        <h2>New ORTA Studio Project</h2>
        <p><strong>Project ID:</strong> ${projectId}</p>
        <p><strong>Name:</strong> ${values.name}</p>
        <p><strong>Company:</strong> ${values.company || "-"}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>WhatsApp:</strong> ${values.whatsapp || "-"}</p>
        <p><strong>Country:</strong> ${values.country}</p>
        <p><strong>Language:</strong> ${values.preferredLanguage}</p>
        <p><strong>Service:</strong> ${values.service}</p>
        <p><strong>Industry:</strong> ${values.industry}</p>
        <p><strong>Product:</strong> ${values.productName}</p>
        <p><strong>Delivery:</strong> ${values.preferredDelivery}</p>
        <p><strong>Description:</strong><br>${values.description}</p>
      `,
    }),
  });

  if (!response.ok) {
    console.error("RESEND_NOTIFICATION_ERROR", await response.text());
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const values = Object.fromEntries(requiredFields.map((field) => [field, String(body[field] ?? "").trim()]));
  values.company = String(body.company ?? "").trim();
  values.whatsapp = String(body.whatsapp ?? "").trim();
  if (requiredFields.some((field) => !values[field])) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const files = parseFileDescriptors(body.files);
  if (!files) {
    return NextResponse.json({ error: "Each file must be 5 MB or smaller." }, { status: 400 });
  }

  const secureToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(secureToken).digest("hex");
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return isDemoMode()
      ? NextResponse.json({ projectId: "ORTA-260006", securePath: `/project/${secureToken}`, uploads: [], mode: "demo" })
      : NextResponse.json({ error: "Project intake is temporarily unavailable." }, { status: 503 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      client_name: values.name,
      company: values.company || null,
      email: values.email,
      whatsapp: values.whatsapp || null,
      country: values.country,
      preferred_language: values.preferredLanguage,
      service: values.service,
      industry: values.industry,
      product_name: values.productName,
      description: values.description,
      preferred_delivery: values.preferredDelivery,
      access_token_hash: tokenHash,
    })
    .select("id, project_code")
    .single();

  if (error || !project) {
    console.error("QUOTE_PROJECT_INSERT_ERROR", { error, project, values });
    return NextResponse.json({ error: "Unable to create the project. Please try again." }, { status: 500 });
  }

  const uploads = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${project.id}/client/${randomUUID()}-${safeName}`;
    const { data, error: signedUrlError } = await supabase.storage
      .from("project-files")
      .createSignedUploadUrl(storagePath);
    if (signedUrlError || !data?.token) {
      console.error("QUOTE_SIGNED_UPLOAD_ERROR", {
        projectCode: project.project_code,
        fileName: file.name,
        storagePath,
        error: signedUrlError,
      });
      await supabase.from("projects").delete().eq("id", project.id);
      return NextResponse.json({ error: "File upload could not be prepared." }, { status: 500 });
    }
    uploads.push({ path: storagePath, token: data.token });
  }

  await supabase.from("notification_outbox").insert({
    project_id: project.id,
    channel: "email",
    recipient: values.email,
    template: "project_request_confirmation",
    payload: { token: secureToken, projectId: project.project_code, locale: values.preferredLanguage },
  });
  await sendOrtaNotification(project.project_code, values).catch((notificationError) => {
    console.error("RESEND_NOTIFICATION_EXCEPTION", notificationError);
  });

  return NextResponse.json({
    projectId: project.project_code,
    securePath: `/project/${secureToken}`,
    completionToken: secureToken,
    uploads,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const completionToken = String(body.completionToken ?? "").trim();
  const files = parseCompletedFiles(body.files);
  if (!completionToken || !files?.length) {
    return NextResponse.json({ error: "Invalid upload confirmation." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Project intake is temporarily unavailable." }, { status: 503 });
  const tokenHash = createHash("sha256").update(completionToken).digest("hex");
  const { data: project } = await supabase
    .from("projects")
    .select("id, project_code")
    .eq("access_token_hash", tokenHash)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const prefix = `${project.id}/client/`;
  const records = [];
  for (const file of files) {
    if (!file.path.startsWith(prefix) || file.path.slice(prefix.length).includes("/")) {
      return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
    }

    const { data: storedFile, error: infoError } = await supabase.storage
      .from("project-files")
      .info(file.path);
    if (infoError || !storedFile) {
      console.error("QUOTE_FILE_INFO_ERROR", { projectCode: project.project_code, path: file.path, error: infoError });
      return NextResponse.json({ error: "Uploaded file could not be verified." }, { status: 400 });
    }
    const storedSize = Number(storedFile.size);
    if (!Number.isInteger(storedSize) || storedSize <= 0 || storedSize > MAX_FILE_SIZE_BYTES || storedSize !== file.size) {
      await supabase.storage.from("project-files").remove([file.path]);
      return NextResponse.json({ error: "Each file must be 5 MB or smaller." }, { status: 413 });
    }

    records.push({
      project_id: project.id,
      storage_path: file.path,
      original_name: file.name,
      mime_type: file.type || null,
      size_bytes: storedSize,
      uploaded_by: "client",
    });
  }

  const { error: insertError } = await supabase
    .from("project_files")
    .upsert(records, { onConflict: "storage_path", ignoreDuplicates: true });
  if (insertError) {
    console.error("QUOTE_FILE_RECORD_ERROR", { projectCode: project.project_code, error: insertError });
    return NextResponse.json({ error: "Uploaded files could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
