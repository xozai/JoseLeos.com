"use client";

import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "@/components/portfolio/ProjectCard";
import GatedCard from "@/components/ui/GatedCard";
import type { ProjectListItem } from "@/lib/types";

interface PortfolioGridProps {
  projects: ProjectListItem[];
  teaserCount: number;
}

export default function PortfolioGrid({ projects, teaserCount }: PortfolioGridProps) {
  return (
    <AnimatePresence mode="popLayout">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
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
        {Array.from({ length: teaserCount }).map((_, i) => (
          <GatedCard key={`teaser-${i}`} type="project" />
        ))}
      </div>
    </AnimatePresence>
  );
}
