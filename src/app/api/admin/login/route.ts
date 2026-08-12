import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/runtime-mode";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const supabase = await getSupabaseServer();
  if (!supabase) return isDemoMode() ? NextResponse.json({ ok: true, mode: "demo" }) : NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) { await supabase.auth.signOut(); return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); }
  return NextResponse.json({ ok: true });
}
