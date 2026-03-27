import type { MetadataRoute } from "next";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POST_SLUGS_WITH_DATES, GET_ALL_CATEGORY_SLUGS, GET_ALL_TAG_SLUGS } from "@/lib/graphql/queries/posts";
import { GET_PROJECT_SLUGS_WITH_DATES } from "@/lib/graphql/queries/projects";
import { GET_ALL_RECOMMENDATION_SLUGS } from "@/lib/graphql/queries/recommendations";

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
  { url: `${BASE}/newsletter`,           lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
  { url: `${BASE}/contact`,             lastModified: now, priority: 0.5,  changeFrequency: "yearly"  },
  { url: `${BASE}/booking`,             lastModified: now, priority: 0.5,  changeFrequency: "yearly"  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [postsRes, projectsRes, recsRes, catsRes, tagsRes] = await Promise.all([
      apolloClient.query({ query: GET_POST_SLUGS_WITH_DATES }),
      apolloClient.query({ query: GET_PROJECT_SLUGS_WITH_DATES }),
      apolloClient.query({ query: GET_ALL_RECOMMENDATION_SLUGS }),
      apolloClient.query({ query: GET_ALL_CATEGORY_SLUGS }),
      apolloClient.query({ query: GET_ALL_TAG_SLUGS }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postsData    = postsRes.data    as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsData = projectsRes.data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recsData     = recsRes.data     as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catsData     = catsRes.data     as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagsData     = tagsRes.data     as any;

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
    )
      .filter(
        (p: { projectFields?: { projectStatus?: string } }) =>
          p.projectFields?.projectStatus !== "archived"
      )
      .map(
        (p: { slug: string; modified?: string; projectFields?: { projectStatus?: string } }) => {
          const status = p.projectFields?.projectStatus;
          const isActive = status === "in-progress" || status === "paused";
          return {
            url: `${BASE}/portfolio/${p.slug}`,
            lastModified: p.modified ? new Date(p.modified) : now,
            priority: isActive ? 0.7 : 0.6,
            changeFrequency: isActive ? ("weekly" as const) : ("monthly" as const),
          };
        }
      );

    const recRoutes: MetadataRoute.Sitemap = (
      recsData?.recommendations?.nodes ?? []
    ).map((r: { slug: string; modified?: string }) => ({
      url: `${BASE}/recommendations/${r.slug}`,
      lastModified: r.modified ? new Date(r.modified) : now,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = (
      catsData?.categories?.nodes ?? []
    )
      .filter((c: { count: number }) => c.count > 0)
      .map((c: { slug: string }) => ({
        url: `${BASE}/blog/category/${c.slug}`,
        lastModified: now,
        priority: 0.6,
        changeFrequency: "weekly" as const,
      }));

    const tagRoutes: MetadataRoute.Sitemap = (
      tagsData?.tags?.nodes ?? []
    )
      .filter((t: { count: number }) => t.count > 0)
      .map((t: { slug: string }) => ({
        url: `${BASE}/blog/tag/${t.slug}`,
        lastModified: now,
        priority: 0.5,
        changeFrequency: "weekly" as const,
      }));

    return [
      ...staticRoutes,
      ...postRoutes,
      ...projectRoutes,
      ...recRoutes,
      ...categoryRoutes,
      ...tagRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
