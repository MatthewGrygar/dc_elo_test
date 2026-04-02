"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.12)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Přihlášení selhalo.");
      }
    } catch {
      setError("Chyba sítě. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "hsl(var(--background))",
    }}>
      <div style={{
        width: "100%", maxWidth: 380, padding: "2.5rem 2rem",
        background: "hsl(var(--card)/0.8)", backdropFilter: "blur(20px)",
        border: `1px solid ${greenBorder}`, borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,.4)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: greenBg, border: `1px solid ${greenBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <Lock size={22} color={green} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800,
            letterSpacing: "-0.03em", color: "hsl(var(--foreground))", marginBottom: 4,
          }}>
            DC ELO Admin
          </h1>
          <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Přihlaste se pro přístup do administrace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Password */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", display: "block", marginBottom: 6 }}>
              Heslo
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                style={{
                  width: "100%", padding: "10px 38px 10px 12px",
                  background: "hsl(var(--muted)/0.5)",
                  border: `1px solid ${error ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
                  borderRadius: 10, fontSize: 14,
                  color: "hsl(var(--foreground))", outline: "none",
                  fontFamily: "var(--font-body)",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = green; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? "hsl(var(--destructive))" : "hsl(var(--border))"; }}
              />
              <button type="button" onClick={() => setShow((s) => !s)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 2,
                color: "hsl(var(--muted-foreground))",
              }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "8px 12px", borderRadius: 8,
              background: "hsl(var(--destructive)/0.12)",
              border: "1px solid hsl(var(--destructive)/0.3)",
              fontSize: 12, color: "hsl(var(--destructive))",
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            padding: "11px", borderRadius: 10,
            background: loading ? greenBg : green,
            color: loading ? green : "#000",
            fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)", transition: "all .15s",
            border: `1px solid ${greenBorder}`,
          }}>
            {loading ? "Přihlašuji…" : "Přihlásit se"}
          </button>
        </form>
      </div>
    </div>
  );
}
