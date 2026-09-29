"use client";

import { useState } from "react";
import {
  KHMER_IOS_MESSAGE,
  setVoiceLang,
  startVoice,
  stopVoice,
  submitVoiceText,
  useVoiceLang,
  useVoiceState,
} from "@/lib/voice-session";
import { MicIcon } from "./Icons";

const EXAMPLES = {
  "en-US": "“Coffee 2 dollars” · “Tuk tuk 5000 riel”",
  "km-KH": "“កាហ្វេ ២ពាន់រៀល” · “តុកតុក ៥ ដុល្លារ”",
};

/** Mic button + live transcript at the top of the Add Expense form, with a type/dictate fallback. */
export function VoiceBar({ note }: { note?: string }) {
  const voice = useVoiceState();
  const lang = useVoiceLang();
  const listening = voice.status === "listening";
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  // When the mic can't be used (e.g. Khmer on iPhone), offer the text box right away.
  const showText = typing || voice.status === "error";

  function fill() {
    if (!text.trim()) return;
    submitVoiceText(text);
    setText("");
    setTyping(false);
  }

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
            // Khmer on iPhone is a device limit, not a mistake, so it isn't shown in red.
            <div className={`font-medium ${voice.error === KHMER_IOS_MESSAGE ? "text-ink" : "text-danger"}`}>{voice.error}</div>
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

      {showText ? (
        <div className="mt-3 flex gap-2">
          <input
            aria-label="Type or dictate the expense"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter fills the form instead of submitting the whole expense.
              if (e.key === "Enter") {
                e.preventDefault();
                fill();
              }
            }}
            placeholder={lang === "km-KH" ? "e.g. កាហ្វេ ២ពាន់រៀល" : "e.g. Coffee 2 dollars"}
            className="input h-11 min-w-0 flex-1 bg-card text-base"
          />
          <button type="button" onClick={fill} className="btn-primary min-h-11 px-4">
            Fill
          </button>
        </div>
      ) : (
        !listening && (
          <button type="button" onClick={() => setTyping(true)} className="mt-1 text-xs font-semibold text-brand-text">
            Or type / use your keyboard’s 🎤
          </button>
        )
      )}
    </div>
  );
}
