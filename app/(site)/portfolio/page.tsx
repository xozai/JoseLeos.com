import type { Metadata } from "next";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
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

  const session = await auth();
  const visibleProjects = projects.filter((p) => {
    const v = p.acfVisibility?.visibility ?? "public";
    if (v === "public") return true;
    if (v === "members") return !!session?.user;
    if (v === "private") return session?.user?.email === OWNER_EMAIL;
    return true;
  });

  const teaserCount = !session?.user
    ? projects.filter((p) => p.acfVisibility?.visibility === "members").length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Portfolio</h1>
        <p className="text-lg text-[--foreground-muted] max-w-xl">
          A selection of projects I&apos;ve designed and built — from product interfaces to open-source tools.
        </p>
      </header>

      {visibleProjects.length > 0 || teaserCount > 0 ? (
        <PortfolioGrid projects={visibleProjects} teaserCount={teaserCount} />
      ) : (
        <div className="py-24 text-center text-[--foreground-muted]">
          <p>No projects yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
