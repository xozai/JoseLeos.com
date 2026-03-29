import type { Metadata } from "next";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import CategoryFilterBar from "@/components/portfolio/CategoryFilterBar";
import ProjectCard from "@/components/portfolio/ProjectCard";
import { apolloClient } from "@/lib/graphql/client";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/auth";
import type { ProjectListItem } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Projects and work by Jose Leos — design, development, and everything in between.",
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  let projects: ProjectListItem[] = [];

  try {
    const res = await apolloClient.query({ query: GET_PROJECTS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    projects = data?.portfolioProjects?.nodes ?? [];
  } catch {
    /* show empty state if WP is unreachable */
  }

  const session = await auth();
  const visibleProjects = projects.filter((p) => {
    const v = p.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });

  // Derive unique categories from all visible non-archived projects
  const allCategories = Array.from(
    new Set(
      visibleProjects
        .filter((p) => p.projectFields.projectStatus !== "archived")
        .map((p) => p.projectFields.projectCategory)
        .filter((c): c is string => !!c)
    )
  );

  // Apply category filter
  const filteredProjects = category
    ? visibleProjects.filter((p) => p.projectFields.projectCategory === category)
    : visibleProjects;

  // Split into active vs completed (exclude archived from display)
  const activeProjects = filteredProjects.filter(
    (p) =>
      p.projectFields.projectStatus === "in-progress" ||
      p.projectFields.projectStatus === "paused"
  );

  const completedProjects = filteredProjects.filter(
    (p) => p.projectFields.projectStatus === "completed"
  );

  // Projects with no status set fall through to completed section
  const untaggedProjects = filteredProjects.filter(
    (p) => !p.projectFields.projectStatus
  );

  const completedAndUntagged = [...completedProjects, ...untaggedProjects];

  // Gated teasers count (members-only completed projects shown to anonymous users)
  const teaserCount = !session?.user
    ? projects.filter(
        (p) =>
          p.acfVisibility?.visibility === "members" &&
          p.projectFields.projectStatus !== "in-progress" &&
          p.projectFields.projectStatus !== "paused"
      ).length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Portfolio</h1>
        <p className="text-lg text-[--foreground-muted] max-w-xl">
          A selection of projects I&apos;ve designed and built — from product interfaces to open-source tools.
        </p>
      </header>

      <CategoryFilterBar categories={allCategories} active={category} />

      {/* Currently Building */}
      {activeProjects.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[--foreground] mb-6">Currently Building</h2>
          {/* Horizontal scroll on mobile, 2-col grid on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
            {activeProjects.map((project) => (
              <div key={project.slug} className="min-w-[280px] sm:min-w-0">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Work */}
      {(completedAndUntagged.length > 0 || teaserCount > 0) && (
        <section>
          {activeProjects.length > 0 && (
            <h2 className="text-xl font-semibold text-[--foreground] mb-6">Completed Work</h2>
          )}
          <PortfolioGrid projects={completedAndUntagged} teaserCount={teaserCount} />
        </section>
      )}

      {/* Empty state when filter returns nothing */}
      {activeProjects.length === 0 &&
        completedAndUntagged.length === 0 &&
        teaserCount === 0 && (
          <div className="py-24 text-center text-[--foreground-muted]">
            <p>No projects in this category.</p>
          </div>
        )}
    </div>
  );
}
