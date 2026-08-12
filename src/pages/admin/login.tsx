"use client";

import { AdminLoginForm } from "@/components/admin-login-form";
import { BrandLockup } from "@/components/site-header";
import { useLocale } from "@/components/locale-provider";

export default function AdminLoginPage() {
  const { pick } = useLocale();
  return <><header className="admin-header"><div className="shell admin-header__inner"><div className="admin-header__brand"><BrandLockup compact /><span className="admin-label">Admin</span></div></div></header><main className="login-page"><section className="login-card"><h1>{pick("Admin sign in", "Admin girişi")}</h1><p>{pick("Authorized ORTA Studio team members only.", "Yalnızca yetkili ORTA Studio ekip üyeleri.")}</p><AdminLoginForm /></section></main></>;
}
