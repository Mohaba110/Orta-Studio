import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/runtime-mode";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return isDemoMode()
      ? NextResponse.json({ ok: true, mode: "demo" })
      : NextResponse.json(
          { error: "Supabase is not configured" },
          { status: 503 },
        );
  }

  const pendingCookies: PendingCookie[] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        pendingCookies.push(...cookiesToSet);
        Object.assign(pendingHeaders, headers);
      },
    },
  });

  const respond = (
    payload: Record<string, unknown>,
    status = 200,
  ) => {
    const response = NextResponse.json(payload, { status });

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    Object.entries(pendingHeaders).forEach(([name, value]) => {
      response.headers.set(name, value);
    });

    return response;
  };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return respond({ error: "Invalid credentials" }, 401);
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  console.log("ORTA_ADMIN_AUTH_DIAG", {
    userId: data.user.id,
    adminFound: Boolean(admin),
    adminError: adminError
      ? { code: adminError.code, message: adminError.message }
      : null,
    supabaseProjectRef: new URL(url).hostname.split(".")[0],
  });

  if (!admin) {
    await supabase.auth.signOut();
    return respond({ error: "Unauthorized" }, 403);
  }

  return respond({ ok: true });
}
