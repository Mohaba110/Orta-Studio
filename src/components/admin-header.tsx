"use client";

import { useRouter } from "next/router";
import { BrandLockup, LanguageToggle } from "./site-header";
import { useLocale } from "./locale-provider";

export function AdminHeader() {
  const router = useRouter();
  const { pick } = useLocale();

  async function signOut() {
    await fetch("/api/admin/signout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="admin-header">
      <div className="shell admin-header__inner">
        <div className="admin-header__brand"><BrandLockup compact /><span className="admin-label">Admin</span></div>
        <LanguageToggle />
        <button className="sign-out" onClick={signOut} type="button">{pick("Sign out", "Çıkış")}</button>
      </div>
    </header>
  );
}
