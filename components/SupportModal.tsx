"use client";

import { useState } from "react";
import { X, Heart, CreditCard, Copy, Check, Send, ExternalLink } from "lucide-react";
import { useWinSize } from "@/hooks/useWinSize";
import { useAppNav } from "./AppContext";
import { t } from "@/lib/i18n";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function ContactForm({ subject, lang }: { subject?: string; lang: "cs"|"en"|"fr" }) {
  const [form, setForm] = useState<ContactFormState>({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: subject ?? "Zpráva z DC ELO" }),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.error ?? `HTTP ${res.status}`);
        setStatus("err");
      }
    } catch (e: any) {
      setErrMsg(e?.message ?? "Network error");
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div style={{ textAlign: "center", padding: "28px 16px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "hsl(142,65%,45%,0.12)", border: "1px solid hsl(142,65%,45%,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Check size={22} style={{ color: "hsl(142,65%,45%)" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 6 }}>{t(lang, "form_sent")}</div>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{t(lang, "form_sent_desc")}</div>
      </div>
    );
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 9,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--background))",
    color: "hsl(var(--foreground))",
    fontSize: 13, fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{t(lang, "form_name")}</label>
          <input required style={inp} placeholder={t(lang, "form_name_ph")} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{t(lang, "form_email")}</label>
          <input required type="email" style={inp} placeholder={t(lang, "form_email_ph")} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{t(lang, "form_phone")}</label>
        <input style={inp} placeholder={t(lang, "form_phone_ph")} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div>
        <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{t(lang, "form_message")}</label>
        <textarea required rows={4} style={{ ...inp, resize: "vertical", minHeight: 90 }} placeholder={t(lang, "form_message_ph")} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
      </div>
      {status === "err" && (
        <div style={{ fontSize: 11, color: "hsl(0,65%,55%)", fontFamily: "var(--font-mono)" }}>{t(lang, "form_error_prefix")} {errMsg || t(lang, "form_error_fallback")}</div>
      )}
      <button type="submit" disabled={status === "sending"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "none", fontSize: 13, fontWeight: 700, cursor: status === "sending" ? "wait" : "pointer", opacity: status === "sending" ? 0.7 : 1, fontFamily: "var(--font-body)" }}>
        <Send size={13} />{status === "sending" ? t(lang, "form_sending") : t(lang, "form_send")}
      </button>
    </form>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy} title="Kopírovat" style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 4px", borderRadius: 4, color: copied ? "hsl(142,65%,45%)" : "hsl(var(--muted-foreground))", display: "inline-flex", alignItems: "center" }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid hsl(var(--border)/0.3)" }}>
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "hsl(var(--foreground))" }}>
        {value}<CopyBtn text={value} />
      </span>
    </div>
  );
}

export default function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [payTab, setPayTab] = useState<"bank" | "paypal">("bank");
  const { wBp } = useWinSize();
  const { lang } = useAppNav();
  const isMobile = wBp === "xs" || wBp === "sm";

  if (!open) return null;

  const amber = "hsl(42,80%,52%)";
  const blue = "hsl(210,80%,55%)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "hsl(222 28% 5% / 0.72)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 201,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        pointerEvents: "none",
      }}>
        <div style={{
          width: "100%", maxWidth: 740, maxHeight: "90vh",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--card-border))",
          borderRadius: 20, overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "all",
          boxShadow: "0 24px 80px -12px hsl(0 0% 0% / 0.45)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid hsl(var(--border)/0.5)", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${amber}20`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px -4px ${amber}60`, flexShrink: 0 }}>
              <Heart size={18} style={{ color: amber }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }}>{t(lang, "sup_title")}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 3 }}>{t(lang, "sup_subtitle")}</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Payment panels */}
            <div>
              {/* Mobile tab switcher */}
              {isMobile && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {(["bank", "paypal"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPayTab(tab)}
                      style={{
                        flex: 1, padding: "9px 0", borderRadius: 10,
                        background: payTab === tab ? "hsl(var(--primary))" : "hsl(var(--muted)/0.6)",
                        color: payTab === tab ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                        border: payTab === tab ? "none" : "1px solid hsl(var(--border))",
                        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)",
                      }}
                    >
                      {tab === "bank" ? t(lang, "sup_bank_tab") : t(lang, "sup_paypal_tab")}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                {/* Bank account */}
                {(!isMobile || payTab === "bank") && (
                  <div style={{ borderRadius: 14, border: "1px solid hsl(var(--border))", padding: "16px", background: "hsl(var(--background))" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <CreditCard size={14} style={{ color: amber }} />
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t(lang, "sup_bank_title")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <img src="/QR.png" alt="QR kód — bankovní účet" style={{ width: 140, height: 140, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 6 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <InfoRow label={t(lang, "sup_owner")} value="Matthew Grygar" />
                    <InfoRow label={t(lang, "sup_account")} value="2640017029 / 3030" />
                    <InfoRow label={t(lang, "sup_iban")} value="CZ03 3030 0000 0026 4001 7029" />
                    <InfoRow label={t(lang, "sup_bic")} value="AIRACZP" />
                  </div>
                )}

                {/* PayPal */}
                {(!isMobile || payTab === "paypal") && (
                  <div style={{ borderRadius: 14, border: "1px solid hsl(var(--border))", padding: "16px", background: "hsl(var(--background))" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>P</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>PayPal</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <img src="/QR2.png" alt="QR kód — PayPal" style={{ width: 140, height: 140, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 6 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <InfoRow label="PayPal e-mail" value="matthew.grygar@seznam.cz" />
                    <div style={{ padding: "6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid hsl(var(--border)/0.3)" }}>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.06em" }}>PayPal Me</span>
                      <a href="https://paypal.me/GrailSeriesELO" target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: blue, textDecoration: "none" }}>
                        paypal.me/GrailSeriesELO <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thank you */}
            <div style={{ textAlign: "center", padding: "14px 20px", borderRadius: 12, background: `${amber}10`, border: `1px solid ${amber}25` }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: amber, marginBottom: 4 }}>{t(lang, "sup_thanks")}</div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.65 }}>
                {t(lang, "sup_thanks_desc")}
              </div>
            </div>

            {/* Other support */}
            <div style={{ borderRadius: 12, border: "1px solid hsl(var(--border))", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>{t(lang, "sup_other_title")}</div>
                  <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                    {t(lang, "sup_other_desc")}
                  </div>
                </div>
                <button onClick={() => setShowForm(f => !f)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: showForm ? "hsl(var(--primary)/0.15)" : "hsl(var(--muted)/0.7)", border: `1px solid ${showForm ? "hsl(var(--primary)/0.3)" : "hsl(var(--border))"}`, color: showForm ? "hsl(var(--primary))" : "hsl(var(--foreground))", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, fontFamily: "var(--font-body)", whiteSpace: "nowrap" as const }}>
                  <Send size={12} />{showForm ? t(lang, "sup_hide_form") : t(lang, "sup_write")}
                </button>
              </div>
              {showForm && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid hsl(var(--border)/0.5)" }}>
                  <ContactForm subject="Podpora / spolupráce z DC ELO" lang={lang} />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
