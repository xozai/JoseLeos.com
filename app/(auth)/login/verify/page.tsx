import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="rounded-2xl border border-[--border] bg-[--background-secondary] p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[--primary]/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-[--primary]" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-[--foreground] mb-2">Check your email</h1>
        <p className="text-sm text-[--foreground-muted] mb-6">
          We sent a magic link to your email address. Click it to sign in — it expires in 10 minutes.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-[--primary] hover:underline"
        >
          Use a different email
        </Link>
      </div>
    </div>
  );
}
