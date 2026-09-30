"use client";

import type { ReactNode } from "react";
import { usePhotoUrl } from "@/lib/photos";

/** A trip's photo filling its box (object-cover). Shows a soft placeholder while it loads. */
export function TripPhoto({ photoId, className = "" }: { photoId: string; className?: string }) {
  const url = usePhotoUrl(photoId);
  return (
    <div className={`overflow-hidden bg-soft ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL, not optimizable */}
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

/** Cover banner: the trip photo with the title laid over a dark gradient for readability. */
export function TripCover({ photoId, children }: { photoId: string; children: ReactNode }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-[28px]">
      <TripPhoto photoId={photoId} className="h-44 sm:h-56" />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">{children}</div>
    </div>
  );
}
