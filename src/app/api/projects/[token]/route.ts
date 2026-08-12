import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { demoProject } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoMode } from "@/lib/runtime-mode";

function demoPayload() {
  return {
    code: demoProject.code,
    product: demoProject.product,
    company: demoProject.company,
    status: demoProject.status,
    messages: demoProject.messages,
    files: demoProject.files,
    hasOpenRevision: false,
  };
}

async function resolveProject(token: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { supabase: null, project: null, demo: isDemoMode() };
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: primaryProject } = await supabase.from("projects").select("id,project_code,company,product_name,status").eq("access_token_hash", tokenHash).maybeSingle();
  if (primaryProject) return { supabase, project: primaryProject, demo: false };

  const { data: accessToken } = await supabase
    .from("project_access_tokens")
    .select("project_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!accessToken) return { supabase, project: null, demo: false };
  const { data: project } = await supabase.from("projects").select("id,project_code,company,product_name,status").eq("id", accessToken.project_id).maybeSingle();
  return { supabase, project, demo: false };
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resolved = await resolveProject(token);
  if (resolved.demo) return NextResponse.json({ project: demoPayload(), mode: "demo" });
  if (!resolved.project || !resolved.supabase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: messages }, { data: files }, { data: revisions }] = await Promise.all([
    resolved.supabase.from("project_messages").select("id,created_at,sender_type,sender_name,message").eq("project_id", resolved.project.id).order("created_at"),
    resolved.supabase.from("project_files").select("id,created_at,storage_path,original_name,mime_type,size_bytes").eq("project_id", resolved.project.id).order("created_at"),
    resolved.supabase.from("revision_requests").select("id").eq("project_id", resolved.project.id).eq("status", "open").limit(1),
  ]);

  const fileRows = await Promise.all((files ?? []).map(async (file) => {
    const { data } = await resolved.supabase!.storage.from("project-files").createSignedUrl(file.storage_path, 900);
    const date = new Date(file.created_at);
    return { id: file.id, name: file.original_name, date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), meta: `${(file.mime_type || "FILE").split("/").pop()?.toUpperCase()} · ${file.size_bytes ? `${(file.size_bytes / 1024 / 1024).toFixed(1)} MB` : "—"}`, downloadUrl: data?.signedUrl };
  }));

  return NextResponse.json({ project: {
    code: resolved.project.project_code,
    product: resolved.project.product_name,
    company: resolved.project.company || "",
    status: resolved.project.status,
    hasOpenRevision: Boolean(revisions?.length),
    messages: (messages ?? []).map((message) => { const date = new Date(message.created_at); return { id: message.id, date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), author: message.sender_name || (message.sender_type === "admin" ? "ORTA Studio" : "Client"), text: message.message }; }),
    files: fileRows,
  } });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resolved = await resolveProject(token);
  const body = await request.json().catch(() => ({}));

  if (resolved.demo) return NextResponse.json({ ok: true, mode: "demo" });
  if (!resolved.project || !resolved.supabase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "message") {
    const text = String(body.text || "").trim().slice(0, 4000);
    if (!text) return NextResponse.json({ error: "Message required" }, { status: 400 });
    await resolved.supabase.from("project_messages").insert({ project_id: resolved.project.id, sender_type: "client", sender_name: "Client", message: text });
  } else if (body.action === "revision") {
    const text = String(body.text || "").trim().slice(0, 6000);
    if (!text) return NextResponse.json({ error: "Revision required" }, { status: 400 });
    await resolved.supabase.from("revision_requests").insert({ project_id: resolved.project.id, request_text: text, status: "open" });
  } else if (body.action === "final_approval") {
    if (resolved.project.status !== "Waiting for Client") return NextResponse.json({ error: "Project is not ready for final approval" }, { status: 409 });
    await resolved.supabase.from("final_approvals").insert({ project_id: resolved.project.id });
    await resolved.supabase.from("projects").update({ status: "Completed" }).eq("id", resolved.project.id);
  } else {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
