import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-context";
import { demoProject, statusOrder, type ProjectStatus } from "@/lib/demo-data";

function demoAdminProject() {
  return {
    id: demoProject.id,
    code: demoProject.code,
    product: demoProject.product,
    company: demoProject.company,
    client: demoProject.client,
    email: demoProject.email,
    whatsapp: demoProject.whatsapp,
    country: demoProject.country,
    service: demoProject.service,
    industry: demoProject.industry,
    preferredLanguage: demoProject.preferredLanguage,
    preferredDelivery: demoProject.preferredDelivery,
    description: demoProject.description,
    status: demoProject.status,
    messages: demoProject.messages,
    files: demoProject.files,
    hasOpenRevision: false,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const auth = await getAdminContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.demo) return NextResponse.json({ project: demoAdminProject(), mode: "demo" });

  const { code } = await params;
  const { data: row } = await auth.supabase!.from("projects").select("*").eq("project_code", code.toUpperCase()).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: messages }, { data: files }, { data: revisions }] = await Promise.all([
    auth.supabase!.from("project_messages").select("id,created_at,sender_name,sender_type,message").eq("project_id", row.id).order("created_at"),
    auth.supabase!.from("project_files").select("id,created_at,original_name,mime_type,size_bytes").eq("project_id", row.id).order("created_at"),
    auth.supabase!.from("revision_requests").select("id").eq("project_id", row.id).eq("status", "open").limit(1),
  ]);

  const project = {
    id: row.id,
    code: row.project_code,
    product: row.product_name,
    company: row.company || row.client_name,
    client: row.client_name,
    email: row.email,
    whatsapp: row.whatsapp || "",
    country: row.country,
    service: row.service,
    industry: row.industry,
    preferredLanguage: row.preferred_language,
    preferredDelivery: row.preferred_delivery,
    description: row.description,
    status: row.status as ProjectStatus,
    messages: (messages ?? []).map((item) => {
      const date = new Date(item.created_at);
      return { id: item.id, date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), author: item.sender_name || (item.sender_type === "admin" ? "ORTA Studio" : "Client"), text: item.message };
    }),
    files: (files ?? []).map((item) => {
      const date = new Date(item.created_at);
      return { id: item.id, name: item.original_name, date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), meta: `${(item.mime_type || "FILE").split("/").pop()?.toUpperCase()} · ${item.size_bytes ? `${(item.size_bytes / 1024 / 1024).toFixed(1)} MB` : "—"}` };
    }),
    hasOpenRevision: Boolean(revisions?.length),
  };
  return NextResponse.json({ project });
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const auth = await getAdminContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.demo) return NextResponse.json({ ok: true, mode: "demo" });
  const { code } = await params;
  const { data: project } = await auth.supabase!.from("projects").select("id").eq("project_code", code.toUpperCase()).maybeSingle();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${project.id}/admin/${randomUUID()}-${safeName}`;
      const { error } = await auth.supabase!.storage.from("project-files").upload(path, file, { upsert: false });
      if (!error) await auth.supabase!.from("project_files").insert({ project_id: project.id, storage_path: path, original_name: file.name, mime_type: file.type || null, size_bytes: file.size, uploaded_by: "admin" });
    }
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => ({}));
  if (body.action === "status") {
    if (!statusOrder.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    await auth.supabase!.from("projects").update({ status: body.status, last_activity_at: new Date().toISOString() }).eq("id", project.id);
  } else if (body.action === "message") {
    const text = String(body.text || "").trim().slice(0, 4000);
    if (!text) return NextResponse.json({ error: "Message required" }, { status: 400 });
    await auth.supabase!.from("project_messages").insert({ project_id: project.id, sender_type: "admin", sender_name: "ORTA Studio", message: text });
    await auth.supabase!.from("projects").update({ last_activity_at: new Date().toISOString() }).eq("id", project.id);
  } else return NextResponse.json({ error: "Unsupported action" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
