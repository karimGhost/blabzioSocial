// /app/api/verify-session/route.ts (or /pages/api/verify-session.ts if using Pages router)
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { session } = await req.json();

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);

    const allowedAdmins = ["VIA2YUNWVuaFUScvCIkyhpl1Bjy1"];
    const isAdmin = allowedAdmins.includes(decodedClaims.uid);

    return NextResponse.json({ valid: isAdmin });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
