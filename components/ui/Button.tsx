"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const reduced = useReducedMotion();

    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-[--primary] text-[--primary-foreground] hover:opacity-90",
      secondary:
        "bg-[--background-secondary] text-[--foreground] border border-[--border] hover:bg-[--border]",
      ghost: "text-[--foreground] hover:bg-[--background-secondary]",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={reduced ? undefined : { scale: 1.02 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
