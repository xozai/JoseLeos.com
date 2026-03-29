import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import { stripHtml, truncate } from "@/lib/utils";
import type { PostListItem } from "@/lib/types";
import { SITE_URL as BASE } from "@/lib/site";

export const revalidate = 3600; // refresh hourly

export async function GET() {
  let posts: PostListItem[] = [];

  try {
    const res = await apolloClient.query({ query: GET_POSTS, variables: { first: 50 } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    const all: PostListItem[] = data?.posts?.nodes ?? [];
    // Only include public posts in the RSS feed
    posts = all.filter((p) => (p.acfVisibility?.visibility ?? "public") === "public");
  } catch {
    /* return empty feed on error */
  }

  const items = posts
    .map((post) => {
      const desc = truncate(post.excerpt ?? "", 200);
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${desc}]]></description>
      ${post.categories.nodes
        .map((c) => `<category><![CDATA[${c.name}]]></category>`)
        .join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jose Leos — Blog</title>
    <link>${BASE}</link>
    <description>Articles on design, development, and things Jose Leos is figuring out.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
