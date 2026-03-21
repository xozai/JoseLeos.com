import type { MetadataRoute } from "next";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POST_SLUGS_WITH_DATES } from "@/lib/graphql/queries/posts";
import { GET_PROJECT_SLUGS_WITH_DATES } from "@/lib/graphql/queries/projects";

const BASE = "https://joseLeos.com";
const now = new Date();

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE,                          lastModified: now, priority: 1.0,  changeFrequency: "weekly"  },
  { url: `${BASE}/portfolio`,           lastModified: now, priority: 0.9,  changeFrequency: "weekly"  },
  { url: `${BASE}/blog`,                lastModified: now, priority: 0.9,  changeFrequency: "daily"   },
  { url: `${BASE}/recommendations`,     lastModified: now, priority: 0.8,  changeFrequency: "weekly"  },
  { url: `${BASE}/about`,               lastModified: now, priority: 0.7,  changeFrequency: "monthly" },
  { url: `${BASE}/uses`,                lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE}/now`,                 lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE}/resume`,              lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE}/speaking`,            lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE}/contact`,             lastModified: now, priority: 0.5,  changeFrequency: "yearly"  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [postsRes, projectsRes] = await Promise.all([
      apolloClient.query({ query: GET_POST_SLUGS_WITH_DATES }),
      apolloClient.query({ query: GET_PROJECT_SLUGS_WITH_DATES }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postsData = postsRes.data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsData = projectsRes.data as any;

    const postRoutes: MetadataRoute.Sitemap = (postsData?.posts?.nodes ?? []).map(
      (p: { slug: string; modified?: string }) => ({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: p.modified ? new Date(p.modified) : now,
        priority: 0.7,
        changeFrequency: "monthly" as const,
      })
    );

    const projectRoutes: MetadataRoute.Sitemap = (
      projectsData?.portfolioProjects?.nodes ?? []
    ).map((p: { slug: string; modified?: string }) => ({
      url: `${BASE}/portfolio/${p.slug}`,
      lastModified: p.modified ? new Date(p.modified) : now,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    }));

    return [...staticRoutes, ...postRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
