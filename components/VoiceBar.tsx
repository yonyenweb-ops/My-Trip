"use client";

import { useState } from "react";
import { startVoice, stopVoice, submitVoiceText, useVoiceState } from "@/lib/voice-session";
import { MicIcon } from "./Icons";

/** Mic button (English) + live transcript at the top of the Add Expense form, with a type fallback. */
export function VoiceBar({ note }: { note?: string }) {
  const voice = useVoiceState();
  const listening = voice.status === "listening";
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  // When the mic can't be used, offer the text box right away.
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
          onClick={() => (listening ? stopVoice() : startVoice())}
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
              <div className="font-semibold">Tap 🎤 and say it in English</div>
              <div className="truncate text-xs text-muted">“Coffee 2 dollars” · “Tuk tuk 5000 riel”</div>
            </>
          )}
        </div>
      </div>

      {showText ? (
        <div className="mt-3 flex gap-2">
          <input
            aria-label="Type the expense"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter fills the form instead of submitting the whole expense.
              if (e.key === "Enter") {
                e.preventDefault();
                fill();
              }
            }}
            placeholder="e.g. Coffee 2 dollars"
            className="input h-11 min-w-0 flex-1 bg-card text-base"
          />
          <button type="button" onClick={fill} className="btn-primary min-h-11 px-4">
            Fill
          </button>
        </div>
      ) : (
        !listening && (
          <button type="button" onClick={() => setTyping(true)} className="mt-1 text-xs font-semibold text-brand-text">
            Or type it instead
          </button>
        )
      )}
    </div>
  );
}
