"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Newspaper, Star, Swords, LogOut, LayoutDashboard } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Přehled", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Články", icon: Newspaper, exact: false },
  { href: "/admin/milestones", label: "Milníky", icon: Star, exact: false },
  { href: "/admin/matches", label: "Zápasy", icon: Swords, exact: false },
];

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.12)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: "hsl(var(--card)/0.7)",
      backdropFilter: "blur(16px)",
      borderRight: "1px solid hsl(var(--border))",
      display: "flex", flexDirection: "column",
      padding: "1.25rem 0",
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
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 8,
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? green : "hsl(var(--muted-foreground))",
              background: active ? greenBg : "transparent",
              border: `1px solid ${active ? greenBorder : "transparent"}`,
              textDecoration: "none", transition: "all .15s",
            }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

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
  const isLogin = pathname === "/admin/login";
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
