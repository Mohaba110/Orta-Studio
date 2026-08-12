"use client";

import Link from "next/link";
import { ArrowRight, UploadSimple } from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";
import { useLocale } from "./locale-provider";

const serviceOptions = ["Packaging Design", "Label Design", "Industrial Sack Design", "Logo & Brand Identity", "Print Ready Artwork", "Packaging Revision", "Product Mockups"];
const industryOptions = ["Food & Beverage", "Ingredients", "Bakery & Confectionery", "Supplements", "Cosmetics", "Industrial", "Other"];
const countryOptions = ["Türkiye", "Germany", "Iran", "Iraq", "United Kingdom", "United States", "Other"];
const deliveryOptions = ["Standard", "Priority", "Flexible"] as const;

type Submission = { projectId: string; securePath: string } | null;

export function QuoteForm() {
  const { pick } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState("English");
  const [delivery, setDelivery] = useState<(typeof deliveryOptions)[number]>("Standard");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState<Submission>(null);

  async function submitForm(formElement: HTMLFormElement) {
    setLoading(true);
    setError("");
    const form = new FormData(formElement);
    form.set("preferredLanguage", language);
    form.set("preferredDelivery", delivery);
    files.forEach((file) => form.append("files", file));
    try {
      const response = await fetch("/api/quote", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit the request.");
      setSubmission({ projectId: payload.projectId, securePath: payload.securePath });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit the request.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitForm(event.currentTarget);
  }

  return (
    <form ref={formRef} className="quote-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">{pick("Name", "Ad Soyad")}</label>
        <input className="input" id="name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="company">{pick("Company", "Şirket")} <span className="optional">({pick("optional", "opsiyonel")})</span></label>
        <input className="input" id="company" name="company" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="whatsapp">WhatsApp <span className="optional">({pick("optional", "opsiyonel")})</span></label>
        <input className="input" id="whatsapp" name="whatsapp" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="country">{pick("Country", "Ülke")}</label>
        <select className="select" id="country" name="country" required defaultValue="">
          <option value="" disabled>{pick("Select country", "Ülke seçin")}</option>
          {countryOptions.map((country) => <option key={country}>{country}</option>)}
        </select>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="fieldset-label">{pick("Preferred language", "Tercih edilen dil")}</legend>
        <div className="choice-row">
          {["English", "Türkçe"].map((item) => <button className={`choice-button ${language === item ? "is-active" : ""}`} key={item} onClick={() => setLanguage(item)} type="button">{item}</button>)}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="service">{pick("Service", "Hizmet")}</label>
        <select className="select" id="service" name="service" required defaultValue="">
          <option value="" disabled>{pick("Select service", "Hizmet seçin")}</option>
          {serviceOptions.map((service) => <option key={service}>{service}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="industry">{pick("Industry", "Sektör")}</label>
        <select className="select" id="industry" name="industry" required defaultValue="">
          <option value="" disabled>{pick("Select industry", "Sektör seçin")}</option>
          {industryOptions.map((industry) => <option key={industry}>{industry}</option>)}
        </select>
      </div>
      <div className="field field--full">
        <label htmlFor="productName">{pick("Product name", "Ürün adı")}</label>
        <input className="input" id="productName" name="productName" required />
      </div>
      <div className="field">
        <label htmlFor="description">{pick("Project description", "Proje açıklaması")}</label>
        <textarea className="textarea" id="description" name="description" placeholder={pick("Briefly describe what you need.", "İhtiyacınızı kısaca anlatın.")} required />
      </div>
      <div style={{ display: "grid", gap: 32 }}>
        <div className="field">
          <span className="fieldset-label">{pick("Upload files", "Dosya yükle")}</span>
          <input ref={fileInput} hidden type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
          <button
            className="dropzone"
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <span><UploadSimple size={22} style={{ margin: "0 auto 10px" }} />{files.length ? `${files.length} ${pick("file(s) selected", "dosya seçildi")}` : pick("Choose files or drag them here", "Dosyaları seçin veya buraya sürükleyin")}</span>
          </button>
        </div>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="fieldset-label">{pick("Preferred delivery", "Teslimat tercihi")}</legend>
          <div className="choice-row choice-row--three">
            {deliveryOptions.map((item) => <button className={`choice-button ${delivery === item ? "is-active" : ""}`} key={item} onClick={() => setDelivery(item)} type="button">{item}</button>)}
          </div>
        </fieldset>
      </div>

      {error && <p className="form-message" role="alert">{error}</p>}
      {submission && (
        <div className="form-message" role="status">
          <strong>{pick("Request received.", "Talebiniz alındı.")} {submission.projectId}</strong>
          <span>{pick("Your secure project page has been created. Keep the link private.", "Güvenli proje sayfanız oluşturuldu. Bağlantıyı gizli tutun.")}</span>{" "}
          <Link className="text-link" href={submission.securePath}>{pick("Open project page", "Proje sayfasını aç")}<ArrowRight size={16} /></Link>
        </div>
      )}
      <button className="button button--orange quote-submit" type="button" disabled={loading} onClick={() => { const form = formRef.current; if (form?.reportValidity()) void submitForm(form); }}>{loading ? pick("Sending…", "Gönderiliyor…") : pick("Request a Quote", "Teklif İste")}</button>
    </form>
  );
}
