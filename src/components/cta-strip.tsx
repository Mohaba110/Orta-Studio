"use client";

import Link from "next/link";
import { ArrowRight, Cube } from "@phosphor-icons/react";
import { useLocale } from "./locale-provider";

export function CtaStrip({ compact = false }: { compact?: boolean }) {
  const { pick } = useLocale();
  return (
    <section className={`cta-strip ${compact ? "cta-strip--compact" : ""}`}>
      <div className="shell cta-strip__inner">
        <div className="cta-strip__title">
          <Cube size={42} weight="thin" aria-hidden />
          <h2>{pick(compact ? "Have a packaging project?" : "Ready to create packaging built for production?", compact ? "Bir ambalaj projeniz mi var?" : "Üretime hazır ambalaj oluşturmaya hazır mısınız?")}</h2>
        </div>
        <p>{pick(compact ? "Tell us what you’re making. We’ll review the brief and send a quote." : "Tell us about your project. We’ll reply within one business day.", compact ? "Ne ürettiğinizi anlatın. Briefi inceleyip teklif gönderelim." : "Projenizi anlatın. Bir iş günü içinde yanıt verelim.")}</p>
        <Link className="button button--orange" href="/request">{pick("Request a Quote", "Teklif İste")}<ArrowRight size={18} /></Link>
      </div>
    </section>
  );
}
