import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShoppingCart, Calendar } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProseContent from "@/components/blog/ProseContent";
import ShareButtons from "@/components/blog/ShareButtons";
import BookmarkButton from "@/components/ui/BookmarkButton";
import StarRating from "@/components/recommendations/StarRating";
import PriceRange from "@/components/recommendations/PriceRange";
import { blurProps } from "@/lib/image";
import { apolloClient } from "@/lib/graphql/client";
import {
  GET_RECOMMENDATION_BY_SLUG,
  GET_ALL_RECOMMENDATION_SLUGS,
  GET_ALL_RECOMMENDATIONS,
} from "@/lib/graphql/queries/recommendations";
import { canAccess } from "@/lib/access";
import { auth } from "@/auth";
import type { RecommendationFull, RecommendationItem } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await apolloClient.query({ query: GET_ALL_RECOMMENDATION_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.recommendations?.nodes ?? []).map((r: { slug: string }) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

async function getRec(slug: string): Promise<RecommendationFull | null> {
  try {
    const res = await apolloClient.query({
      query: GET_RECOMMENDATION_BY_SLUG,
      variables: { slug },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return data?.recommendation ?? null;
  } catch {
    return null;
  }
}

async function getRelated(category: string, currentSlug: string): Promise<RecommendationItem[]> {
  try {
    const res = await apolloClient.query({
      query: GET_ALL_RECOMMENDATIONS,
      variables: { first: 4 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    const all: RecommendationItem[] = data?.recommendations?.nodes ?? [];
    return all
      .filter((r) => r.recFields.category === category && r.slug !== currentSlug)
      .slice(0, 3);
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
  const rec = await getRec(slug);
  if (!rec) return {};

  const description =
    rec.recFields.verdict ??
    rec.recFields.shortDescription ??
    rec.excerpt?.replace(/<[^>]+>/g, "").slice(0, 160) ??
    "";

  const ogImage = rec.featuredImage?.node?.sourceUrl
    ? [{ url: rec.featuredImage.node.sourceUrl }]
    : [{
        url: `/api/og?title=${encodeURIComponent(rec.title)}&type=review&category=${encodeURIComponent(rec.recFields.category ?? "")}`,
      }];

  return {
    title: rec.title,
    description,
    alternates: { canonical: `/recommendations/${slug}` },
    openGraph: { type: "article", images: ogImage },
  };
}

export default async function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rec = await getRec(slug);
  if (!rec) notFound();

  const session = await auth();
  const visibility = rec.acfVisibility?.visibility ?? "public";
  const allowed = await canAccess(visibility);
  if (!allowed) notFound();

  const {
    title, content, recFields, featuredImage,
  } = rec;
  const {
    category, subcategory, rating, priceRange, verdict,
    pros, cons, websiteUrl, purchaseUrl, affiliateLink,
    lastReviewed, itemImage,
  } = recFields;

  const coverSrc = featuredImage?.node?.sourceUrl ?? itemImage?.sourceUrl;
  const coverAlt = featuredImage?.node?.altText ?? itemImage?.altText ?? title;
  const buyUrl   = affiliateLink ?? purchaseUrl;
  const related  = category ? await getRelated(category, slug) : [];
  const base     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joseleos.com";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/recommendations"
        className="inline-flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Recommendations
      </Link>

      {/* Cover image */}
      {coverSrc && (
        <div className="mb-8 rounded-xl overflow-hidden aspect-video relative bg-[--background-secondary]">
          <Image
            src={coverSrc}
            alt={coverAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            {...blurProps}
          />
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {category    && <Badge variant="outline">{category}</Badge>}
        {subcategory && <Badge variant="outline">{subcategory}</Badge>}
        {lastReviewed && (
          <span className="flex items-center gap-1 text-xs text-[--foreground-muted]">
            <Calendar size={11} />
            Last reviewed {new Date(lastReviewed).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[--foreground] leading-tight mb-5">
        {title}
      </h1>

      {/* Rating / price / bookmark row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[--border]">
        <div className="flex items-center gap-4">
          {typeof rating === "number" && rating > 0 && (
            <StarRating rating={rating} size="lg" showLabel />
          )}
          {priceRange && <PriceRange range={priceRange} />}
        </div>
        <BookmarkButton type="post" slug={slug} authenticated={!!session?.user} />
      </div>

      {/* Share — top */}
      <ShareButtons title={title} slug={slug} section="recommendations" />

      {/* Verdict */}
      {verdict && (
        <div className="my-8 p-5 rounded-xl bg-[--background-secondary] border border-[--border]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[--foreground-muted] mb-2">
            Bottom Line
          </h2>
          <p className="text-[--foreground] leading-relaxed">{verdict}</p>
        </div>
      )}

      {/* Pros & Cons */}
      {((pros && pros.length > 0) || (cons && cons.length > 0)) && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-[--foreground] mb-4">Pros &amp; Cons</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {pros && pros.length > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--background] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                  Pros
                </p>
                <ul className="space-y-2">
                  {pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[--foreground]">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✅</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons && cons.length > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--background] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 dark:text-red-400 mb-3">
                  Cons
                </p>
                <ul className="space-y-2">
                  {cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[--foreground]">
                      <span className="text-red-500 mt-0.5 shrink-0">❌</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full review content from WP */}
      {content && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-[--foreground] mb-4">Full Review</h2>
          <ProseContent html={content} />
        </div>
      )}

      {/* Share — bottom */}
      <ShareButtons title={title} slug={slug} section="recommendations" />

      {/* Where to Get It */}
      {(websiteUrl || buyUrl) && (
        <div className="my-8 p-6 rounded-xl border border-[--border] bg-[--background-secondary]">
          <h2 className="text-lg font-bold text-[--foreground] mb-4">Where to Get It</h2>
          <div className="flex flex-wrap gap-3">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] hover:border-[--primary] transition-colors"
              >
                <ExternalLink size={14} />
                Official Website
              </a>
            )}
            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ShoppingCart size={14} />
                {affiliateLink ? "Get It (Affiliate)" : "Buy / Get It"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Related Recommendations */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[--border]">
          <h2 className="text-xl font-bold text-[--foreground] mb-6">
            More {category} Recommendations
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((item) => {
              const cover = item.featuredImage?.node?.sourceUrl ?? item.recFields.itemImage?.sourceUrl;
              return (
                <Link
                  key={item.slug}
                  href={`/recommendations/${item.slug}`}
                  className="group flex flex-col gap-2 rounded-xl border border-[--border] hover:border-[--primary] transition-colors overflow-hidden"
                >
                  <div className="aspect-video relative bg-[--background-secondary]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="33vw"
                        {...blurProps}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-[--foreground-muted] opacity-10">
                        {item.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-[--foreground] group-hover:text-[--primary] transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    {typeof item.recFields.rating === "number" && item.recFields.rating > 0 && (
                      <div className="mt-1.5">
                        <StarRating rating={item.recFields.rating} size="sm" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
