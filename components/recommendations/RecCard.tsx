"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/recommendations/StarRating";
import PriceRange from "@/components/recommendations/PriceRange";
import { blurProps } from "@/lib/image";
import { type RecommendationItem } from "@/lib/types";

export default function RecCard({ item }: { item: RecommendationItem }) {
  const { slug, title, recFields, featuredImage } = item;
  const { category, subcategory, verdict, shortDescription, rating,
          priceRange, featured, itemImage } = recFields;
  const reduced = useReducedMotion();

  const coverSrc = featuredImage?.node?.sourceUrl ?? itemImage?.sourceUrl;
  const coverAlt = featuredImage?.node?.altText ?? itemImage?.altText ?? title;
  const summary  = verdict ?? shortDescription ?? "";

  return (
    <Link
      href={`/recommendations/${slug}`}
      className="group relative flex flex-col rounded-xl border border-[--border] bg-[--background] overflow-hidden hover:border-[--primary] transition-all hover:shadow-lg"
    >
      <motion.div
        className="flex flex-col flex-1"
        whileHover={reduced ? undefined : { y: -3 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Featured badge */}
        {featured && (
          <span className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[--primary] text-[--primary-foreground] shadow">
            ⭐ Featured
          </span>
        )}

        {/* Cover image */}
        <div className="aspect-video relative overflow-hidden bg-[--background-secondary]">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={coverAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              {...blurProps}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-[--foreground-muted] opacity-10">
              {title.charAt(0)}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex flex-wrap gap-1.5">
            {category && <Badge variant="outline">{category}</Badge>}
            {subcategory && <Badge variant="outline">{subcategory}</Badge>}
          </div>

          <h3 className="font-semibold text-[--foreground] group-hover:text-[--primary] transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {summary && (
            <p className="text-xs text-[--foreground-muted] line-clamp-2 flex-1">
              {summary}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-2">
              {typeof rating === "number" && rating > 0 && (
                <StarRating rating={rating} size="sm" showLabel />
              )}
            </div>
            {priceRange && <PriceRange range={priceRange} />}
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-[--primary] mt-1">
            See Review <ArrowRight size={12} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
