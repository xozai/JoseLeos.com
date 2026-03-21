import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

// Lazily instantiated so missing env vars don't crash the build
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN ?? "";
const HUBSPOT_LIST_ID = process.env.HUBSPOT_NEWSLETTER_LIST_ID ?? "";

const schema = z.object({
  email: z.string().email(),
});

/**
 * Upserts a contact in HubSpot and adds them to the newsletter list.
 * Errors are non-fatal — failure here never blocks the successful response.
 */
async function syncToHubSpot(email: string): Promise<void> {
  if (!HUBSPOT_TOKEN) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
  };

  // 1. Upsert contact (idempotent — uses email as the dedup key)
  let contactId: string | undefined;
  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/upsert",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: { email, hs_email_optout: false },
          idProperty: "email",
        }),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as { id?: string };
      contactId = data.id;
    } else {
      console.error("[HubSpot] upsert failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[HubSpot] upsert error:", err);
  }

  // 2. Add to newsletter list
  if (contactId && HUBSPOT_LIST_ID) {
    try {
      const res = await fetch(
        `https://api.hubapi.com/crm/v3/lists/${HUBSPOT_LIST_ID}/memberships/add`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ recordIdsToAdd: [contactId] }),
        }
      );
      if (!res.ok) {
        console.error("[HubSpot] list add failed:", res.status, await res.text());
      }
    } catch (err) {
      console.error("[HubSpot] list add error:", err);
    }
  }
}

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

    await getResend().contacts.create({
      email,
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    });

    // Sync to HubSpot in the background — non-fatal
    syncToHubSpot(email).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Resend returns a specific error if email already exists
    if (msg.toLowerCase().includes("already exists")) {
      // Still try HubSpot sync for existing subscribers
      syncToHubSpot(email).catch(() => {});
      return NextResponse.json({ alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
