import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, message } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: "abdulkarimkassimsalim@gmail.com", // 🔁 Change to your support email
      subject: "New Support Message",
      html: `
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
