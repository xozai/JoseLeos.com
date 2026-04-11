"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { blurProps } from "@/lib/image";
import { type ProjectListItem, type ProjectStatus } from "@/lib/types";

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
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
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        Paused
      </span>
    );
  }
  return null;
}

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const { slug, title, featuredImage, projectFields } = project;
  const reduced = useReducedMotion();

  const isActive =
    projectFields.projectStatus === "in-progress" ||
    projectFields.projectStatus === "paused";

  const category = projectFields.projectCategory || projectFields.role;
  const year = projectFields.year;

  return (
    <Link href={`/portfolio/${slug}`} className="group block cursor-pointer">
      <motion.div
        whileHover={reduced ? undefined : { y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="aspect-[4/5] bg-[--background-secondary] overflow-hidden mb-5 rounded-[--radius-lg]">
          {featuredImage ? (
            <Image
              src={featuredImage.node.sourceUrl}
              alt={featuredImage.node.altText || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
              {...blurProps}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[--foreground-muted] text-4xl font-black opacity-10">
              {title.charAt(0)}
            </div>
          )}
        </div>

        {isActive && projectFields.projectStatus && (
          <StatusBadge status={projectFields.projectStatus} />
        )}

        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[--foreground-muted] block mb-2">
          {[category, year].filter(Boolean).join(" · ")}
        </span>

        <h3 className="font-black text-xl tracking-tight group-hover:underline decoration-2 underline-offset-4 transition-all">
          {title}
        </h3>
      </motion.div>
    </Link>
  );
}
