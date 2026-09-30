"use client";

import { useRef, type ChangeEvent } from "react";
import { newPhotoId, savePhoto, shrinkImage } from "./photos";
import { setTripPhoto } from "./storage";
import { showToast } from "./toast";

/**
 * Add/change a trip's photo from anywhere (e.g. the ⋮ menu): render `input` somewhere on
 * the page and call `choose()` from a tap. Phones offer "Take Photo" or "Photo Library".
 */
export function useTripPhotoPicker(tripId: string) {
  const ref = useRef<HTMLInputElement>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same photo again still triggers a change
    if (!file) return;
    try {
      const id = newPhotoId();
      // Store the photo before pointing the trip at it, so the trip never shows a missing photo.
      await savePhoto(id, await shrinkImage(file));
      setTripPhoto(tripId, id);
      showToast("Photo saved");
    } catch {
      showToast("Couldn't use this photo. Please try another one.");
    }
  }

  // No `capture` attribute, so phones offer both the camera and the photo library.
  const input = <input ref={ref} type="file" accept="image/*" onChange={onChange} className="sr-only" tabIndex={-1} aria-hidden />;

  return { input, choose: () => ref.current?.click() };
}
