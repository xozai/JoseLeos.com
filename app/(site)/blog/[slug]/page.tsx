import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POST_BY_SLUG, GET_ALL_POST_SLUGS } from "@/lib/graphql/queries/posts";
import { formatDate, estimateReadingTime } from "@/lib/utils";
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

  return {
    title: post.title,
    description: post.excerpt?.replace(/<[^>]+>/g, "").slice(0, 160) ?? "",
    openGraph: {
      type: "article",
      publishedTime: post.date,
      images: post.featuredImage
        ? [{ url: post.featuredImage.node.sourceUrl }]
        : [{ url: `/api/og?title=${encodeURIComponent(post.title)}&type=blog` }],
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

  const visibility = post.acfVisibility?.visibility ?? "public";
  const allowed = await canAccess(visibility);
  if (!allowed) {
    const session = await auth();
    if (!session) redirect("/login");
    else notFound();
  }

  const { title, content, date, categories, featuredImage } = post;
  const readingTime = content ? estimateReadingTime(content) : "1 min read";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {categories.nodes.slice(0, 2).map((cat) => (
            <Badge key={cat.slug} variant="outline">{cat.name}</Badge>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[--foreground] leading-tight mb-4">
          {title}
        </h1>

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
          />
        </div>
      )}

      {content && (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </article>
  );
}
