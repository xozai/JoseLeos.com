import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full",
        variant === "default" &&
          "bg-[--background-secondary] text-[--foreground-muted] border border-[--border]",
        variant === "outline" &&
          "border border-[--primary] text-[--primary]",
        className
      )}
    >
      {children}
    </span>
  );
}
