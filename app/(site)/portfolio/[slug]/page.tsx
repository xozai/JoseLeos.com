import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft, ArrowRight, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProseContent from "@/components/blog/ProseContent";
import MediaGallery from "@/components/portfolio/MediaGallery";
import { blurProps } from "@/lib/image";
import { formatProjectDate } from "@/lib/utils";
import { apolloClient } from "@/lib/graphql/client";
import {
  GET_PROJECT_BY_SLUG,
  GET_ALL_PROJECT_SLUGS,
} from "@/lib/graphql/queries/projects";
import { canAccess } from "@/lib/access";
import { auth } from "@/auth";
import type { ProjectFull, ProjectStatus } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await apolloClient.query({ query: GET_ALL_PROJECT_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.portfolioProjects?.nodes ?? [])
      .filter(
        (p: { slug: string; projectFields?: { projectStatus?: string } }) =>
          p.projectFields?.projectStatus !== "archived"
      )
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

async function getProject(slug: string): Promise<ProjectFull | null> {
  try {
    const res = await apolloClient.query({
      query: GET_PROJECT_BY_SLUG,
      variables: { slug },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return data?.portfolioProject ?? null;
  } catch {
    return null;
  }
}

async function getAllSlugs(): Promise<string[]> {
  try {
    const res = await apolloClient.query({ query: GET_ALL_PROJECT_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.portfolioProjects?.nodes ?? [])
      .filter(
        (p: { projectFields?: { projectStatus?: string } }) =>
          p.projectFields?.projectStatus !== "archived"
      )
      .map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.excerpt?.replace(/<[^>]+>/g, "") ?? "",
    openGraph: {
      images: project.featuredImage
        ? [{ url: project.featuredImage.node.sourceUrl }]
        : [
            {
              url: `/api/og?title=${encodeURIComponent(project.title)}&type=portfolio&category=${encodeURIComponent(project.projectFields.role)}&readingTime=${encodeURIComponent(project.projectFields.year)}`,
            },
          ],
    },
  };
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; className: string }> = {
    "in-progress": {
      label: "In Progress",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    paused: {
      label: "Paused",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    completed: {
      label: "Completed",
      className:
        "bg-[--background-secondary] text-[--foreground-muted] border border-[--border]",
    },
    archived: {
      label: "Archived",
      className:
        "bg-[--background-secondary] text-[--foreground-muted] border border-[--border]",
    },
  };
  const { label, className } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${className}`}
    >
      {status === "in-progress" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      )}
      {label}
    </span>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, allSlugs] = await Promise.all([getProject(slug), getAllSlugs()]);

  if (!project) notFound();

  const visibility = project.acfVisibility?.visibility ?? "public";
  const allowed = await canAccess(visibility);
  if (!allowed) {
    const session = await auth();
    if (!session) redirect("/login");
    else notFound();
  }

  const { title, content, featuredImage, projectFields } = project;

  // Next project navigation
  const currentIndex = allSlugs.indexOf(slug);
  const nextSlug =
    currentIndex >= 0 ? allSlugs[(currentIndex + 1) % allSlugs.length] : null;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-[--foreground-muted] hover:text-[--foreground] mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Portfolio
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Status badge */}
        {projectFields.projectStatus && (
          <div className="mb-3">
            <StatusPill status={projectFields.projectStatus} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-[--foreground-muted]">
          <span>{projectFields.role}</span>
          <span>·</span>
          <span>{projectFields.year}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[--foreground] mb-4">{title}</h1>

        {/* Timeline */}
        {projectFields.projectStartDate && (
          <p className="text-sm text-[--foreground-muted] mb-4">
            Started {formatProjectDate(projectFields.projectStartDate)}
            {" · "}
            {projectFields.projectEndDate
              ? `Ended ${formatProjectDate(projectFields.projectEndDate)}`
              : "Ongoing"}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {projectFields.techStack?.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        {/* Impact callout */}
        {projectFields.projectImpact && (
          <blockquote className="border-l-4 border-[--primary] pl-4 py-2 my-4 bg-[--background-secondary] rounded-r-lg">
            <p className="text-sm font-medium text-[--foreground]">
              {projectFields.projectImpact}
            </p>
          </blockquote>
        )}

        {/* Collaborators */}
        {projectFields.projectCollaborators &&
          projectFields.projectCollaborators.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 my-4">
              <Users size={14} className="text-[--foreground-muted]" />
              <span className="text-xs text-[--foreground-muted]">Built with</span>
              {projectFields.projectCollaborators.map((c) =>
                c.url ? (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-0.5 rounded-full border border-[--border] text-[--foreground] hover:border-[--primary] hover:text-[--primary] transition-colors"
                  >
                    {c.name}
                  </a>
                ) : (
                  <span
                    key={c.name}
                    className="text-xs px-2.5 py-0.5 rounded-full border border-[--border] text-[--foreground-muted]"
                  >
                    {c.name}
                  </span>
                )
              )}
            </div>
          )}

        <div className="flex gap-3 mt-4">
          {projectFields.liveUrl && (
            <a
              href={projectFields.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[--primary] text-[--primary-foreground] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={14} />
              Live Site
            </a>
          )}
          {projectFields.githubUrl && (
            <a
              href={projectFields.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-[--foreground] text-sm font-medium hover:bg-[--background-secondary] transition-colors"
            >
              <Github size={14} />
              Source Code
            </a>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {featuredImage && (
        <div className="mb-10 rounded-xl overflow-hidden aspect-video relative bg-[--background-secondary]">
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            {...blurProps}
          />
        </div>
      )}

      {/* Media gallery */}
      {projectFields.projectGallery && projectFields.projectGallery.length > 0 && (
        <MediaGallery images={projectFields.projectGallery} />
      )}

      {/* Case Study Content */}
      {content && <ProseContent html={content} />}

      {/* Next Project navigation */}
      {nextSlug && nextSlug !== slug && (
        <footer className="mt-16 pt-8 border-t border-[--border]">
          <Link
            href={`/portfolio/${nextSlug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-[--foreground-muted] hover:text-[--primary] transition-colors"
          >
            Next Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </footer>
      )}
    </article>
  );
}
