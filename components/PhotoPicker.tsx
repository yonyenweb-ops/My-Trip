"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { shrinkImage } from "@/lib/photos";
import { CameraIcon } from "./Icons";
import { TripPhoto } from "./TripPhoto";

/** What the form should do with the trip photo when saved. */
export type PhotoChoice =
  | { kind: "keep" } // leave the saved photo (or no photo) as it is
  | { kind: "new"; blob: Blob; url: string } // a newly picked, already shrunk photo + preview URL
  | { kind: "none" }; // remove the saved photo

type Props = {
  savedPhotoId?: string;
  value: PhotoChoice;
  onChange: (choice: PhotoChoice) => void;
};

/** Optional trip photo: take one with the camera or pick from the library, preview, change, remove. */
export function PhotoPicker({ savedPhotoId, value, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const showSaved = value.kind === "keep" && savedPhotoId;
  const hasPhoto = value.kind === "new" || showSaved;

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same photo again still triggers a change
    if (!file) return;
    setBusy(true);
    setError(undefined);
    try {
      const blob = await shrinkImage(file);
      if (value.kind === "new") URL.revokeObjectURL(value.url);
      onChange({ kind: "new", blob, url: URL.createObjectURL(blob) });
    } catch {
      setError("Couldn't read this photo. Please try another one.");
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (value.kind === "new") URL.revokeObjectURL(value.url);
    onChange(savedPhotoId ? { kind: "none" } : { kind: "keep" });
  }

  return (
    <div>
      <div className="label">
        Trip Photo <span className="font-normal text-faint">(optional)</span>
      </div>
      {/* No `capture` attribute, so phones offer both "Take Photo" and "Photo Library". */}
      <input ref={input} type="file" accept="image/*" onChange={pick} className="sr-only" tabIndex={-1} aria-hidden />

      {hasPhoto ? (
        <div className="relative overflow-hidden rounded-2xl">
          {value.kind === "new" ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview blob
            <img src={value.url} alt="Trip photo preview" className="h-44 w-full object-cover" />
          ) : (
            <TripPhoto photoId={savedPhotoId!} className="h-44" />
          )}
          <div className="absolute right-2 bottom-2 flex gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="min-h-10 rounded-xl bg-white/90 px-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white"
            >
              {busy ? "Loading…" : "Change"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="min-h-10 rounded-xl bg-white/90 px-3 text-sm font-semibold text-red-600 shadow-sm backdrop-blur hover:bg-white"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-soft text-muted transition-colors hover:border-brand hover:text-brand-text"
        >
          <CameraIcon size={28} />
          <span className="font-semibold">{busy ? "Loading photo…" : "Add a trip photo"}</span>
          <span className="text-xs text-faint">Take a photo or choose from your library</span>
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
