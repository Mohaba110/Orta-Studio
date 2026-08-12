"use client";

import Link from "next/link";
import { BrandLockup, LanguageToggle } from "./site-header";
import { useLocale } from "./locale-provider";

export function SiteFooter() {
  const { pick } = useLocale();
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <BrandLockup compact />
        <nav aria-label="Footer navigation">
          <Link href="/">{pick("Home", "Ana Sayfa")}</Link>
          <Link href="/services">{pick("Services", "Hizmetler")}</Link>
          <Link href="/tracking">{pick("Project Tracking", "Proje Takibi")}</Link>
          <Link href="/request">{pick("Request a Quote", "Teklif İste")}</Link>
        </nav>
        <LanguageToggle />
      </div>
    </footer>
  );
}
