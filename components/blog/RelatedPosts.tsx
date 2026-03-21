import Link from "next/link";
import Image from "next/image";
import { blurProps } from "@/lib/image";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS_BY_CATEGORY } from "@/lib/graphql/queries/posts";
import { filterByAccess } from "@/lib/access";
import { formatDate } from "@/lib/utils";
import type { PostListItem } from "@/lib/types";

interface RelatedPostsProps {
  currentSlug: string;
  categoryName: string;
}

export default async function RelatedPosts({ currentSlug, categoryName }: RelatedPostsProps) {
  let posts: PostListItem[] = [];

  try {
    const res = await apolloClient.query({
      query: GET_POSTS_BY_CATEGORY,
      variables: { categoryName, first: 4 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    const all: PostListItem[] = data?.posts?.nodes ?? [];
    const visible = await filterByAccess(all);
    posts = visible.filter((p) => p.slug !== currentSlug).slice(0, 3);
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-[--border]">
      <h2 className="text-lg font-bold text-[--foreground] mb-5">Related Posts</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-[--border] overflow-hidden hover:border-[--primary] transition-colors"
          >
            {post.featuredImage && (
              <div className="aspect-video relative bg-[--background-secondary] overflow-hidden">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  {...blurProps}
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-xs text-[--foreground-muted] mb-1">{formatDate(post.date)}</p>
              <p className="text-sm font-medium text-[--foreground] group-hover:text-[--primary] transition-colors line-clamp-2">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
