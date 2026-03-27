"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Set to true for items in a staggered list — index-based delay is added automatically */
  index?: number;
}

export default function FadeIn({ children, delay = 0, className, index }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  const staggerDelay = index !== undefined ? index * 0.08 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: delay + staggerDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
