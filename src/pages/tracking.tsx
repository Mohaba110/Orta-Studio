"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackingForm } from "@/components/tracking-form";
import { useLocale } from "@/components/locale-provider";

export default function TrackingPage() {
  const { pick } = useLocale();
  return (
    <>
      <SiteHeader />
      <main className="tracking-page">
        <section className="shell tracking-shell">
          <div className="tracking-copy">
            <p className="page-kicker">{pick("Project Tracking", "Proje Takibi")}</p>
            <h1>{pick("Track your project.", "Projenizi takip edin.")}</h1>
            <p>{pick("Enter your Project ID and we’ll send the secure access link to the email on file.", "Proje kimliğinizi girin; güvenli erişim bağlantısını kayıtlı e-postaya gönderelim.")}</p>
          </div>
          <div className="tracking-form-wrap"><TrackingForm /></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
