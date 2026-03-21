import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { type PostListItem } from "@/lib/types";

export default function PostCard({ post }: { post: PostListItem }) {
  const { slug, title, excerpt, date, categories, featuredImage } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex gap-5 py-6 border-b border-[--border] last:border-0"
    >
      {featuredImage && (
        <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden relative bg-[--background-secondary]">
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {categories.nodes.slice(0, 2).map((cat) => (
            <Badge key={cat.slug} variant="outline">
              {cat.name}
            </Badge>
          ))}
          <span className="text-xs text-[--foreground-muted]">{formatDate(date)}</span>
        </div>
        <h3 className="font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors leading-snug mb-1">
          {title}
        </h3>
        {excerpt && (
          <p
            className="text-sm text-[--foreground-muted] line-clamp-2"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}
      </div>
    </Link>
  );
}
