"use client";

import { setVoiceLang, startVoice, stopVoice, useVoiceLang, useVoiceState } from "@/lib/voice-session";
import { MicIcon } from "./Icons";

const EXAMPLES = {
  "en-US": "“Coffee 2 dollars” · “Tuk tuk 5000 riel”",
  "km-KH": "“កាហ្វេ ២ពាន់រៀល” · “តុកតុក ៥ ដុល្លារ”",
};

/** Mic button + live transcript at the top of the Add Expense form. */
export function VoiceBar({ note }: { note?: string }) {
  const voice = useVoiceState();
  const lang = useVoiceLang();
  const listening = voice.status === "listening";

  return (
    <div className={`rounded-2xl border p-3 transition-colors ${listening ? "border-brand bg-brand-soft" : "border-line bg-soft"}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (listening ? stopVoice() : startVoice(lang))}
          aria-label={listening ? "Stop listening" : "Speak the expense"}
          aria-pressed={listening}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95 ${
            listening ? "bg-red-500" : "bg-brand"
          }`}
        >
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" aria-hidden />}
          <MicIcon size={22} className="relative" />
        </button>

        <div className="min-w-0 flex-1 text-sm" aria-live="polite">
          {listening ? (
            <>
              <div className="font-semibold text-brand-text">Listening…</div>
              <div className="truncate text-ink">{voice.transcript || "Say the item and the price"}</div>
            </>
          ) : voice.status === "error" ? (
            <div className="font-medium text-danger">{voice.error}</div>
          ) : voice.transcript ? (
            <>
              <div className="truncate">
                Heard: <span className="font-semibold">“{voice.transcript}”</span>
              </div>
              <div className="text-xs text-muted">{note ?? "Check the details, then tap Add Expense."}</div>
            </>
          ) : (
            <>
              <div className="font-semibold">Tap 🎤 and say it</div>
              <div className="truncate text-xs text-muted">{EXAMPLES[lang]}</div>
            </>
          )}
        </div>

        <div role="group" aria-label="Voice language" className="flex shrink-0 flex-col gap-0.5 rounded-xl bg-card p-0.5 text-[11px] font-bold">
          {(["en-US", "km-KH"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setVoiceLang(l)}
              aria-pressed={lang === l}
              className={`min-h-7 rounded-lg px-2 ${lang === l ? "bg-brand text-white" : "text-muted"}`}
            >
              {l === "en-US" ? "EN" : "ខ្មែរ"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
