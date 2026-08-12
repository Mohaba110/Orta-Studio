import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/runtime-mode";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const requiredFields = ["name", "email", "country", "preferredLanguage", "service", "industry", "productName", "description", "preferredDelivery"] as const;

export async function POST(request: Request) {
  const body = await request.formData();
  const values = Object.fromEntries(requiredFields.map((field) => [field, String(body.get(field) ?? "").trim()]));
  if (requiredFields.some((field) => !values[field])) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });

  const secureToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(secureToken).digest("hex");
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return isDemoMode()
      ? NextResponse.json({ projectId: "ORTA-260006", securePath: `/project/${secureToken}`, mode: "demo" })
      : NextResponse.json({ error: "Project intake is temporarily unavailable." }, { status: 503 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      client_name: values.name,
      company: String(body.get("company") ?? "").trim() || null,
      email: values.email,
      whatsapp: String(body.get("whatsapp") ?? "").trim() || null,
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

  if (error || !project) return NextResponse.json({ error: "Unable to create the project. Please try again." }, { status: 500 });

  const files = body.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${project.id}/client/${randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("project-files").upload(storagePath, file, { upsert: false });
    if (!uploadError) await supabase.from("project_files").insert({ project_id: project.id, storage_path: storagePath, original_name: file.name, mime_type: file.type || null, size_bytes: file.size, uploaded_by: "client" });
  }

  await supabase.from("notification_outbox").insert({
    project_id: project.id,
    channel: "email",
    recipient: values.email,
    template: "project_request_confirmation",
    payload: { token: secureToken, projectId: project.project_code, locale: values.preferredLanguage },
  });

  return NextResponse.json({ projectId: project.project_code, securePath: `/project/${secureToken}` });
}
