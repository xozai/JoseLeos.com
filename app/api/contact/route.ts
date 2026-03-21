import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(20),
  honeypot: z.string().max(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "contact@joseLeos.com",
      to: process.env.CONTACT_EMAIL_TO ?? "jose@joseLeos.com",
      replyTo: data.email,
      subject: `[joseLeos.com] ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
