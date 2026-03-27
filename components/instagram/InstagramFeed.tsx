import Image from "next/image";
import { Instagram } from "lucide-react";
import { blurProps } from "@/lib/image";
import { type InstagramMedia } from "@/lib/instagram";

interface InstagramFeedProps {
  posts: InstagramMedia[];
}

export default function InstagramFeed({ posts }: InstagramFeedProps) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {posts.map((post) => {
        const imgSrc = post.media_type === "VIDEO"
          ? (post.thumbnail_url ?? post.media_url)
          : post.media_url;
        const caption = post.caption?.replace(/\n/g, " ").slice(0, 120) ?? "";

        return (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg bg-[--background-secondary] border border-[--border] block"
          >
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={caption || "Instagram post"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                {...blurProps}
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
              <Instagram size={20} className="text-white flex-shrink-0" />
              {caption && (
                <p className="text-white text-xs text-center line-clamp-3 leading-snug">
                  {caption}
                </p>
              )}
            </div>

            {/* Video badge */}
            {post.media_type === "VIDEO" && (
              <span className="absolute top-1.5 right-1.5 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-medium">
                VIDEO
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
