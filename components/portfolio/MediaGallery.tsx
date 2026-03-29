"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface MediaGalleryProps {
  images: { sourceUrl: string; altText: string }[];
}

export default function MediaGallery({ images }: MediaGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<{ sourceUrl: string; altText: string } | null>(null);

  function openImage(img: { sourceUrl: string; altText: string }) {
    setActive(img);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    setActive(null);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) closeDialog();
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-8">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openImage(img)}
            className="relative aspect-video bg-[--background-secondary] rounded-lg overflow-hidden group border border-[--border] hover:border-[--primary] transition-colors cursor-zoom-in"
            aria-label={`View ${img.altText || `screenshot ${i + 1}`} full size`}
          >
            <Image
              src={img.sourceUrl}
              alt={img.altText}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </button>
        ))}
      </div>

      {/* Native dialog lightbox */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto w-full max-w-5xl bg-transparent p-4 backdrop:bg-black/80 outline-none"
        onClick={handleBackdropClick}
        onClose={() => setActive(null)}
      >
        <div className="relative">
          <button
            onClick={closeDialog}
            className="absolute -top-10 right-0 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            aria-label="Close image"
          >
            <X size={16} /> Close
          </button>
          {active && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              <Image
                src={active.sourceUrl}
                alt={active.altText}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
