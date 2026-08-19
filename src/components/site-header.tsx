"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useLocale } from "./locale-provider";

const nav = [
  { href: "/", en: "Home", tr: "Ana Sayfa" },
  { href: "/services", en: "Services", tr: "Hizmetler" },
  { href: "/tracking", en: "Project Tracking", tr: "Proje Takibi" },
  { href: "/request", en: "Request a Quote", tr: "Teklif İste" },
];

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`} href="/" aria-label="ORTA Studio home">
      <img
  src="/images/orta-header-logo.png"
  alt="ORTA Studio"
  className="brand-logo"
/>
      <span className="brand-descriptor">Industrial Packaging<br />&amp; Graphic Design</span>
    </Link>
  );
}

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="language-toggle" aria-label="Language">
      <button className={locale === "en" ? "is-active" : ""} onClick={() => setLocale("en")} type="button">EN</button>
      <span>/</span>
      <button className={locale === "tr" ? "is-active" : ""} onClick={() => setLocale("tr")} type="button">TR</button>
    </div>
  );
}

export function SiteHeader() {
  const { pathname } = useRouter();
  const activePath = pathname.startsWith("/project/") ? "/tracking" : pathname;
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <BrandLockup />
        <nav className="site-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} className={activePath === item.href ? "is-active" : ""} href={item.href}>
              {locale === "en" ? item.en : item.tr}
            </Link>
          ))}
        </nav>
        <LanguageToggle />
        <button className="menu-button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} type="button">
          {open ? <X size={25} /> : <List size={25} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="shell">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {locale === "en" ? item.en : item.tr}
              </Link>
            ))}
            <LanguageToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
