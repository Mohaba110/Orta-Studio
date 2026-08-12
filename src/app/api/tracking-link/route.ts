import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/runtime-mode";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { projectId } = await request.json().catch(() => ({ projectId: "" }));
  const code = String(projectId || "").trim().toUpperCase();
  if (!/^ORTA-\d{6}$/.test(code)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return isDemoMode() ? NextResponse.json({ ok: true, mode: "demo" }) : NextResponse.json({ ok: false }, { status: 503 });

  const { data: project } = await supabase.from("projects").select("id,email,preferred_language").eq("project_code", code).maybeSingle();
  if (project) {
    const cooldownStart = new Date(Date.now() - 120_000).toISOString();
    const { data: recent } = await supabase
      .from("notification_outbox")
      .select("id")
      .eq("project_id", project.id)
      .eq("template", "project_access_link")
      .gte("created_at", cooldownStart)
      .limit(1);
    if (recent?.length) return NextResponse.json({ ok: true });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const now = new Date();
    await supabase.from("project_access_tokens").delete().eq("project_id", project.id).lt("expires_at", now.toISOString());
    await supabase.from("project_access_tokens").insert({
      project_id: project.id,
      token_hash: tokenHash,
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
    await supabase.from("notification_outbox").insert({
      project_id: project.id,
      channel: "email",
      recipient: project.email,
      template: "project_access_link",
      payload: { token, projectId: code, locale: project.preferred_language },
    });
  }
  return NextResponse.json({ ok: true });
}
