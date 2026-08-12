"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";
import { useLocale } from "./locale-provider";

export function TrackingForm() {
  const { pick } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [projectId, setProjectId] = useState("ORTA-260001");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function sendLink() {
    setState("loading");
    try {
      const code = inputRef.current?.value.trim().toUpperCase() || projectId;
      const response = await fetch("/api/tracking-link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: code }) });
      setState(response.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendLink();
  }

  return (
    <>
      <form className="tracking-form" onSubmit={submit}>
        <label htmlFor="projectId">Project ID</label>
        <input ref={inputRef} className="input" id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value.toUpperCase())} required />
        <button className="button button--orange" type="button" onClick={() => void sendLink()} disabled={state === "loading"}>
          {state === "loading" ? pick("Sending…", "Gönderiliyor…") : pick("Send Secure Link", "Güvenli Bağlantı Gönder")}<ArrowRight size={30} weight="thin" />
        </button>
      </form>
      <p className="tracking-helper">{pick("Your Project ID is generated when you submit a project request and is included in your confirmation email.", "Proje kimliğiniz, proje talebinizi gönderdiğinizde oluşturulur ve onay e-postanızda yer alır.")}</p>
      {state === "success" && <p className="tracking-success" role="status">{pick("If the Project ID matches our records, a secure link has been requested for the email on file.", "Proje kimliği kayıtlarımızla eşleşiyorsa, kayıtlı e-posta için güvenli bağlantı talebi oluşturuldu.")}</p>}
      {state === "error" && <p className="tracking-success" style={{ color: "#8d2424" }} role="alert">{pick("We couldn’t process that request. Please check the Project ID and try again.", "Bu talebi işleyemedik. Proje kimliğini kontrol edip tekrar deneyin.")}</p>}
    </>
  );
}
