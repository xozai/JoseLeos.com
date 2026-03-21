import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY!);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  // 3 attempts per IP per hour
  const limited = await checkRateLimit(req, "subscribe", 3, 3600);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const { email } = result.data;

  try {
    if (!AUDIENCE_ID) {
      return NextResponse.json({ error: "Newsletter not configured." }, { status: 503 });
    }

    await resend.contacts.create({
      email,
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Resend returns a specific error if email already exists
    if (msg.toLowerCase().includes("already exists")) {
      return NextResponse.json({ alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
