"use client";

import { useEffect, useState } from "react";

// Trip photos live in IndexedDB, not localStorage: localStorage only holds ~5 MB in total,
// and the trip/expense data must never be squeezed out by pictures.

const DB_NAME = "trip-money-photos";
const STORE = "photos";
const MAX_SIDE = 1600; // px; plenty for a cover on any screen
const QUALITY = 0.82;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const savePhoto = (id: string, blob: Blob) => run<IDBValidKey>("readwrite", (s) => s.put(blob, id));
export const getPhoto = (id: string) => run<Blob | undefined>("readonly", (s) => s.get(id));
export const deletePhoto = (id: string) => run<undefined>("readwrite", (s) => s.delete(id)).catch(() => undefined);

export const newPhotoId = () => `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Shrinks a camera photo (often 3–10 MB) to a JPEG of at most 1600 px on its long side,
 * usually 150–300 KB, keeping the phone's rotation.
 */
export async function shrinkImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read this image"))), "image/jpeg", QUALITY),
  );
}

/** Object URL for a stored photo, or undefined while loading / when missing. */
export function usePhotoUrl(photoId?: string): string | undefined {
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!photoId) return;
    let alive = true;
    let url: string | undefined;
    getPhoto(photoId)
      .then((blob) => {
        if (!alive || !blob) return;
        url = URL.createObjectURL(blob);
        setLoaded({ id: photoId, url });
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [photoId]);

  return loaded && loaded.id === photoId ? loaded.url : undefined;
}
