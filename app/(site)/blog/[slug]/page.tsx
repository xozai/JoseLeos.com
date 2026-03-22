import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import ProseContent from "@/components/blog/ProseContent";
import { blurProps } from "@/lib/image";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POST_BY_SLUG, GET_ALL_POST_SLUGS } from "@/lib/graphql/queries/posts";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import BookmarkButton from "@/components/ui/BookmarkButton";
import NewsletterCTA from "@/components/blog/NewsletterCTA";
import PostEngagement from "@/components/blog/PostEngagement";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ShareButtons from "@/components/blog/ShareButtons";
import { canAccess } from "@/lib/access";
import { auth } from "@/auth";
import type { PostFull } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await apolloClient.query({ query: GET_ALL_POST_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.posts?.nodes ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<PostFull | null> {
  try {
    const res = await apolloClient.query({
      query: GET_POST_BY_SLUG,
      variables: { slug },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return data?.post ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const readingTime = post.content ? estimateReadingTime(post.content) : "1 min read";
  const category = post.categories?.nodes[0]?.name ?? "";

  return {
    title: post.title,
    description: post.excerpt?.replace(/<[^>]+>/g, "").slice(0, 160) ?? "",
    openGraph: {
      type: "article",
      publishedTime: post.date,
      images: post.featuredImage
        ? [{ url: post.featuredImage.node.sourceUrl }]
        : [{
            url: `/api/og?title=${encodeURIComponent(post.title)}&type=blog&date=${encodeURIComponent(post.date)}&category=${encodeURIComponent(category)}&readingTime=${encodeURIComponent(readingTime)}`,
          }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const session = await auth();
  const visibility = post.acfVisibility?.visibility ?? "public";
  const allowed = await canAccess(visibility);
  if (!allowed) {
    if (!session) redirect("/login");
    else notFound();
  }

  const { title, content, date, categories, tags, featuredImage } = post;
  const readingTime = content ? estimateReadingTime(content) : "1 min read";

  return (
    <>
      <ReadingProgress />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 xl:flex xl:gap-12">
        <article className="min-w-0 flex-1">
          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: title,
                datePublished: date,
                author: { "@type": "Person", name: "Jose Leos" },
              }),
            }}
          />

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {categories.nodes.slice(0, 2).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-[--primary]/40 text-[--primary] hover:bg-[--primary]/10 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[--foreground] leading-tight mb-4">
              {title}
            </h1>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-[--foreground-muted]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readingTime}
                </span>
              </div>
              <BookmarkButton type="post" slug={slug} authenticated={!!session?.user} />
            </div>
          </header>

          {featuredImage && (
            <div className="mb-10 rounded-xl overflow-hidden aspect-video relative bg-[--background-secondary]">
              <Image
                src={featuredImage.node.sourceUrl}
                alt={featuredImage.node.altText || title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                {...blurProps}
              />
            </div>
          )}

          {/* Share bar — top (before article body) */}
          <ShareButtons title={title} slug={slug} />

          {content && <ProseContent html={content} />}

          {/* Tags */}
          {tags?.nodes && tags.nodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-[--border]">
              <Tag size={13} className="text-[--foreground-muted] shrink-0" />
              {tags.nodes.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/blog/tag/${tag.slug}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[--border] text-[--foreground-muted] hover:text-[--primary] hover:border-[--primary] transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share bar — bottom (after prose, before reactions) */}
          <ShareButtons title={title} slug={slug} />
          <PostEngagement slug={slug} authenticated={!!session?.user} />
          {categories.nodes[0] && (
            <RelatedPosts currentSlug={slug} categoryName={categories.nodes[0].name} />
          )}
          <NewsletterCTA />
        </article>

        {content && <TableOfContents content={content} />}
      </div>
    </>
  );
}
