import { NextRequest, NextResponse } from "next/server";

const botUserAgents = [
  "facebookexternalhit",
  "Twitterbot",
  "Pinterest",
  "Slackbot-LinkExpanding",
  "TelegramBot",
  "WhatsApp",
];

// Runs for all matched routes
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 🧠 Handle bot requests for Open Graph previews
  const ua = req.headers.get("user-agent") || "";
  const isBot = botUserAgents.some(bot => ua.includes(bot));
  const isPostPage = pathname.startsWith("/feed/");

  if (isBot && isPostPage) {
    const id = pathname.split("/feed/")[1];
    return NextResponse.rewrite(new URL(`/api/og-html?id=${id}`, req.url));
  }

  // 🔐 Handle admin session check for /admin/inbox
  if (pathname.startsWith("/admin/inbox")) {
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
    } catch (err) {
      console.error("Middleware error:", err);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

// 👇 Only match what we care about
export const config = {
  matcher: ["/admin/inbox/:path*", "/feed/:path*"],
};
