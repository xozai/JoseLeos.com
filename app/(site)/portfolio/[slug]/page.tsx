import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProseContent from "@/components/blog/ProseContent";
import { blurProps } from "@/lib/image";
import { apolloClient } from "@/lib/graphql/client";
import { GET_PROJECT_BY_SLUG, GET_ALL_PROJECT_SLUGS } from "@/lib/graphql/queries/projects";
import { canAccess } from "@/lib/access";
import { auth } from "@/auth";
import type { ProjectFull } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const res = await apolloClient.query({ query: GET_ALL_PROJECT_SLUGS });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    return (data?.portfolioProjects?.nodes ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
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
        : [{
            url: `/api/og?title=${encodeURIComponent(project.title)}&type=portfolio&category=${encodeURIComponent(project.projectFields.role)}&readingTime=${encodeURIComponent(project.projectFields.year)}`,
          }],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const visibility = project.acfVisibility?.visibility ?? "public";
  const allowed = await canAccess(visibility);
  if (!allowed) {
    const session = await auth();
    if (!session) redirect("/login");
    else notFound();
  }

  const { title, content, featuredImage, projectFields } = project;

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
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-[--foreground-muted]">
          <span>{projectFields.role}</span>
          <span>·</span>
          <span>{projectFields.year}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[--foreground] mb-4">{title}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {projectFields.techStack?.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <div className="flex gap-3">
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

      {/* Case Study Content */}
      {content && <ProseContent html={content} />}
    </article>
  );
}
