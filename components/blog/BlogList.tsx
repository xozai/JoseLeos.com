"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PostCard from "@/components/blog/PostCard";
import GatedCard from "@/components/ui/GatedCard";
import type { PostListItem } from "@/lib/types";

interface BlogListProps {
  posts: PostListItem[];
  teaserCount: number;
}

export default function BlogList({ posts, teaserCount }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Collect unique categories from posts
  const categories = [
    "all",
    ...Array.from(
      new Set(posts.flatMap((p) => p.categories.nodes.map((c) => c.name)))
    ),
  ];

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) =>
          p.categories.nodes.some((c) => c.name === activeCategory)
        );

  return (
    <>
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-[--primary] text-[--primary-foreground] border-[--primary]"
                  : "border-[--border] text-[--foreground-muted] hover:text-[--foreground] hover:border-[--foreground-muted]"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 || teaserCount > 0 ? (
        <AnimatePresence mode="popLayout">
          <div>
            {filtered.map((post) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
            {activeCategory === "all" &&
              Array.from({ length: teaserCount }).map((_, i) => (
                <GatedCard key={`teaser-${i}`} type="post" className="mb-6" />
              ))}
          </div>
        </AnimatePresence>
      ) : (
        <p className="py-16 text-center text-[--foreground-muted] text-sm">
          No posts in this category.
        </p>
      )}
    </>
  );
}
