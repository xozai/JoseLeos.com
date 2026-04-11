"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ROLES = ["PRODUCTS", "INTERFACES", "EXPERIENCES", "SOLUTIONS"];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden px-8 pt-32 pb-48 max-w-[1440px] mx-auto">
      <div className="flex flex-col max-w-5xl">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="section-eyebrow"
        >
          Portfolio · Product Engineer
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="text-[3.5rem] md:text-[5.5rem] font-black tracking-[-0.04em] leading-[0.95] text-[--foreground] mb-10"
        >
          BUILDING{" "}
          <span className="inline-block min-w-[6ch]">
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          THAT SHIP.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="text-xl md:text-2xl text-[--foreground-muted] max-w-2xl leading-relaxed mb-10"
        >
          Designer, developer, and occasional writer. I craft thoughtful digital experiences,
          share what I&apos;m learning, and recommend things I genuinely love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex items-center gap-6"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-[--radius-md] bg-[--primary] text-[--primary-foreground] hover:opacity-80 active:scale-[0.98] transition-all"
          >
            View Selected Work
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-[--foreground-muted] hover:text-[--foreground] underline-offset-4 hover:underline transition-colors"
          >
            Read the Journal →
          </Link>
        </motion.div>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 opacity-[0.04] hidden lg:block select-none pointer-events-none">
        <span className="font-black text-[20rem] leading-none tracking-tighter text-[--foreground]">
          JL.
        </span>
      </div>
    </section>
  );
}
