import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? "insecure-dev-secret-change-me-32x");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("dc-admin-token")?.value;

  if (!token) {
    return pathname.startsWith("/api/admin/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, secret());
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.cookies.delete("dc-admin-token");
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
