import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { blurProps } from "@/lib/image";
import { formatProjectDate } from "@/lib/utils";
import { type ProjectListItem, type ProjectStatus } from "@/lib/types";

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        In Progress
      </span>
    );
  }
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        Paused
      </span>
    );
  }
  return null;
}

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const { slug, title, excerpt, featuredImage, projectFields } = project;
  const isActive =
    projectFields.projectStatus === "in-progress" ||
    projectFields.projectStatus === "paused";

  return (
    <Link
      href={`/portfolio/${slug}`}
      className="group block rounded-xl border border-[--border] bg-[--background] overflow-hidden hover:border-[--primary] transition-all hover:shadow-lg"
    >
      {/* Cover image */}
      <div className="aspect-video bg-[--background-secondary] relative overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            {...blurProps}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[--foreground-muted] text-4xl font-bold opacity-10">
            {title.charAt(0)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          {isActive && projectFields.projectStatus ? (
            <StatusBadge status={projectFields.projectStatus} />
          ) : (
            <span className="text-xs text-[--foreground-muted]">
              {projectFields.role} · {projectFields.year}
            </span>
          )}
        </div>

        {isActive && projectFields.projectStartDate && (
          <p className="text-xs text-[--foreground-muted] mb-1.5">
            Started {formatProjectDate(projectFields.projectStartDate)}
          </p>
        )}

        <h3 className="font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors mb-2">
          {title}
        </h3>

        {excerpt && (
          <p
            className="text-sm text-[--foreground-muted] line-clamp-2 mb-3"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}

        {projectFields.projectImpact && (
          <p className="text-xs text-[--primary] font-medium mb-3 line-clamp-1">
            ↳ {projectFields.projectImpact}
          </p>
        )}

        {projectFields.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {projectFields.techStack.slice(0, 4).map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
            {projectFields.techStack.length > 4 && (
              <Badge>+{projectFields.techStack.length - 4}</Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
