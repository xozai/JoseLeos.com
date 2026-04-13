import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Instagram } from "lucide-react";
import Hero from "@/components/home/Hero";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PostCard from "@/components/blog/PostCard";
import RecCard from "@/components/recommendations/RecCard";
import StarRating from "@/components/recommendations/StarRating";
import InstagramFeed from "@/components/instagram/InstagramFeed";
import FadeIn from "@/components/ui/FadeIn";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import {
  GET_FEATURED_RECOMMENDATIONS,
  GET_LATEST_RECOMMENDATIONS,
} from "@/lib/graphql/queries/recommendations";
import { filterByAccess } from "@/lib/access";
import { getInstagramFeed } from "@/lib/instagram";
import { blurProps } from "@/lib/image";
import type { Metadata } from "next";
import type { PostListItem, ProjectListItem, RecommendationItem } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: "Designer and developer based in Miami. I build digital products, write about design and engineering, and share things I recommend.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: "Designer and developer based in Miami. I build digital products, write about design and engineering, and share things I recommend.",
    url: SITE_URL,
    type: "website",
  },
};

export const revalidate = 60;

async function getData() {
  try {
    const [projectsRes, postsRes, recsRes, latestRecsRes, igPosts] = await Promise.all([
      apolloClient.query({ query: GET_PROJECTS }),
      apolloClient.query({ query: GET_POSTS, variables: { first: 4 } }),
      apolloClient.query({ query: GET_FEATURED_RECOMMENDATIONS }),
      apolloClient.query({ query: GET_LATEST_RECOMMENDATIONS }),
      getInstagramFeed(9),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pd = projectsRes.data   as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bd = postsRes.data      as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rd = recsRes.data       as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ld = latestRecsRes.data as any;

    const projects: ProjectListItem[]    = pd?.portfolioProjects?.nodes ?? [];
    const posts: PostListItem[]          = bd?.posts?.nodes ?? [];
    const recommendations: RecommendationItem[] = rd?.recommendations?.nodes ?? [];
    const latestRecs: RecommendationItem[]       = ld?.recommendations?.nodes ?? [];

    const [visibleProjects, visiblePosts, visibleRecs, visibleLatest] = await Promise.all([
      filterByAccess(projects),
      filterByAccess(posts),
      filterByAccess(recommendations),
      filterByAccess(latestRecs),
    ]);

    // Home page: up to 2 in-progress first, then fill with featured completed up to 4
    const inProgress = visibleProjects.filter(
      (p) => p.projectFields.projectStatus === "in-progress"
    ).slice(0, 2);
    const featuredCompleted = visibleProjects.filter(
      (p) =>
        p.projectFields.featured &&
        p.projectFields.projectStatus !== "in-progress" &&
        p.projectFields.projectStatus !== "paused"
    );
    const homeProjects = [
      ...inProgress,
      ...featuredCompleted.filter((p) => !inProgress.find((a) => a.slug === p.slug)),
    ].slice(0, 4);

    return {
      featuredProjects: homeProjects,
      posts:            visiblePosts.slice(0, 3),
      recommendations:  visibleRecs.slice(0, 6),
      latestRecs:       visibleLatest.slice(0, 3),
      instagramPosts:   igPosts,
    };
  } catch {
    return { featuredProjects: [], posts: [], recommendations: [], latestRecs: [], instagramPosts: [] };
  }
}

export default async function HomePage() {
  const { featuredProjects, posts, recommendations, latestRecs, instagramPosts } = await getData();

  return (
    <>
      <Hero />

      {/* Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeader title="Projects" href="/portfolio" linkLabel="View all projects" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProjects.map((project, i) => (
              <FadeIn key={project.slug} index={i}>
                <ProjectCard project={project} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <FadeIn>
            <SectionHeader title="Latest Posts" href="/blog" />
          </FadeIn>
          <div>
            {posts.map((post, i) => (
              <FadeIn key={post.slug} index={i}>
                <PostCard post={post} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* On Instagram */}
      {instagramPosts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[--foreground]">On Instagram</h2>
            <a
              href="https://instagram.com/joseleos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-[--foreground-muted] hover:text-[--primary] transition-colors"
            >
              <Instagram size={14} />
              Follow @joseleos <ArrowRight size={14} />
            </a>
          </div>
          <InstagramFeed posts={instagramPosts} />
        </section>
      )}

      {/* Recently Reviewed */}
      {latestRecs.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <FadeIn>
            <SectionHeader title="Recently Reviewed" href="/recommendations" />
          </FadeIn>
          <div className="space-y-3">
            {latestRecs.map((item, i) => {
              const cover = item.featuredImage?.node?.sourceUrl ?? item.recFields.itemImage?.sourceUrl;
              const alt   = item.featuredImage?.node?.altText ?? item.recFields.itemImage?.altText ?? item.title;
              return (
                <FadeIn key={item.slug} index={i}>
                  <Link
                    href={`/recommendations/${item.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-[--border] hover:border-[--primary] bg-[--background] transition-all hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-[--background-secondary] border border-[--border] overflow-hidden relative shrink-0">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={alt}
                          fill
                          className="object-cover"
                          sizes="56px"
                          {...blurProps}
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[--foreground-muted]">
                          {item.title.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors truncate">
                        {item.title}
                      </p>
                      {item.recFields.category && (
                        <p className="text-xs text-[--foreground-muted] mt-0.5">{item.recFields.category}</p>
                      )}
                    </div>

                    {/* Rating */}
                    {typeof item.recFields.rating === "number" && item.recFields.rating > 0 && (
                      <div className="shrink-0">
                        <StarRating rating={item.recFields.rating} size="sm" showLabel />
                      </div>
                    )}
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>
      )}

      {/* Things I Recommend */}
      {recommendations.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <FadeIn>
            <SectionHeader title="Things I Recommend" href="/recommendations" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((item, i) => (
              <FadeIn key={item.slug} index={i}>
                <RecCard item={item} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-[--foreground]">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm font-medium text-[--foreground-muted] hover:text-[--primary] transition-colors"
      >
        {linkLabel} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
