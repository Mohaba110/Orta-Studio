import { getSupabaseServer } from "./supabase-server";
import { isDemoMode } from "./runtime-mode";

export async function getAdminContext() {
  const supabase = await getSupabaseServer();
  if (!supabase) return isDemoMode() ? { supabase: null, demo: true as const } : null;

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!admin) return null;

  return { supabase, demo: false as const };
}
