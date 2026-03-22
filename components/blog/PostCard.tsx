import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { blurProps } from "@/lib/image";
import { type PostListItem } from "@/lib/types";

export default function PostCard({ post }: { post: PostListItem }) {
  const { slug, title, excerpt, date, categories, featuredImage } = post;

  return (
    <article className="group flex gap-5 py-6 border-b border-[--border] last:border-0">
      {featuredImage && (
        <Link
          href={`/blog/${slug}`}
          className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden relative bg-[--background-secondary]"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover"
            sizes="96px"
            {...blurProps}
          />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {categories.nodes.slice(0, 2).map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[--border] text-[--foreground-muted] hover:text-[--primary] hover:border-[--primary] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <span className="text-xs text-[--foreground-muted]">{formatDate(date)}</span>
        </div>
        <Link href={`/blog/${slug}`}>
          <h3 className="font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors leading-snug mb-1">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p
            className="text-sm text-[--foreground-muted] line-clamp-2"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}
      </div>
    </article>
  );
}
