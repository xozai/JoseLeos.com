import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { blurProps } from "@/lib/image";
import { type RecommendationItem } from "@/lib/types";

export default function RecCard({ item }: { item: RecommendationItem }) {
  const { title, recFields } = item;
  const href = recFields.affiliateLink || recFields.itemUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 rounded-xl border border-[--border] hover:border-[--primary] bg-[--background] transition-all"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[--background-secondary] border border-[--border] overflow-hidden relative">
        {recFields.itemImage ? (
          <Image
            src={recFields.itemImage.sourceUrl}
            alt={recFields.itemImage.altText || title}
            fill
            className="object-cover"
            sizes="56px"
            {...blurProps}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[--foreground-muted]">
            {title.charAt(0)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-[--foreground] group-hover:text-[--primary] transition-colors text-sm">
            {title}
          </h3>
          <ExternalLink size={14} className="flex-shrink-0 text-[--foreground-muted] mt-0.5" />
        </div>
        <p className="text-xs text-[--foreground-muted] mt-0.5 line-clamp-2">
          {recFields.shortDescription}
        </p>
        <Badge className="mt-2">{recFields.category}</Badge>
      </div>
    </a>
  );
}
