"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Newspaper, Star, Swords, LogOut, Users, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

const green       = "hsl(152,72%,45%)";
const greenBg     = "hsl(152 72% 45% / 0.12)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

interface SyncMeta {
  status: "never" | "syncing" | "ok" | "error";
  syncedAt: string | null;
  count?: number;
  error?: string;
}

function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [meta,    setMeta]    = useState<SyncMeta | null>(null);

  useEffect(() => {
    fetch("/api/admin/sync")
      .then(r => r.json())
      .then(setMeta)
      .catch(() => null);
  }, []);

  async function handleSync() {
    setSyncing(true);
    setMeta(prev => prev ? { ...prev, status: "syncing" } : { status: "syncing", syncedAt: null });
    try {
      const res  = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      setMeta(data.ok ? { status: "ok", syncedAt: data.syncedAt, count: data.count } : { status: "error", syncedAt: null, error: data.error });
    } catch (e) {
      setMeta({ status: "error", syncedAt: null, error: String(e) });
    } finally {
      setSyncing(false);
    }
  }

  const fmtTime = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  };

  const statusColor = meta?.status === "ok" ? green
    : meta?.status === "error" ? "hsl(0,72%,55%)"
    : "hsl(var(--muted-foreground))";

  return (
    <div style={{ padding: "0 0.6rem 0.6rem", borderBottom: "1px solid hsl(var(--border))", marginBottom: 4 }}>
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          width: "100%", padding: "9px 10px", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: syncing ? "not-allowed" : "pointer",
          color: syncing ? "hsl(var(--muted-foreground))" : green,
          background: syncing ? "hsl(var(--muted)/0.08)" : greenBg,
          border: `1px solid ${syncing ? "transparent" : greenBorder}`,
          transition: "all .15s", opacity: syncing ? 0.7 : 1,
        }}
      >
        <RefreshCw size={13} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
        {syncing ? "Synchronizuji…" : "Sync dat"}
      </button>

      {/* Status row */}
      <div style={{ marginTop: 6, fontSize: 10, color: statusColor, display: "flex", alignItems: "center", gap: 4, paddingLeft: 2 }}>
        {meta?.status === "ok"     && <><CheckCircle2 size={10} />{fmtTime(meta.syncedAt)} · {meta.count} položek</>}
        {meta?.status === "error"  && <><AlertCircle  size={10} />Chyba synchronizace</>}
        {meta?.status === "syncing"&& <><RefreshCw    size={10} />Probíhá…</>}
        {(!meta || meta.status === "never") && <span style={{ color: "hsl(var(--muted-foreground))" }}>Data nebyla synchronizována</span>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  function NavLink({ href, label, icon: Icon, exact = false }: { href: string; label: string; icon: React.ElementType; exact?: boolean }) {
    const active = isActive(href, exact);
    return (
      <Link href={href} style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px", borderRadius: 8,
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? green : "hsl(var(--muted-foreground))",
        background: active ? greenBg : "transparent",
        border: `1px solid ${active ? greenBorder : "transparent"}`,
        textDecoration: "none", transition: "all .15s",
      }}>
        <Icon size={14} />
        {label}
      </Link>
    );
  }

  return (
    <aside style={{
      width: 210, flexShrink: 0,
      background: "hsl(var(--card)/0.7)",
      backdropFilter: "blur(16px)",
      borderRight: "1px solid hsl(var(--border))",
      display: "flex", flexDirection: "column",
      padding: "1.25rem 0",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 1.1rem 1.25rem", borderBottom: "1px solid hsl(var(--border))" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, letterSpacing: "0.05em", color: green }}>
          DC ELO
        </div>
        <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 1 }}>
          Admin
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0.75rem 0.6rem", display: "flex", flexDirection: "column", gap: 2 }}>
        <NavLink href="/admin"            label="Články"  icon={Newspaper} exact />
        <NavLink href="/admin/milestones" label="Milníky" icon={Star} />
        <NavLink href="/admin/matches"    label="Zápasy"  icon={Swords} />
        <NavLink href="/admin/players"    label="Hráči"   icon={Users} />
      </nav>

      {/* Sync button */}
      <div style={{ padding: "0 0.6rem 0.6rem", marginTop: "auto" }}>
        <SyncButton />
      </div>

      {/* Logout */}
      <div style={{ padding: "0 0.6rem", borderTop: "1px solid hsl(var(--border))", paddingTop: "0.75rem" }}>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          padding: "8px 10px", borderRadius: 8, border: "none",
          background: "none", cursor: "pointer", fontSize: 13,
          color: "hsl(var(--muted-foreground))", transition: "color .15s",
          fontFamily: "var(--font-body)",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}>
          <LogOut size={15} />
          Odhlásit se
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin  = pathname === "/admin/login";
  if (isLogin) return <>{children}</>;

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      <AdminNav />
      <main style={{
        flex: 1, minWidth: 0,
        overflowY: "auto",
        padding: "2rem 2.5rem",
        background: "hsl(var(--background))",
      }}>
        {children}
      </main>
    </div>
  );
}
