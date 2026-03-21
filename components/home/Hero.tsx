"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ROLES = [
  "I design & build",
  "I craft interfaces",
  "I ship products",
  "I write about code",
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-sm text-[--foreground-muted] mb-6 px-3 py-1 rounded-full border border-[--border] bg-[--background-secondary]"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Available for new projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[--foreground] mb-6 leading-tight"
        >
          Hi, I&apos;m Jose Leos.
          <br />
          <span className="text-[--primary] inline-block min-w-[14ch]">
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          digital things.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="text-lg text-[--foreground-muted] mb-8 leading-relaxed max-w-xl"
        >
          Designer, developer, and occasional writer. I craft thoughtful digital experiences,
          share what I&apos;m learning, and recommend things I genuinely love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[--primary] text-[--primary-foreground] font-medium text-sm hover:opacity-90 transition-opacity"
          >
            View My Work
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[--border] text-[--foreground] font-medium text-sm hover:bg-[--background-secondary] transition-colors"
          >
            <Download size={16} />
            Download CV
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
