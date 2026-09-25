"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight, UploadSimple } from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";
import { useLocale } from "./locale-provider";

const serviceOptions = ["Packaging Design", "Label Design", "Industrial Sack Design", "Logo & Brand Identity", "Print Ready Artwork", "Packaging Revision", "Product Mockups"];
const industryOptions = ["Food & Beverage", "Ingredients", "Bakery & Confectionery", "Supplements", "Cosmetics", "Industrial", "Other"];
const countryOptions = ["Türkiye", "Germany", "Iran", "Iraq", "United Kingdom", "United States", "Other"];
const deliveryOptions = ["Standard", "Priority", "Flexible"] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type Submission = { projectId: string; securePath: string } | null;
type UploadInstruction = { path: string; token: string };
type QuoteResponse = {
  error?: string;
  projectId?: string;
  securePath?: string;
  completionToken?: string;
  uploads?: UploadInstruction[];
  mode?: string;
};

async function readJsonResponse(response: Response): Promise<QuoteResponse> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as QuoteResponse;
  } catch {
    throw new Error(response.ok ? "Invalid server response." : `Request failed (${response.status}).`);
  }
}

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

  function acceptFiles(nextFiles: File[]) {
    const oversized = nextFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
      setError(pick(`Each file must be 5 MB or smaller. ${oversized.name} is too large.`, `Her dosya en fazla 5 MB olabilir. ${oversized.name} çok büyük.`));
      return;
    }
    setError("");
    setFiles(nextFiles);
  }

  async function submitForm(formElement: HTMLFormElement) {
    const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setError(pick(`Each file must be 5 MB or smaller. ${oversized.name} is too large.`, `Her dosya en fazla 5 MB olabilir. ${oversized.name} çok büyük.`));
      return;
    }

    setLoading(true);
    setError("");
    const form = new FormData(formElement);
    const requestBody = {
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
      email: String(form.get("email") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      country: String(form.get("country") ?? ""),
      preferredLanguage: language,
      service: String(form.get("service") ?? ""),
      industry: String(form.get("industry") ?? ""),
      productName: String(form.get("productName") ?? ""),
      description: String(form.get("description") ?? ""),
      preferredDelivery: delivery,
      files: files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
    };

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok) throw new Error(payload.error || "Unable to submit the request.");
      if (!payload.projectId || !payload.securePath) throw new Error("Invalid server response.");

      if (files.length && payload.mode !== "demo") {
        if (!payload.completionToken || payload.uploads?.length !== files.length) {
          throw new Error("Upload could not be prepared.");
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) throw new Error("File upload is temporarily unavailable.");
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const uploadedFiles = [];
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          const upload = payload.uploads[index];
          const { error: uploadError } = await supabase.storage
            .from("project-files")
            .uploadToSignedUrl(upload.path, upload.token, file, {
              contentType: file.type || undefined,
            });
          if (uploadError) throw new Error(`Unable to upload ${file.name}.`);
          uploadedFiles.push({
            path: upload.path,
            name: file.name,
            type: file.type,
            size: file.size,
          });
        }

        const completeResponse = await fetch("/api/quote", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completionToken: payload.completionToken, files: uploadedFiles }),
        });
        const completePayload = await readJsonResponse(completeResponse);
        if (!completeResponse.ok) throw new Error(completePayload.error || "Uploaded files could not be saved.");
      }

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
          <input ref={fileInput} hidden type="file" multiple onChange={(event) => acceptFiles(Array.from(event.target.files ?? []))} />
          <button
            className="dropzone"
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              acceptFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <span><UploadSimple size={22} style={{ margin: "0 auto 10px" }} />{files.length ? `${files.length} ${pick("file(s) selected", "dosya seçildi")}` : pick("Choose files or drag them here", "Dosyaları seçin veya buraya sürükleyin")}</span>
          </button>
          <span className="optional">{pick("Maximum 5 MB per file", "Dosya başına en fazla 5 MB")}</span>
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
