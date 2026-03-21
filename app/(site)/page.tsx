import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PostCard from "@/components/blog/PostCard";
import RecCard from "@/components/recommendations/RecCard";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import { GET_FEATURED_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import { filterByAccess } from "@/lib/access";
import type { PostListItem, ProjectListItem, RecommendationItem } from "@/lib/types";

export const revalidate = 60;

async function getData() {
  try {
    const [projectsRes, postsRes, recsRes] = await Promise.all([
      apolloClient.query({ query: GET_PROJECTS }),
      apolloClient.query({ query: GET_POSTS, variables: { first: 4 } }),
      apolloClient.query({ query: GET_FEATURED_RECOMMENDATIONS }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pd = projectsRes.data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bd = postsRes.data as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rd = recsRes.data as any;

    const projects: ProjectListItem[] = pd?.portfolioProjects?.nodes ?? [];
    const posts: PostListItem[] = bd?.posts?.nodes ?? [];
    const recommendations: RecommendationItem[] = rd?.recommendations?.nodes ?? [];

    const [visibleProjects, visiblePosts, visibleRecs] = await Promise.all([
      filterByAccess(projects),
      filterByAccess(posts),
      filterByAccess(recommendations),
    ]);

    return {
      featuredProjects: visibleProjects.filter((p) => p.projectFields.featured).slice(0, 3),
      posts: visiblePosts.slice(0, 3),
      recommendations: visibleRecs.slice(0, 6),
    };
  } catch {
    return { featuredProjects: [], posts: [], recommendations: [] };
  }
}

export default async function HomePage() {
  const { featuredProjects, posts, recommendations } = await getData();

  return (
    <>
      <Hero />

      {/* Featured Work */}
      {featuredProjects.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <SectionHeader title="Featured Work" href="/portfolio" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <SectionHeader title="Latest Posts" href="/blog" />
          <div>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[--border]">
          <SectionHeader title="Things I Recommend" href="/recommendations" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((item) => (
              <RecCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-[--foreground]">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm font-medium text-[--foreground-muted] hover:text-[--primary] transition-colors"
      >
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}
