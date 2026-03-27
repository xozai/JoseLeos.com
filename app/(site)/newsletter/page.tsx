import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ExternalLink, Rss } from "lucide-react";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS_BY_CATEGORY_PAGINATED } from "@/lib/graphql/queries/posts";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/auth";
import PostCard from "@/components/blog/PostCard";
import BlogPagination from "@/components/blog/BlogPagination";
import type { PostListItem } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Past issues of the Jose Leos newsletter — curated thoughts on design, development, and building things.",
  alternates: {
    canonical: "/newsletter",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const { after } = await searchParams;

  let posts: PostListItem[] = [];
  let hasNextPage = false;
  let endCursor: string | null = null;

  try {
    const res = await apolloClient.query({
      query: GET_POSTS_BY_CATEGORY_PAGINATED,
      variables: { categoryName: "newsletter", first: 20, after: after ?? null },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    posts = data?.posts?.nodes ?? [];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
    endCursor = data?.posts?.pageInfo?.endCursor ?? null;
  } catch {
    /* show empty state */
  }

  const session = await auth();
  const visiblePosts = posts.filter((p) => {
    const v = p.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://joseLeos.com" },
      { "@type": "ListItem", position: 2, name: "Newsletter", item: "https://joseLeos.com/newsletter" },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <header className="mb-12">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[--primary] mb-2">
          <Mail size={13} /> Newsletter
        </div>
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Archive</h1>
        <p className="text-lg text-[--foreground-muted] mb-6">
          Curated thoughts on design, development, and building things — delivered to your inbox.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contact#newsletter"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail size={14} /> Subscribe
          </Link>
          <a
            href="/blog/feed.xml"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted] transition-colors"
          >
            <Rss size={14} /> RSS Feed
          </a>
        </div>
      </header>

      {visiblePosts.length > 0 ? (
        <div>
          <p className="text-sm text-[--foreground-muted] mb-6 pb-6 border-b border-[--border]">
            {visiblePosts.length} issue{visiblePosts.length !== 1 ? "s" : ""}
            {hasNextPage ? "+" : ""} in the archive
          </p>
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
          <BlogPagination
            basePath="/newsletter"
            hasNextPage={hasNextPage}
            endCursor={endCursor}
            hasPrevPage={!!after}
          />
        </div>
      ) : (
        <div className="py-16 text-center border border-[--border] rounded-xl">
          <Mail size={32} className="mx-auto text-[--foreground-muted] mb-4 opacity-40" />
          <p className="text-[--foreground-muted] mb-2">No issues published yet.</p>
          <p className="text-sm text-[--foreground-muted]">
            Subscribe to be notified when the first one drops.
          </p>
          <Link
            href="/contact#newsletter"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] transition-colors"
          >
            Subscribe <ExternalLink size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
