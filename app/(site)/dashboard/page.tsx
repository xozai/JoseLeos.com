import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Globe, Lock, Users } from "lucide-react";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import { GET_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import { isOwner } from "@/lib/access";
import type { PostListItem, ProjectListItem, RecommendationItem, Visibility } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 0; // Always fresh for owner

const WP_ADMIN = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin`
  : "#";

function VisibilityBadge({ v }: { v: Visibility }) {
  if (v === "public")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <Globe size={10} /> Public
      </span>
    );
  if (v === "members")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <Users size={10} /> Members
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <Lock size={10} /> Private
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-5">
      <p className="text-2xl font-bold text-[--foreground]">{value}</p>
      <p className="text-sm text-[--foreground-muted] mt-0.5">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const owner = await isOwner();
  if (!owner) notFound();

  let posts: PostListItem[] = [];
  let projects: ProjectListItem[] = [];
  let recs: RecommendationItem[] = [];

  try {
    const [postsRes, projectsRes, recsRes] = await Promise.all([
      apolloClient.query({ query: GET_POSTS, variables: { first: 100 } }),
      apolloClient.query({ query: GET_PROJECTS }),
      apolloClient.query({ query: GET_RECOMMENDATIONS }),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts = (postsRes.data as any)?.posts?.nodes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects = (projectsRes.data as any)?.portfolioProjects?.nodes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recs = (recsRes.data as any)?.recommendations?.nodes ?? [];
  } catch {
    /* continue with empty arrays */
  }

  const count = (items: { acfVisibility?: { visibility?: Visibility } }[], v: Visibility) =>
    items.filter((i) => (i.acfVisibility?.visibility ?? "public") === v).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[--foreground]">Dashboard</h1>
          <p className="text-sm text-[--foreground-muted] mt-1">Owner view — all content visible</p>
        </div>
        <a
          href={WP_ADMIN}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--background-secondary] transition-colors"
        >
          WP Admin <ExternalLink size={13} />
        </a>
      </div>

      {/* Stats */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Posts" value={posts.length} />
          <StatCard label="Members Posts" value={count(posts, "members")} />
          <StatCard label="Private Posts" value={count(posts, "private")} />
          <StatCard label="Total Projects" value={projects.length} />
          <StatCard label="Members Projects" value={count(projects, "members")} />
          <StatCard label="Private Projects" value={count(projects, "private")} />
        </div>
      </section>

      {/* Posts */}
      <ContentSection
        title="Blog Posts"
        items={posts.map((p) => ({
          title: p.title,
          href: `/blog/${p.slug}`,
          editUrl: `${WP_ADMIN}/post.php?action=edit`,
          visibility: p.acfVisibility?.visibility ?? "public",
        }))}
      />

      {/* Projects */}
      <ContentSection
        title="Portfolio Projects"
        items={projects.map((p) => ({
          title: p.title,
          href: `/portfolio/${p.slug}`,
          editUrl: `${WP_ADMIN}/post.php?action=edit`,
          visibility: p.acfVisibility?.visibility ?? "public",
        }))}
      />

      {/* Recommendations */}
      <ContentSection
        title="Recommendations"
        items={recs.map((r) => ({
          title: r.title,
          href: `/recommendations`,
          editUrl: `${WP_ADMIN}/post.php?action=edit`,
          visibility: r.acfVisibility?.visibility ?? "public",
        }))}
      />
    </div>
  );
}

function ContentSection({
  title,
  items,
}: {
  title: string;
  items: { title: string; href: string; editUrl: string; visibility: Visibility }[];
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-3">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[--foreground-muted] py-4">None yet.</p>
      ) : (
        <div className="rounded-xl border border-[--border] overflow-hidden divide-y divide-[--border]">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 hover:bg-[--background-secondary] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <VisibilityBadge v={item.visibility} />
                <Link
                  href={item.href}
                  className="text-sm text-[--foreground] hover:text-[--primary] transition-colors truncate"
                >
                  {item.title}
                </Link>
              </div>
              <a
                href={item.editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 shrink-0 text-xs text-[--foreground-muted] hover:text-[--primary] transition-colors"
              >
                Edit
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
