// app/api/og-html/route.ts

import { NextRequest } from "next/server";
import { getSecondAdminDb2 } from "@/lib/firebase-admin-second";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const secondAdminDb = getSecondAdminDb2();
  const snap = await secondAdminDb.collection("videos").doc(id).get();
  if (!snap.exists) {
    return new Response("Post not found", { status: 404 });
  }


 
  const post = snap.data();
  const author = post?.user.name || "Anonymous";
  const isVideo = post?.mediaType === "video";

  const title = post?.title || "Blabzio Post";
  const description = `${post?.description?.slice(0, 100) || "Check out this video!"} — by ${author}`;
  const image = Array.isArray(post?.url) && post?.url.length > 0
    ? post.url
    : "https://blabzio.vercel.app/icons/android-chrome-512x512.png";

  const url = `https://blabzio.vercel.app/videos/${id}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${url}" />
        <meta name="author" content="${author}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        ${isVideo ? `<meta property="og:video" content="${post.url}" />` : ""}
      </head>
      <body>
        Redirecting...
        <script>window.location.href = "${url}"</script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
