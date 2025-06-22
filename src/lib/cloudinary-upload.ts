// lib/cloudinary-upload.ts
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Replace with your actual Cloudinary upload preset and cloud name
  formData.append("upload_preset", "Mediachats"); // Required if using unsigned upload
  formData.append("folder", "chatsmedia");

  const response = await fetch(`https://api.cloudinary.com/v1_1/dtdlgromw/auto/upload`, {

    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url as string; // This is the uploaded image/file URL
}
