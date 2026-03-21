import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PostgresAdapter } from "@auth/pg-adapter";
import { Pool } from "pg";

export const OWNER_EMAIL = process.env.OWNER_EMAIL!;

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Resend({
      from: "auth@joseLeos.com",
      apiKey: process.env.AUTH_RESEND_KEY!,
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
