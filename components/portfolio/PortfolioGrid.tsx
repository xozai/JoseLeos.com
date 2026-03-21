"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "@/components/portfolio/ProjectCard";
import GatedCard from "@/components/ui/GatedCard";
import type { ProjectListItem } from "@/lib/types";

interface PortfolioGridProps {
  projects: ProjectListItem[];
  teaserCount: number;
}

export default function PortfolioGrid({ projects, teaserCount }: PortfolioGridProps) {
  const [activeTech, setActiveTech] = useState<string>("all");

  const techs = [
    "all",
    ...Array.from(
      new Set(projects.flatMap((p) => p.projectFields.techStack ?? []))
    ).slice(0, 12),
  ];

  const filtered =
    activeTech === "all"
      ? projects
      : projects.filter((p) => p.projectFields.techStack?.includes(activeTech));

  return (
    <>
      {techs.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {techs.map((tech) => (
            <button
              key={tech}
              onClick={() => setActiveTech(tech)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeTech === tech
                  ? "bg-[--primary] text-[--primary-foreground] border-[--primary]"
                  : "border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted]"
              }`}
            >
              {tech === "all" ? "All" : tech}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
          {activeTech === "all" &&
            Array.from({ length: teaserCount }).map((_, i) => (
              <GatedCard key={`teaser-${i}`} type="project" />
            ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && teaserCount === 0 && (
        <p className="py-16 text-center text-[--foreground-muted] text-sm">
          No projects with this technology.
        </p>
      )}
    </>
  );
}
