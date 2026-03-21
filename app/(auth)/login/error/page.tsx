import Link from "next/link";
import { AlertCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Server configuration error. Please contact the site owner.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The magic link has expired or has already been used.",
  Default: "An unexpected error occurred. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error ?? "Default"] ?? ERROR_MESSAGES.Default;

  return (
    <div className="w-full max-w-sm text-center">
      <div className="rounded-2xl border border-[--border] bg-[--background-secondary] p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-[--foreground] mb-2">Sign-in failed</h1>
        <p className="text-sm text-[--foreground-muted] mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[--primary] px-5 py-2 text-sm font-medium text-[--primary-foreground] hover:opacity-90 transition-opacity"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
