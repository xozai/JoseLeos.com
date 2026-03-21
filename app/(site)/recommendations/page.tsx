import type { Metadata } from "next";
import RecCard from "@/components/recommendations/RecCard";
import GatedCard from "@/components/ui/GatedCard";
import { apolloClient } from "@/lib/graphql/client";
import { GET_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/auth";
import type { RecommendationItem, RecCategory } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Books, tools, apps, and resources I personally recommend.",
};

const CATEGORIES: { label: string; value: RecCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Books", value: "books" },
  { label: "Tools", value: "tools" },
  { label: "Apps", value: "apps" },
  { label: "Courses", value: "courses" },
  { label: "Podcasts", value: "podcasts" },
  { label: "Gear", value: "gear" },
];

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let items: RecommendationItem[] = [];

  try {
    const res = await apolloClient.query({ query: GET_RECOMMENDATIONS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    items = data?.recommendations?.nodes ?? [];
  } catch {
    /* show empty state */
  }

  const session = await auth();
  const visibleItems = items.filter((item) => {
    const v = item.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });

  const teaserItems = !session?.user
    ? items.filter((item) => item.acfVisibility?.visibility === "members")
    : [];

  const allAccessible = [...visibleItems, ...teaserItems];

  const filtered =
    !category || category === "all"
      ? allAccessible
      : allAccessible.filter((item) => item.recFields.category === category);

  const filteredVisible = filtered.filter((item) => visibleItems.includes(item));
  const filteredTeaser = filtered.filter((item) => teaserItems.includes(item));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Recommendations</h1>
        <p className="text-lg text-[--foreground-muted] max-w-xl">
          Things I genuinely use and recommend — no sponsored content, just honest picks.
        </p>
      </header>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map(({ label, value }) => (
          <a
            key={value}
            href={value === "all" ? "/recommendations" : `/recommendations?category=${value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              (value === "all" && !category) || category === value
                ? "bg-[--primary] text-[--primary-foreground] border-[--primary]"
                : "border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted]"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {filteredVisible.length > 0 || filteredTeaser.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisible.map((item) => (
            <RecCard key={item.slug} item={item} />
          ))}
          {filteredTeaser.map((item) => (
            <GatedCard key={item.slug} type="recommendation" />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-[--foreground-muted]">
          <p>No recommendations in this category yet.</p>
        </div>
      )}
    </div>
  );
}
