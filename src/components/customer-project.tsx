"use client";

import { Check } from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { statusOrder, type ProjectStatus } from "@/lib/demo-data";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { useLocale } from "./locale-provider";

type Message = { id: string; date: string; time: string; author: string; text: string };
type ProjectFile = { id: string; name: string; date: string; meta: string; downloadUrl?: string };
type ProjectData = { code: string; product: string; company: string; status: ProjectStatus; messages: Message[]; files: ProjectFile[]; hasOpenRevision: boolean };

export function CustomerProject({ token }: { token: string }) {
  const { pick } = useLocale();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [message, setMessage] = useState("");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revision, setRevision] = useState("");
  const [notice, setNotice] = useState("");
  const messageInput = useRef<HTMLInputElement>(null);
  const revisionInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${encodeURIComponent(token)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setProject(data.project))
      .catch(() => setNotice(pick("This secure project link is invalid or has expired.", "Bu güvenli proje bağlantısı geçersiz veya süresi dolmuş.")));
  }, [token, pick]);

  const currentIndex = useMemo(() => project ? statusOrder.indexOf(project.status) : -1, [project]);

  async function sendMessage() {
    const text = (messageInput.current?.value ?? message).trim();
    if (!text || !project) return;
    const response = await fetch(`/api/projects/${encodeURIComponent(token)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "message", text }) });
    if (!response.ok) return setNotice(pick("Message could not be sent.", "Mesaj gönderilemedi."));
    const localId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `local-${Date.now()}`;
    const newMessage: Message = { id: localId, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), author: "Client", text };
    setProject({ ...project, messages: [...project.messages, newMessage] });
    setMessage("");
  }

  async function sendRevision() {
    const text = (revisionInput.current?.value ?? revision).trim();
    if (!text || !project) return;
    const response = await fetch(`/api/projects/${encodeURIComponent(token)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "revision", text }) });
    if (!response.ok) return setNotice(pick("Revision request could not be sent.", "Revizyon talebi gönderilemedi."));
    setProject({ ...project, hasOpenRevision: true });
    setRevision("");
    setRevisionOpen(false);
    setNotice(pick("Revision request sent.", "Revizyon talebi gönderildi."));
  }

  async function approveFinal() {
    if (!project || project.status !== "Waiting for Client") return;
    const response = await fetch(`/api/projects/${encodeURIComponent(token)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "final_approval" }) });
    if (response.ok) {
      setProject({ ...project, status: "Completed" });
      setNotice(pick("Final design approved.", "Final tasarım onaylandı."));
    }
  }

  if (!project) {
    return <><SiteHeader /><main className="shell customer-main"><p>{notice || pick("Loading project…", "Proje yükleniyor…")}</p></main><SiteFooter /></>;
  }

  return (
    <>
      <SiteHeader />
      <main className="customer-main">
        <div className="shell">
          <div className="customer-heading">
            <h1>{project.product}</h1>
            <p className="project-meta">{project.code} &nbsp;·&nbsp; {project.company}</p>
          </div>

          <div className="status-track" aria-label={`Project status: ${project.status}`}>
            {statusOrder.map((status, index) => {
              const done = index < currentIndex;
              const current = index === currentIndex;
              return (
                <div className={`status-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}`} key={status}>
                  <span className="status-node" aria-hidden>{done ? <Check size={18} weight="bold" /> : null}</span>
                  <span>{status}</span>
                </div>
              );
            })}
          </div>

          {notice && <p className="form-message" role="status">{notice}</p>}
          <div className="customer-grid">
            <section className="detail-section">
              <h2>{pick("Messages", "Mesajlar")}</h2>
              <ul className="message-list">
                {project.messages.map((item) => <li className="message-item" key={item.id}><time>{item.date} &nbsp; {item.time}</time><div><strong>{item.author}</strong><p>{item.text}</p></div></li>)}
              </ul>
              <form className="message-compose" onSubmit={(event: FormEvent) => { event.preventDefault(); void sendMessage(); }}><input ref={messageInput} className="input" aria-label="Write a message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={pick("Write a message…", "Mesaj yazın…")} /><button className="button button--ghost-orange" type="button" onClick={() => void sendMessage()}>{pick("Send Message", "Mesaj Gönder")}</button></form>
            </section>

            <section className="detail-section">
              <h2>{pick("Files", "Dosyalar")}</h2>
              <ul className="file-list">
                {project.files.map((file) => <li className="file-row" key={file.id}><a href={file.downloadUrl || `data:text/plain;charset=utf-8,ORTA%20Studio%20demo%20file`} download={file.name}>{file.name}</a><span>{file.date}</span><span>{file.meta}</span></li>)}
              </ul>
            </section>

            <section className="detail-section">
              <h2>{pick("Revision Requests", "Revizyon Talepleri")}</h2>
              <p className="revision-empty">{project.hasOpenRevision ? pick("A revision request is open.", "Açık bir revizyon talebi var.") : pick("No open revision requests.", "Açık revizyon talebi yok.")}</p>
              {revisionOpen ? <div className="field"><textarea ref={revisionInput} className="textarea" style={{ minHeight: 120 }} value={revision} onChange={(e) => setRevision(e.target.value)} placeholder={pick("Describe the revision you need.", "İstediğiniz revizyonu açıklayın.")} /><div style={{ display: "flex", gap: 10 }}><button className="button button--orange" type="button" onClick={sendRevision}>{pick("Send Request", "Talebi Gönder")}</button><button className="button" type="button" onClick={() => setRevisionOpen(false)}>{pick("Cancel", "İptal")}</button></div></div> : <button className="button" type="button" onClick={() => setRevisionOpen(true)} disabled={project.hasOpenRevision}>{pick("Request Revision", "Revizyon İste")}</button>}
            </section>

            <section className="detail-section">
              <h2>{pick("Final Approval", "Final Onay")}</h2>
              <p className="final-note">{pick("Final approval will be available when the project is ready for your review.", "Proje incelemeniz için hazır olduğunda final onay aktif olacaktır.")}</p>
              <button className="button" type="button" onClick={approveFinal} disabled={project.status !== "Waiting for Client"}>{pick("Approve Final Design", "Final Tasarımı Onayla")}</button>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
