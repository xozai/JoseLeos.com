import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { type PostListItem } from "@/lib/types";

export default function PostCard({ post }: { post: PostListItem }) {
  const { slug, title, date, categories } = post;

  return (
    <article className="group py-8 border-b border-[--border]/40 flex justify-between items-center hover:bg-[--surface-low] px-4 -mx-4 transition-colors duration-200 cursor-pointer">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="text-[0.65rem] text-[--foreground-muted]">
            {formatDate(date)}
          </span>
          {categories.nodes[0] && (
            <Link
              href={`/blog/category/${categories.nodes[0].slug}`}
              className="text-[0.65rem] font-bold text-[--accent-blue] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {categories.nodes[0].name}
            </Link>
          )}
        </div>
        <Link href={`/blog/${slug}`}>
          <h3 className="font-black text-xl md:text-2xl tracking-tight group-hover:underline decoration-2 underline-offset-4">
            {title}
          </h3>
        </Link>
      </div>
      <ArrowUpRight
        size={24}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity duration-200 text-[--foreground-muted] ml-6"
      />
    </article>
  );
}
