import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Globe, Lock, Users, Eye, Mail, TrendingUp } from "lucide-react";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import { GET_PROJECTS } from "@/lib/graphql/queries/projects";
import { GET_RECOMMENDATIONS } from "@/lib/graphql/queries/recommendations";
import { isOwner } from "@/lib/access";
import { kv } from "@vercel/kv";
import { formatDate } from "@/lib/utils";
import type { PostListItem, ProjectListItem, RecommendationItem, Visibility } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 0;

const WP_ADMIN = process.env.NEXT_PUBLIC_WORDPRESS_URL
  ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-admin`
  : "#";

interface ContactEntry {
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

interface ViewEntry {
  slug: string;
  views: number;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon?: any }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--background-secondary] p-5">
      {Icon && <Icon size={16} className="text-[--foreground-muted] mb-2" />}
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
  let contacts: ContactEntry[] = [];
  let topViews: ViewEntry[] = [];
  let totalViews = 0;

  const [contentRes, kvRes] = await Promise.allSettled([
    Promise.all([
      apolloClient.query({ query: GET_POSTS, variables: { first: 100 } }),
      apolloClient.query({ query: GET_PROJECTS }),
      apolloClient.query({ query: GET_RECOMMENDATIONS }),
    ]),
    Promise.all([
      kv.lrange<string>("contacts", 0, 9),
      kv.keys("views:*"),
    ]),
  ]);

  if (contentRes.status === "fulfilled") {
    const [postsRes, projectsRes, recsRes] = contentRes.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts = (postsRes.data as any)?.posts?.nodes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects = (projectsRes.data as any)?.portfolioProjects?.nodes ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recs = (recsRes.data as any)?.recommendations?.nodes ?? [];
  }

  if (kvRes.status === "fulfilled") {
    const [rawContacts, viewKeys] = kvRes.value;

    contacts = (rawContacts ?? []).map((entry) => {
      try { return JSON.parse(entry) as ContactEntry; } catch { return null; }
    }).filter(Boolean) as ContactEntry[];

    if (viewKeys.length > 0) {
      const viewCounts = await Promise.all(
        viewKeys.map(async (key) => {
          const slug = key.replace("views:", "");
          const views = (await kv.get<number>(key)) ?? 0;
          return { slug, views };
        })
      );
      viewCounts.sort((a, b) => b.views - a.views);
      topViews = viewCounts.slice(0, 5);
      totalViews = viewCounts.reduce((s, v) => s + v.views, 0);
    }
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

      {/* Content stats */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-4">
          Content Overview
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

      {/* Engagement stats */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-4">
          Engagement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Page Views" value={totalViews.toLocaleString()} icon={Eye} />
          <StatCard label="Tracked Posts" value={topViews.length} icon={TrendingUp} />
          <StatCard label="Contact Messages" value={contacts.length} icon={Mail} />
        </div>

        {topViews.length > 0 && (
          <div className="mt-4 rounded-xl border border-[--border] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[--border] bg-[--background-secondary]">
              <p className="text-xs font-semibold text-[--foreground-muted] uppercase tracking-wider">
                Top Posts by Views
              </p>
            </div>
            <div className="divide-y divide-[--border]">
              {topViews.map(({ slug, views }) => (
                <div key={slug} className="flex items-center justify-between px-4 py-3 hover:bg-[--background-secondary] transition-colors">
                  <Link
                    href={`/blog/${slug}`}
                    className="text-sm text-[--foreground] hover:text-[--primary] transition-colors truncate"
                  >
                    /blog/{slug}
                  </Link>
                  <span className="text-sm font-medium text-[--foreground-muted] shrink-0 ml-4">
                    {views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contact log */}
      {contacts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[--foreground-muted] mb-4">
            Recent Contact Messages ({contacts.length})
          </h2>
          <div className="rounded-xl border border-[--border] overflow-hidden divide-y divide-[--border]">
            {contacts.map((c, i) => (
              <div key={i} className="px-4 py-4 hover:bg-[--background-secondary] transition-colors">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <span className="font-medium text-sm text-[--foreground]">{c.name}</span>
                    <span className="text-[--foreground-muted] text-sm"> · </span>
                    <a href={`mailto:${c.email}`} className="text-sm text-[--primary] hover:underline">
                      {c.email}
                    </a>
                  </div>
                  <span className="text-xs text-[--foreground-muted] shrink-0">
                    {formatDate(c.date)}
                  </span>
                </div>
                <p className="text-sm font-medium text-[--foreground] mb-0.5">{c.subject}</p>
                <p className="text-sm text-[--foreground-muted] line-clamp-2">{c.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
