export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function estimateReadingTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function truncate(str: string, length: number): string {
  const stripped = stripHtml(str);
  return stripped.length > length ? stripped.slice(0, length) + "…" : stripped;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
