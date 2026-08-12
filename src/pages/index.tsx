"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChatCircle, DownloadSimple, FileText, PencilSimple } from "@phosphor-icons/react";
import { CtaStrip } from "@/components/cta-strip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useLocale } from "@/components/locale-provider";

const conceptProjects = [
  { image: "/images/concept-kraft-sack.png", title: "Bakery Ingredient Sack", type: "Industrial Food Packaging" },
  { image: "/images/concept-cacao-pouch.png", title: "Food Powder Pouch", type: "Food Packaging" },
  { image: "/images/concept-olive-carton.png", title: "Premium Food Carton & Label", type: "Labels & Cartons" },
];

const services = ["Packaging Design", "Print Ready Artwork", "Label Design", "Packaging Revision", "Industrial Sack Design", "Product Mockups", "Logo & Brand Identity"];

export default function HomePage() {
  const { pick } = useLocale();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="home-hero__copy">
            <h1>{pick("Industrial Packaging Design.", "Endüstriyel Ambalaj Tasarımı.")}</h1>
            <p className="home-hero__tagline">{pick("Built for production.", "Üretim için tasarlandı.")}</p>
            <span className="orange-rule" aria-hidden />
            <p className="home-hero__description">{pick("Food packaging, labels and print-ready artwork engineered for real manufacturing.", "Gıda ambalajı, etiket ve baskıya hazır tasarımlar gerçek üretim için hazırlanır.")}</p>
            <p className="home-hero__industry">{pick("Food packaging & selected industrial sectors.", "Gıda ambalajı ve seçili endüstriyel sektörler.")}</p>
            <div className="hero-actions">
              <Link className="button button--orange" href="/request">{pick("Request a Quote", "Teklif İste")}<ArrowRight size={18} /></Link>
              <a className="text-link" href="#concept-projects">{pick("View Projects", "Projeleri Gör")}<ArrowRight size={18} /></a>
            </div>
          </div>
          <div className="home-hero__image">
            <Image src="/images/packaging-hero-v2.png" alt="Premium industrial food packaging mockups" width={1536} height={1024} priority />
          </div>
        </section>

        <section className="shell home-intro">
          <h2>{pick("We design industrial food packaging and graphics that are built to be manufactured.", "Üretilebilir endüstriyel gıda ambalajları ve grafik sistemleri tasarlıyoruz.")}</h2>
        </section>

        <section className="shell concepts" id="concept-projects">
          <div className="concepts__intro">
            <p className="eyebrow">{pick("Concept Projects", "Konsept Projeler")}</p>
            <h2>{pick("Concept\nProjects", "Konsept\nProjeler").split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
            <a className="text-link" href="#concept-projects">{pick("View all projects", "Tüm projeler")}<ArrowRight size={17} /></a>
          </div>
          <div className="concept-grid">
            {conceptProjects.map((project) => (
              <article className="concept-card" key={project.title}>
                <div className="concept-card__image"><Image src={project.image} alt={project.title} width={900} height={1000} /></div>
                <h3>{project.title}</h3>
                <p>{project.type}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-rule">
          <div className="shell services-band">
            <div>
              <p className="eyebrow">{pick("Services", "Hizmetler")}</p>
              <h2 className="section-title">{pick("What we do", "Ne yapıyoruz")}</h2>
            </div>
            <div className="services-band__list">
              {services.map((service) => <div className="service-mini" key={service}><span>{service}</span><ArrowRight size={17} /></div>)}
            </div>
          </div>
        </section>

        <section className="process-section section-rule">
          <div className="process-section__copy">
            <p className="eyebrow">{pick("How we work", "Nasıl çalışıyoruz")}</p>
            <h2>{pick("Simple, clear process.", "Basit, net süreç.")}</h2>
            <div className="process-steps">
              <article className="process-step"><span className="process-step__number">01</span><ChatCircle size={28} weight="thin" /><h3>{pick("Brief", "Brief")}</h3><p>{pick("We learn about your product, materials and production requirements.", "Ürününüzü, malzemeyi ve üretim gereksinimlerini öğreniriz.")}</p><ArrowRight className="process-step__connector" size={18} weight="thin" aria-hidden /></article>
              <article className="process-step"><span className="process-step__number">02</span><FileText size={28} weight="thin" /><h3>{pick("Quote", "Teklif")}</h3><p>{pick("We review the brief and provide a clear scope and timeline.", "Briefi inceler, net kapsam ve zaman planı sunarız.")}</p><ArrowRight className="process-step__connector" size={18} weight="thin" aria-hidden /></article>
              <article className="process-step"><span className="process-step__number">03</span><PencilSimple size={28} weight="thin" /><h3>{pick("Design", "Tasarım")}</h3><p>{pick("We develop concepts and refine until the direction is right.", "Konseptleri geliştirir ve doğru yönü birlikte netleştiririz.")}</p><ArrowRight className="process-step__connector" size={18} weight="thin" aria-hidden /></article>
              <article className="process-step"><span className="process-step__number">04</span><DownloadSimple size={28} weight="thin" /><h3>{pick("Final Artwork", "Final Artwork")}</h3><p>{pick("Print-ready files, specs and guidelines for smooth production.", "Sorunsuz üretim için baskıya hazır dosya, teknik bilgi ve kılavuzlar.")}</p></article>
            </div>
          </div>
          <div className="process-section__image"><Image src="/images/print-ready-artwork.png" alt="Print-ready food packaging artwork" width={1536} height={1024} /></div>
        </section>

        <section className="why-section">
          <div className="why-section__image"><Image src="/images/corrugated-board.png" alt="Corrugated packaging material detail" width={1536} height={1024} /></div>
          <div className="why-section__copy">
            <p className="eyebrow">{pick("Why ORTA Studio", "Neden ORTA Studio")}</p>
            <h2>{pick("Design that works in the real world.", "Gerçek dünyada çalışan tasarım.")}</h2>
            <ul className="why-list">
              <li><strong>{pick("Industrial focus.", "Endüstriyel odak.")}</strong> {pick("Packaging and graphics for manufacturing and logistics.", "Üretim ve lojistik için ambalaj ve grafik.")}</li>
              <li><strong>{pick("Production aware.", "Üretim farkındalığı.")}</strong> {pick("Materials, print and processes considered from day one.", "Malzeme, baskı ve süreçler ilk günden hesaba katılır.")}</li>
              <li><strong>{pick("Clear communication.", "Net iletişim.")}</strong> {pick("Fast, direct and reliable throughout the project.", "Proje boyunca hızlı, doğrudan ve güvenilir.")}</li>
              <li><strong>{pick("Ready to produce.", "Üretime hazır.")}</strong> {pick("Files and guidance that make production easier.", "Üretimi kolaylaştıran dosya ve yönlendirmeler.")}</li>
            </ul>
          </div>
        </section>
        <CtaStrip />
      </main>
      <SiteFooter />
    </>
  );
}
