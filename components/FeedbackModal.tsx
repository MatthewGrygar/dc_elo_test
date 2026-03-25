"use client";

import { useState } from "react";
import { X, MessageSquarePlus, Check, Send, Bug, Lightbulb, Sparkles, Pencil } from "lucide-react";

type Category = "bug" | "feature" | "improvement" | "idea";

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; color: string }[] = [
  { id: "bug",         label: "Chyba",       icon: Bug,             color: "hsl(0,65%,55%)"    },
  { id: "feature",     label: "Nová funkce",  icon: Sparkles,        color: "hsl(262,70%,60%)"  },
  { id: "improvement", label: "Úprava",       icon: Pencil,          color: "hsl(210,75%,55%)"  },
  { id: "idea",        label: "Nápad",        icon: Lightbulb,       color: "hsl(42,88%,52%)"   },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 9,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
  fontSize: 13, fontFamily: "var(--font-body)",
  outline: "none", boxSizing: "border-box",
};

export default function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<Category>("idea");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [message, setMessage]   = useState("");
  const [status, setStatus]     = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg]     = useState("");

  if (!open) return null;

  const accent = "hsl(262,70%,60%)";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const cat = CATEGORIES.find(c => c.id === category)!;
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone: "", message,
          subject: `[Feedback — ${cat.label}] DC ELO`,
        }),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrMsg(data.error ?? `HTTP ${res.status}`);
        setStatus("err");
      }
    } catch (err: any) {
      setErrMsg(err?.message ?? "Network error");
      setStatus("err");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "hsl(222 28% 5% / 0.72)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
      />

      {/* Modal */}
      <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{
          width: "100%", maxWidth: 520, maxHeight: "90vh",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--card-border))",
          borderRadius: 20, overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "all",
          boxShadow: "0 24px 80px -12px hsl(0 0% 0% / 0.45)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid hsl(var(--border)/0.5)", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `hsl(262,70%,60%,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px -4px hsl(262,70%,60%,0.4)`, flexShrink: 0 }}>
              <MessageSquarePlus size={18} style={{ color: accent }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }}>Zpětná vazba</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", marginTop: 3 }}>Pomoz nám aplikaci zlepšovat</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted)/0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Beta notice */}
            <div style={{ borderRadius: 12, padding: "14px 16px", background: `hsl(262,70%,60%,0.07)`, border: `1px solid hsl(262,70%,60%,0.2)` }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", color: accent, marginBottom: 6 }}>Aplikace je v beta verzi</div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.7 }}>
                DC ELO je momentálně v testovacím provozu a aktivně ho rozvíjíme. Jaká data ti tu chybí? Co bys přidal nebo odebral? Napadl tě zajímavý rekord, achievement nebo tag pro hráče? Nebo jsi narazil na chybu? Každý podnět je pro nás cenný — budeme moc rádi, pokud ho tu zanecháš.
              </div>
            </div>

            {status === "ok" ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "hsl(142,65%,45%,0.12)", border: "1px solid hsl(142,65%,45%,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check size={24} style={{ color: "hsl(142,65%,45%)" }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 6 }}>Díky za feedback!</div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>Tvůj podnět jsme dostali a pečlivě ho zvážíme.</div>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Category selector */}
                <div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Typ feedbacku</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                            border: `1px solid ${active ? cat.color : "hsl(var(--border))"}`,
                            background: active ? "hsl(var(--muted)/0.7)" : "hsl(var(--muted)/0.4)",
                            color: active ? cat.color : "hsl(var(--muted-foreground))",
                            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                            transition: "all 0.15s", textAlign: "left",
                            boxShadow: active ? `0 0 0 1px ${cat.color}` : "none",
                          }}
                        >
                          <Icon size={14} style={{ flexShrink: 0 }} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name + email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>JMÉNO *</label>
                    <input required style={inp} placeholder="Jan Novák" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>E-MAIL *</label>
                    <input required type="email" style={inp} placeholder="jan@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>TVŮJ FEEDBACK *</label>
                  <textarea
                    required rows={5}
                    style={{ ...inp, resize: "vertical", minHeight: 110 }}
                    placeholder="Popiš svůj nápad, chybu nebo připomínku…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>

                {status === "err" && (
                  <div style={{ fontSize: 11, color: "hsl(0,65%,55%)", fontFamily: "var(--font-mono)" }}>Chyba: {errMsg || "Odeslání selhalo"}</div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: status === "sending" ? "wait" : "pointer", opacity: status === "sending" ? 0.7 : 1, fontFamily: "var(--font-body)" }}
                >
                  <Send size={13} />{status === "sending" ? "Odesílám…" : "Odeslat feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
