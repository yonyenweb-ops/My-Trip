"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { VoiceLang } from "./voice";

// Browser speech recognition (Chrome, Edge, Safari). Kept outside React so listening can start
// directly inside a tap handler (browsers require that), before the expense form has opened.

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

export type VoiceStatus = "idle" | "listening" | "error";
export interface VoiceState {
  status: VoiceStatus;
  transcript: string; // live words while listening, final words after
  error?: string;
}

const LANG_KEY = "trip-money-voice-lang";
let state: VoiceState = { status: "idle", transcript: "" };
let rec: Recognition | null = null;
let pendingFinal: string | null = null;
let onFinal: ((text: string) => void) | null = null;
const listeners = new Set<() => void>();

function set(next: VoiceState) {
  state = next;
  listeners.forEach((l) => l());
}

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const isVoiceSupported = () => getCtor() !== null;

export function getVoiceLang(): VoiceLang {
  try {
    return localStorage.getItem(LANG_KEY) === "km-KH" ? "km-KH" : "en-US";
  } catch {
    return "en-US";
  }
}

export function setVoiceLang(lang: VoiceLang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  listeners.forEach((l) => l());
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone is blocked. Allow the microphone for this site in your browser settings.",
  "service-not-allowed": "Voice isn't allowed here. Use the 🎤 key on your keyboard instead.",
  "no-speech": "Didn't hear anything. Tap 🎤 and try again.",
  "audio-capture": "No microphone found.",
  network: "Voice needs an internet connection.",
  "language-not-supported": "This language isn't supported on this device. Try English.",
};

/**
 * Every iPhone/iPad browser (Chrome too) must use Apple's speech engine, which has no Khmer.
 * iPadOS reports itself as a Mac, so also check for touch.
 */
export function isAppleMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

export const KHMER_IOS_MESSAGE =
  "iPhone can't recognize Khmer speech. Type it below, or use the 🎤 on a keyboard that supports Khmer (like Gboard).";

/** Use text typed or dictated with the keyboard's mic, exactly like a spoken sentence. */
export function submitVoiceText(text: string) {
  const t = text.trim();
  if (!t) return;
  rec?.abort();
  rec = null;
  set({ status: "idle", transcript: t });
  if (onFinal) onFinal(t);
}

/** Start listening. Call this directly from a tap/click handler. */
export function startVoice(lang: VoiceLang = getVoiceLang()) {
  if (lang === "km-KH" && isAppleMobile()) {
    set({ status: "error", transcript: "", error: KHMER_IOS_MESSAGE });
    return;
  }
  const Ctor = getCtor();
  if (!Ctor) {
    set({ status: "error", transcript: "", error: "Voice isn't supported in this browser. Use the 🎤 key on your keyboard instead." });
    return;
  }
  rec?.abort();
  const r = new Ctor();
  rec = r;
  r.lang = lang;
  r.interimResults = true;
  r.continuous = false;
  r.maxAlternatives = 1;
  let finalText = "";

  r.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalText += res[0].transcript;
      else interim += res[0].transcript;
    }
    set({ status: "listening", transcript: (finalText + interim).trim() });
  };
  r.onerror = (e) => {
    if (rec !== r || e.error === "aborted") return;
    set({ status: "error", transcript: "", error: ERRORS[e.error] ?? "Couldn't understand. Please try again." });
  };
  r.onend = () => {
    if (rec !== r) return;
    rec = null;
    const text = finalText.trim() || state.transcript;
    if (state.status === "error") return;
    if (!text) {
      set({ status: "error", transcript: "", error: ERRORS["no-speech"] });
      return;
    }
    set({ status: "idle", transcript: text });
    if (onFinal) onFinal(text);
    else pendingFinal = text;
  };

  pendingFinal = null;
  set({ status: "listening", transcript: "" });
  try {
    r.start();
  } catch {
    set({ status: "error", transcript: "", error: "Couldn't start the microphone. Please try again." });
  }
}

export function stopVoice() {
  const r = rec;
  rec = null;
  r?.abort();
  pendingFinal = null;
  set({ status: "idle", transcript: "" });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVoiceState(): VoiceState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useVoiceLang(): VoiceLang {
  return useSyncExternalStore(subscribe, getVoiceLang, () => "en-US" as VoiceLang);
}

/** Calls `handler` with each finished sentence while the component is mounted. */
export function useVoiceResult(handler: (text: string) => void) {
  useEffect(() => {
    onFinal = handler;
    // A sentence finished before the form opened: deliver it now.
    if (pendingFinal) {
      const text = pendingFinal;
      pendingFinal = null;
      queueMicrotask(() => handler(text));
    }
    return () => {
      if (onFinal === handler) onFinal = null;
    };
  }, [handler]);
}
