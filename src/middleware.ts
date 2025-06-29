// middleware.ts

import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/inbox/:path*"], // Only apply to this path
};

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  try {
    const verifyRes = await fetch(`${req.nextUrl.origin}/api/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });

    const { valid } = await verifyRes.json();

    if (!valid) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}
