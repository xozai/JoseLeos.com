import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apolloClient } from "@/lib/graphql/client";
import {
  GET_POSTS_BY_CATEGORY_PAGINATED,
  GET_ALL_CATEGORY_SLUGS,
} from "@/lib/graphql/queries/posts";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/auth";
import PostCard from "@/components/blog/PostCard";
import GatedCard from "@/components/ui/GatedCard";
import BlogPagination from "@/components/blog/BlogPagination";
import type { PostListItem } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await apolloClient.query({ query: GET_ALL_CATEGORY_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.categories?.nodes ?? [])
      .filter((c: { count: number }) => c.count > 0)
      .map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${label} — Blog`,
    description: `All posts in the ${label} category.`,
    alternates: { canonical: `/blog/category/${slug}` },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ after?: string }>;
}) {
  const { slug } = await params;
  const { after } = await searchParams;

  const label = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  let posts: PostListItem[] = [];
  let hasNextPage = false;
  let endCursor: string | null = null;

  try {
    const res = await apolloClient.query({
      query: GET_POSTS_BY_CATEGORY_PAGINATED,
      variables: { categoryName: slug, first: 20, after: after ?? null },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    posts = data?.posts?.nodes ?? [];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
    endCursor = data?.posts?.pageInfo?.endCursor ?? null;
  } catch {
    /* show empty state */
  }

  if (posts.length === 0 && !after) notFound();

  const session = await auth();
  const visiblePosts = posts.filter((p) => {
    const v = p.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });

  const teaserCount =
    !session?.user
      ? posts.filter((p) => p.acfVisibility?.visibility === "members").length
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      <header className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-[--primary] mb-2">
          Category
        </p>
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">{label}</h1>
        <p className="text-[--foreground-muted]">
          {visiblePosts.length + teaserCount} post{visiblePosts.length + teaserCount !== 1 ? "s" : ""}
        </p>
      </header>

      {visiblePosts.length > 0 || teaserCount > 0 ? (
        <div>
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
          {Array.from({ length: teaserCount }).map((_, i) => (
            <GatedCard key={`teaser-${i}`} type="post" className="mb-6" />
          ))}
          <BlogPagination
            basePath={`/blog/category/${slug}`}
            hasNextPage={hasNextPage}
            endCursor={endCursor}
            hasPrevPage={!!after}
          />
        </div>
      ) : (
        <p className="py-16 text-center text-[--foreground-muted] text-sm">
          No posts in this category yet.
        </p>
      )}
    </div>
  );
}
