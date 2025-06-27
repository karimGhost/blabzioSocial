import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ status: "success" });
    res.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
