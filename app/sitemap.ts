import type { MetadataRoute } from "next";
import { apolloClient } from "@/lib/graphql/client";
import { GET_ALL_POST_SLUGS } from "@/lib/graphql/queries/posts";
import { GET_ALL_PROJECT_SLUGS } from "@/lib/graphql/queries/projects";

const BASE = "https://joseLeos.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), priority: 1 },
    { url: `${BASE}/portfolio`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/recommendations`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), priority: 0.6 },
  ];

  try {
    const [postsRes, projectsRes] = await Promise.all([
      apolloClient.query({ query: GET_ALL_POST_SLUGS }),
      apolloClient.query({ query: GET_ALL_PROJECT_SLUGS }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postsData = postsRes.data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsData = projectsRes.data as any;

    const postRoutes: MetadataRoute.Sitemap = (postsData?.posts?.nodes ?? []).map(
      (p: { slug: string }) => ({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: new Date(),
        priority: 0.7,
      })
    );

    const projectRoutes: MetadataRoute.Sitemap = (
      projectsData?.portfolioProjects?.nodes ?? []
    ).map((p: { slug: string }) => ({
      url: `${BASE}/portfolio/${p.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    }));

    return [...staticRoutes, ...postRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
