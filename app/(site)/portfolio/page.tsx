import type { Metadata } from "next";
import ProjectCard from "@/components/portfolio/ProjectCard";
import { apolloClient } from "@/lib/graphql/client";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import type { ProjectListItem } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Projects and work by Jose Leos — design, development, and everything in between.",
};

export default async function PortfolioPage() {
  let projects: ProjectListItem[] = [];

  try {
    const res = await apolloClient.query({ query: GET_PROJECTS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    projects = data?.portfolioProjects?.nodes ?? [];
  } catch {
    /* show empty state if WP is unreachable */
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Portfolio</h1>
        <p className="text-lg text-[--foreground-muted] max-w-xl">
          A selection of projects I&apos;ve designed and built — from product interfaces to open-source tools.
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState message="No projects yet. Check back soon." />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 text-center text-[--foreground-muted]">
      <p>{message}</p>
    </div>
  );
}
