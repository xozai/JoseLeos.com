import { apolloClient } from "@/lib/graphql/client";
import { GET_ALL_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import type { RecommendationItem } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joseleos.com";

export const revalidate = 3600;

export async function GET() {
  let items: RecommendationItem[] = [];

  try {
    const res = await apolloClient.query({
      query: GET_ALL_RECOMMENDATIONS,
      variables: { first: 100 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    const all: RecommendationItem[] = data?.recommendations?.nodes ?? [];
    // Only public items in the feed
    items = all.filter((i) => (i.acfVisibility?.visibility ?? "public") === "public");
  } catch {
    /* return empty feed on error */
  }

  const xmlItems = items
    .map((item) => {
      const { category, rating, verdict, shortDescription } = item.recFields;
      const desc = verdict ?? shortDescription ?? "";
      const score = typeof rating === "number" && rating > 0
        ? (Math.round(rating) / 2).toFixed(1)
        : null;

      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${BASE}/recommendations/${item.slug}</link>
      <guid isPermaLink="true">${BASE}/recommendations/${item.slug}</guid>
      <pubDate>${new Date(item.date ?? Date.now()).toUTCString()}</pubDate>
      ${category ? `<category><![CDATA[${category}]]></category>` : ""}
      <description><![CDATA[${desc}]]></description>
      ${score ? `<jl:rating xmlns:jl="https://joseleos.com/ns/review">${score}/5</jl:rating>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:jl="https://joseleos.com/ns/review">
  <channel>
    <title>Jose Leos — Recommendations</title>
    <link>${BASE}/recommendations</link>
    <description>Honest picks: books, music, restaurants, tech, software, travel, and more.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/recommendations/feed.xml" rel="self" type="application/rss+xml"/>
    ${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
