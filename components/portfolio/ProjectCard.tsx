import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { type ProjectListItem } from "@/lib/types";

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const { slug, title, excerpt, featuredImage, projectFields } = project;

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
          <span className="text-xs text-[--foreground-muted]">
            {projectFields.role} · {projectFields.year}
          </span>
        </div>
        <h3 className="font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors mb-2">
          {title}
        </h3>
        {excerpt && (
          <p
            className="text-sm text-[--foreground-muted] line-clamp-2 mb-4"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
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
