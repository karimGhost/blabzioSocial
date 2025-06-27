import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

// config using env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});



// Make sure .env.local includes:
// env
// Copy
// Edit
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { mediaUrl } = req.body;

    if (!mediaUrl) return res.status(400).json({ error: "Missing mediaUrl" });

    // Extract public_id from URL
    const parts = mediaUrl.split("/");
    const fileWithExtension = parts[parts.length - 1];
    const publicId = fileWithExtension.split(".")[0]; // e.g. abc123.jpg → abc123

    // You can optionally get folder name if you organize in folders
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" }); // or image

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    res.status(500).json({ error: "Failed to delete Cloudinary asset." });
  }
}
