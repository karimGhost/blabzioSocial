
export const runtime = "nodejs"; // ⬅️ This line is a MUST
import { adminAuth } from "@/lib/firebase-adminsdk";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {

  const { session } = await req.json();

  if (!session) {
    console.log("❌ No session received in API");
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    console.log("✅ decodedClaims:", decodedClaims);

    const allowedAdmins = ["VIA2YUNWVuaFUScvCIkyhpl1Bjy1"];
    const isAdmin = allowedAdmins.includes(decodedClaims.uid);

    console.log("UID:", decodedClaims.uid, "isAdmin:", isAdmin);
console.log("Checking UID:", decodedClaims.uid);

    return NextResponse.json({ valid: isAdmin });
  } catch (err) {
    console.error("❌ Session verification failed:", err);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
