import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";
import RecCard from "@/components/recommendations/RecCard";
import StarRating from "@/components/recommendations/StarRating";
import PriceRange from "@/components/recommendations/PriceRange";
import GatedCard from "@/components/ui/GatedCard";
import Badge from "@/components/ui/Badge";
import { apolloClient } from "@/lib/graphql/client";
import { GET_ALL_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/auth";
import { blurProps } from "@/lib/image";
import type { RecommendationItem } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recommendations | Jose Leos",
  description: "Books, music, restaurants, tech, software, and more — honest picks with ratings, pros/cons, and where to get them.",
  alternates: {
    canonical: "/recommendations",
    types: {
      "application/rss+xml": "/recommendations/feed.xml",
    },
  },
};

async function getItems(): Promise<RecommendationItem[]> {
  try {
    const res = await apolloClient.query({ query: GET_ALL_RECOMMENDATIONS, variables: { first: 200 } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return data?.recommendations?.nodes ?? [];
  } catch {
    return [];
  }
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; view?: string }>;
}) {
  const { category, view } = await searchParams;
  const isListView = view === "list";

  const allItems = await getItems();
  const session  = await auth();

  // Access control
  const visibleItems = allItems.filter((item) => {
    const v = item.acfVisibility?.visibility ?? "public";
    if (v === "public")  return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });
  const teaserItems = !session?.user
    ? allItems.filter((i) => i.acfVisibility?.visibility === "members")
    : [];

  // Derive categories from actual data
  const categories = ["All", ...Array.from(
    new Set(allItems.map((i) => i.recFields.category).filter(Boolean))
  ).sort()];

  // Filter by category
  const matchesCat = (item: RecommendationItem) =>
    !category || category === "All"
      ? true
      : item.recFields.category === category;

  const filteredVisible = visibleItems.filter(matchesCat);
  const filteredTeaser  = teaserItems.filter(matchesCat);

  // Featured items (always shown first in grid view)
  const featured  = filteredVisible.filter((i) => i.recFields.featured);
  const rest       = filteredVisible.filter((i) => !i.recFields.featured);

  const activeCat = category || "All";
  const baseHref  = (cat: string) =>
    cat === "All"
      ? `/recommendations${isListView ? "?view=list" : ""}`
      : `/recommendations?category=${encodeURIComponent(cat)}${isListView ? "&view=list" : ""}`;

  const viewToggleHref = (newView: "grid" | "list") => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (newView === "list") params.set("view", "list");
    const qs = params.toString();
    return `/recommendations${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Recommendations</h1>
        <p className="text-lg text-[--foreground-muted] max-w-xl">
          Things I genuinely use and love — books, music, restaurants, tech, software, travel, and more.
          No sponsored content, just honest picks.
        </p>
      </header>

      {/* Toolbar: category tabs + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={baseHref(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCat === cat
                  ? "bg-[--primary] text-[--primary-foreground] border-[--primary]"
                  : "border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Grid / List toggle */}
        <div className="flex items-center gap-1 border border-[--border] rounded-lg p-0.5 shrink-0">
          <Link
            href={viewToggleHref("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              !isListView ? "bg-[--background-secondary] text-[--foreground]" : "text-[--foreground-muted] hover:text-[--foreground]"
            }`}
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </Link>
          <Link
            href={viewToggleHref("list")}
            className={`p-1.5 rounded-md transition-colors ${
              isListView ? "bg-[--background-secondary] text-[--foreground]" : "text-[--foreground-muted] hover:text-[--foreground]"
            }`}
            title="List view"
          >
            <List size={15} />
          </Link>
        </div>
      </div>

      {/* Featured banner (grid view only) */}
      {!isListView && featured.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[--foreground-muted] mb-4">
            Featured Picks
          </h2>
          <div className="space-y-3">
            {featured.map((item) => (
              <Link
                key={item.slug}
                href={`/recommendations/${item.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-l-4 border-[--border] border-l-[--primary] bg-[--background] hover:bg-[--background-secondary] transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[--background-secondary] border border-[--border] overflow-hidden relative shrink-0">
                  {(item.featuredImage?.node?.sourceUrl ?? item.recFields.itemImage?.sourceUrl) ? (
                    <Image
                      src={(item.featuredImage?.node?.sourceUrl ?? item.recFields.itemImage?.sourceUrl)!}
                      alt={item.featuredImage?.node?.altText ?? item.recFields.itemImage?.altText ?? item.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                      {...blurProps}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[--foreground-muted]">
                      {item.title.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.recFields.category && <Badge variant="outline">{item.recFields.category}</Badge>}
                    <span className="text-[10px] font-semibold text-[--primary]">⭐ Featured</span>
                  </div>
                  <p className="text-sm font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors truncate">
                    {item.title}
                  </p>
                  {(item.recFields.verdict ?? item.recFields.shortDescription) && (
                    <p className="text-xs text-[--foreground-muted] truncate">
                      {item.recFields.verdict ?? item.recFields.shortDescription}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  {typeof item.recFields.rating === "number" && item.recFields.rating > 0 && (
                    <StarRating rating={item.recFields.rating} size="sm" showLabel />
                  )}
                  {item.recFields.priceRange && <PriceRange range={item.recFields.priceRange} />}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      {filteredVisible.length === 0 && filteredTeaser.length === 0 ? (
        <div className="py-24 text-center text-[--foreground-muted]">
          <p>No recommendations in this category yet.</p>
        </div>
      ) : isListView ? (
        /* ── List view ── */
        <div className="divide-y divide-[--border]">
          {[...(featured.length > 0 ? filteredVisible : rest), ...filteredTeaser.map(() => null)].map((item, idx) => {
            if (!item) return <GatedCard key={`teaser-${idx}`} type="recommendation" className="my-3" />;
            const cover = item.featuredImage?.node?.sourceUrl ?? item.recFields.itemImage?.sourceUrl;
            return (
              <Link
                key={item.slug}
                href={`/recommendations/${item.slug}`}
                className="group flex items-center gap-4 py-4 hover:bg-[--background-secondary] -mx-2 px-2 rounded-lg transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-[--background-secondary] border border-[--border] overflow-hidden relative shrink-0">
                  {cover ? (
                    <Image src={cover} alt={item.title} fill className="object-cover" sizes="64px" {...blurProps} />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[--foreground-muted]">
                      {item.title.charAt(0)}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {item.recFields.category && <Badge variant="outline">{item.recFields.category}</Badge>}
                    {item.recFields.featured && (
                      <span className="text-[10px] font-semibold text-[--primary]">⭐ Featured</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors truncate">
                    {item.title}
                  </p>
                  {(item.recFields.verdict ?? item.recFields.shortDescription) && (
                    <p className="text-xs text-[--foreground-muted] truncate mt-0.5">
                      {item.recFields.verdict ?? item.recFields.shortDescription}
                    </p>
                  )}
                </div>
                {/* Rating + price */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  {typeof item.recFields.rating === "number" && item.recFields.rating > 0 && (
                    <StarRating rating={item.recFields.rating} size="sm" showLabel />
                  )}
                  {item.recFields.priceRange && <PriceRange range={item.recFields.priceRange} />}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ── Grid view ── */
        <>
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((item) => <RecCard key={item.slug} item={item} />)}
              {filteredTeaser.map((_, i) => <GatedCard key={`teaser-${i}`} type="recommendation" />)}
            </div>
          )}
          {rest.length === 0 && filteredTeaser.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeaser.map((_, i) => <GatedCard key={`teaser-${i}`} type="recommendation" />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
