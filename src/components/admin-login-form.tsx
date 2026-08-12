"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLocale } from "./locale-provider";

export function AdminLoginForm() {
  const { pick } = useLocale();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function signIn(form: HTMLFormElement) {
    setLoading(true); setError("");
    const body = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) router.push("/admin");
    else { setError(pick("Sign-in failed.", "Giriş başarısız.")); setLoading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void signIn(event.currentTarget); }
  return <form ref={formRef} className="login-form" onSubmit={submit}><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" required /></div><div className="field"><label htmlFor="password">{pick("Password", "Şifre")}</label><input className="input" id="password" name="password" type="password" required /></div>{error && <p className="form-message" role="alert">{error}</p>}<button className="button button--orange" disabled={loading} type="button" onClick={() => { const form = formRef.current; if (form?.reportValidity()) void signIn(form); }}>{loading ? pick("Signing in…", "Giriş yapılıyor…") : pick("Sign in", "Giriş")}</button></form>;
}
