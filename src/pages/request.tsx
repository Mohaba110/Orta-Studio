"use client";

import { QuoteForm } from "@/components/quote-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useLocale } from "@/components/locale-provider";

export default function RequestPage() {
  const { pick } = useLocale();
  return (
    <>
      <SiteHeader />
      <main className="page-form">
        <section className="shell form-shell">
          <p className="page-kicker">{pick("Request a Quote", "Teklif İste")}</p>
          <h1>{pick("Tell us about your project.", "Projenizi bize anlatın.")}</h1>
          <p className="form-lead">{pick("Send the essentials. We’ll review your project and prepare a quote.", "Temel bilgileri gönderin. Projenizi inceleyip teklif hazırlayalım.")}</p>
          <QuoteForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
