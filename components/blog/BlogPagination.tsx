import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  basePath: string;
  hasNextPage: boolean;
  endCursor: string | null;
  hasPrevPage: boolean;
}

export default function BlogPagination({
  basePath,
  hasNextPage,
  endCursor,
  hasPrevPage,
}: BlogPaginationProps) {
  if (!hasNextPage && !hasPrevPage) return null;

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[--border]">
      {hasPrevPage ? (
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted] transition-colors"
        >
          <ChevronLeft size={15} /> Newer posts
        </Link>
      ) : (
        <span />
      )}

      {hasNextPage && endCursor ? (
        <Link
          href={`${basePath}?after=${encodeURIComponent(endCursor)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted] transition-colors"
        >
          Older posts <ChevronRight size={15} />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
