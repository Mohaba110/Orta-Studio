"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { CtaStrip } from "@/components/cta-strip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useLocale } from "@/components/locale-provider";

const services = [
  ["Packaging Design", "Complete packaging systems shaped for brand, material and production requirements.", "Ambalaj Tasarımı", "Marka, malzeme ve üretim gereksinimlerine göre bütüncül ambalaj sistemleri."],
  ["Print Ready Artwork", "Production files prepared for reliable handoff to print.", "Baskıya Hazır Artwork", "Matbaaya güvenilir teslim için hazırlanan üretim dosyaları."],
  ["Label Design", "Clear, print-aware labels for real packaging formats.", "Etiket Tasarımı", "Gerçek ambalaj formatları için net, baskı odaklı etiketler."],
  ["Packaging Revision", "Precise updates to existing packaging without unnecessary redesign.", "Ambalaj Revizyonu", "Gereksiz yeniden tasarım olmadan mevcut ambalajda hassas güncellemeler."],
  ["Industrial Sack Design", "B2B sack graphics designed around real print and production constraints.", "Endüstriyel Çuval Tasarımı", "Gerçek baskı ve üretim kısıtlarına göre B2B çuval grafikleri."],
  ["Product Mockups", "Realistic mockups for review, presentation and approval.", "Ürün Mockup'ları", "İnceleme, sunum ve onay için gerçekçi mockup'lar."],
  ["Logo & Brand Identity", "Focused visual identities for products and manufacturers.", "Logo & Marka Kimliği", "Ürünler ve üreticiler için odaklı görsel kimlikler."],
];

export default function ServicesPage() {
  const { locale, pick } = useLocale();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="services-hero">
          <div className="services-hero__copy">
            <p className="eyebrow">{pick("Services", "Hizmetler")}</p>
            <h1>{pick("Packaging design services built for production.", "Üretim için tasarlanmış ambalaj hizmetleri.")}</h1>
            <p>{pick("From food packaging and labels to print-ready artwork, we create design that works in real manufacturing.", "Gıda ambalajı ve etiketlerden baskıya hazır artwork'e kadar gerçek üretimde çalışan tasarımlar geliştiriyoruz.")}</p>
            <span className="orange-rule" aria-hidden />
            <p className="industry-note">{pick("Food packaging first. Selected industrial sectors also welcome.", "Önceliğimiz gıda ambalajı. Seçili endüstriyel sektörlere de hizmet veriyoruz.")}</p>
            <Link className="button button--orange" href="/request">{pick("Request a Quote", "Teklif İste")}<ArrowRight size={18} /></Link>
          </div>
          <div className="services-hero__image"><Image src="/images/packaging-hero-v2.png" alt="Premium food packaging design examples" width={1536} height={1024} priority /></div>
        </section>

        <section className="shell service-list-section">
          <h2>{pick("What we do", "Ne yapıyoruz")}</h2>
          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-item" key={service[0]}>
                <span className="service-item__number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{locale === "en" ? service[0] : service[2]}</h3>
                <p>{locale === "en" ? service[1] : service[3]}</p>
                <ArrowRight size={22} aria-hidden />
              </article>
            ))}
          </div>
        </section>
        <CtaStrip compact />
      </main>
      <SiteFooter />
    </>
  );
}
