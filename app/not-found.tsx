import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[--background]">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-black text-[--primary] mb-4 leading-none">404</p>
        <h1 className="text-2xl font-bold text-[--foreground] mb-3">Page not found</h1>
        <p className="text-[--foreground-muted] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
