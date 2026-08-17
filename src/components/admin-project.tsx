"use client";

import { ArrowLeft, UploadSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { statusOrder, type ProjectStatus } from "@/lib/demo-data";
import { useLocale } from "./locale-provider";

export type AdminProjectData = {
  id: string; code: string; product: string; company: string; client: string; email: string; whatsapp: string; country: string;
  service: string; industry: string; preferredLanguage: string; preferredDelivery: string; description: string; status: ProjectStatus;
  messages: { id: string; date: string; time: string; author: string; text: string }[];
  files: { id: string; name: string; date: string; meta: string; downloadUrl?: string | null }[];
  hasOpenRevision: boolean;
};

export function AdminProject({ initialProject }: { initialProject: AdminProjectData }) {
  const { pick } = useLocale();
  const [project, setProject] = useState(initialProject);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const messageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function updateStatus(status: ProjectStatus) {
    const response = await fetch(`/api/admin/projects/${project.code.toLowerCase()}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "status", status }) });
    if (response.ok) { setProject({ ...project, status }); setNotice(""); }
    else setNotice(pick("Status could not be updated.", "Durum güncellenemedi."));
  }

  async function sendMessage() {
    const text = (messageInput.current?.value ?? message).trim();
    if (!text) return;
    const response = await fetch(`/api/admin/projects/${project.code.toLowerCase()}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "message", text }) });
    if (!response.ok) return setNotice(pick("Message could not be sent.", "Mesaj gönderilemedi."));
    const payload = await response.json().catch(() => ({}));
    const now = new Date();
    const localId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `local-${Date.now()}`;
    setProject({ ...project, messages: [...project.messages, { id: localId, date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), author: "ORTA Studio", text }] });
    setMessage("");
    setNotice(payload.notificationSent === false
      ? pick("Message saved, but the customer email notification could not be sent.", "Mesaj kaydedildi ancak müşteri e-posta bildirimi gönderilemedi.")
      : pick("Message sent and customer notified by email.", "Mesaj gönderildi ve müşteri e-posta ile bilgilendirildi."));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const form = new FormData();
    form.set("action", "upload");
    Array.from(files).forEach((file) => form.append("files", file));
    const response = await fetch(`/api/admin/projects/${project.code.toLowerCase()}`, { method: "POST", body: form });
    if (response.ok) setNotice(pick("File uploaded.", "Dosya yüklendi."));
    else setNotice(pick("File could not be uploaded.", "Dosya yüklenemedi."));
  }

  return (
    <main className="admin-project-main">
      <div className="shell">
        <Link className="back-link" href="/admin"><ArrowLeft size={18} />{pick("Projects", "Projeler")}</Link>
        <div className="project-heading-row">
          <div className="project-heading"><h1>{project.product}</h1><p className="project-meta">{project.code} &nbsp;·&nbsp; {project.company}</p></div>
          <div className="project-actions">
            <div className="field"><label htmlFor="projectStatus">{pick("Status", "Durum")}</label><select className="select" id="projectStatus" value={project.status} onChange={(e) => updateStatus(e.target.value as ProjectStatus)}>{statusOrder.map((status) => <option key={status}>{status}</option>)}</select></div>
            <button className="button" type="button" onClick={() => updateStatus("Completed")} disabled={project.status === "Completed"}>{pick("Mark as Completed", "Tamamlandı Olarak İşaretle")}</button>
          </div>
        </div>
        {notice && <p className="form-message">{notice}</p>}
        <div className="detail-grid">
          <section className="detail-section">
            <h2>{pick("Project Brief", "Proje Briefi")}</h2>
            <dl className="detail-list"><dt>{pick("Service", "Hizmet")}</dt><dd>{project.service}</dd><dt>{pick("Industry", "Sektör")}</dt><dd>{project.industry}</dd><dt>{pick("Product", "Ürün")}</dt><dd>{project.product}</dd><dt>{pick("Preferred Language", "Tercih Edilen Dil")}</dt><dd>{project.preferredLanguage}</dd><dt>{pick("Preferred Delivery", "Teslimat Tercihi")}</dt><dd>{project.preferredDelivery}</dd><dt>{pick("Project Description", "Proje Açıklaması")}</dt><dd style={{ whiteSpace: "pre-line" }}>{project.description}</dd></dl>
          </section>
          <section className="detail-section">
            <h2>{pick("Client", "Müşteri")}</h2>
            <dl className="detail-list"><dt>{pick("Name", "Ad Soyad")}</dt><dd>{project.client}</dd><dt>{pick("Company", "Şirket")}</dt><dd>{project.company}</dd><dt>Email</dt><dd>{project.email}</dd><dt>WhatsApp</dt><dd>{project.whatsapp || pick("Optional / not provided", "Opsiyonel / verilmedi")}</dd><dt>{pick("Country", "Ülke")}</dt><dd>{project.country}</dd></dl>
          </section>
          <section className="detail-section">
            <h2>{pick("Messages", "Mesajlar")}</h2>
            <ul className="message-list">{project.messages.map((item) => <li className="message-item" key={item.id}><time>{item.date} &nbsp; {item.time}</time><div><strong>{item.author}</strong><p>{item.text}</p></div></li>)}</ul>
            <form className="message-compose" onSubmit={(event: FormEvent) => { event.preventDefault(); void sendMessage(); }}><input ref={messageInput} className="input" aria-label="Write a message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={pick("Write a message…", "Mesaj yazın…")} /><button className="button button--ghost-orange" type="button" onClick={() => void sendMessage()}>{pick("Send Message", "Mesaj Gönder")}</button></form>
          </section>
          <section className="detail-section">
            <h2>{pick("Files", "Dosyalar")}</h2>
            <ul className="file-list">{project.files.map((file) => <li className="file-row" key={file.id}><span>{file.downloadUrl ? <a href={file.downloadUrl}>{file.name}</a> : file.name}</span><span>{file.date}</span><span>{file.meta}</span></li>)}</ul>
            <input ref={fileInput} hidden multiple type="file" onChange={(e) => uploadFiles(e.target.files)} />
            <button className="button" type="button" style={{ marginTop: 14 }} onClick={() => fileInput.current?.click()}><UploadSimple size={18} />{pick("Upload File", "Dosya Yükle")}</button>
          </section>
          <section className="detail-section">
            <h2>{pick("Revision Requests", "Revizyon Talepleri")}</h2>
            <p className="revision-empty">{project.hasOpenRevision ? pick("An open revision request needs review.", "İncelenmesi gereken açık bir revizyon talebi var.") : pick("No open revision requests.", "Açık revizyon talebi yok.")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
