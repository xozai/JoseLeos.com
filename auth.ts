import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import { Resend as ResendClient } from "resend";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const OWNER_EMAIL = process.env.OWNER_EMAIL!;

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

const FROM =
  process.env.AUTH_EMAIL_FROM ?? `${SITE_NAME} <auth@joseleos.com>`;

function buildMagicLinkEmail(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#111111;border-radius:12px;border:1px solid #222222;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ededed;letter-spacing:-0.02em;">${SITE_NAME}</p>
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="height:1px;background-color:#222222;"></td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ededed;letter-spacing:-0.02em;">Sign in</p>
              <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;">
                Click the button below to sign in to ${new URL(SITE_URL).hostname}.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${url}" style="display:inline-block;padding:13px 28px;background-color:#6d28d9;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Sign in to ${SITE_NAME}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
                This link expires in 24&nbsp;hours. If you didn&rsquo;t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr><td style="height:1px;background-color:#222222;"></td></tr>
          <tr>
            <td style="padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#444444;">
                &copy; ${new Date().getFullYear()} ${SITE_NAME} &middot;
                <a href="${SITE_URL}" style="color:#555555;text-decoration:none;">${new URL(SITE_URL).hostname}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Resend({
      from: FROM,
      apiKey: process.env.AUTH_RESEND_KEY!,
      async sendVerificationRequest({ identifier: email, url }) {
        const apiKey = process.env.AUTH_RESEND_KEY;
        if (!apiKey) {
          console.warn("[auth] AUTH_RESEND_KEY not set — skipping magic-link email.");
          return;
        }
        const client = new ResendClient(apiKey);
        await client.emails.send({
          from: FROM,
          to: email,
          subject: `Sign in to ${SITE_NAME}`,
          html: buildMagicLinkEmail(url),
        });
      },
    }),
  ],
  callbacks: {
    session({ session }) {
      if (session.user) {
        session.user.isOwner = session.user.email === OWNER_EMAIL;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
});
