"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "trip-money-install-dismissed";
const noopSubscribe = () => () => {};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// iPhone/iPad browsers have no install button; the user must use Share → Add to Home Screen.
// Chrome keeps Share in the address bar, Safari keeps it in the ••• menu.
const iosBrowser = (): "chrome" | "safari" | null => {
  const ua = navigator.userAgent;
  if (!/iphone|ipad|ipod/i.test(ua) || isStandalone()) return null;
  return /CriOS/i.test(ua) ? "chrome" : "safari";
};

/** The iOS Share symbol: a box with an arrow pointing up. */
function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="-mt-1 inline h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

/** Small banner offering to install the app on the home screen. */
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const hidden = useSyncExternalStore(noopSubscribe, () => isStandalone() || wasDismissed(), () => true);
  const ios = useSyncExternalStore(noopSubscribe, iosBrowser, () => null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || dismissed || (!installEvent && !ios)) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-semibold">Install Trip Money</div>
        <div className="text-muted">
          {ios === "chrome" ? (
            <>
              Tap <ShareIcon /> <b>Share</b> at the top right → <b>Add to Home Screen</b>
            </>
          ) : ios === "safari" ? (
            <>
              Tap <b>•••</b> → <b>Share</b> <ShareIcon /> → <b>Add to Home Screen</b>
            </>
          ) : (
            "Open it like an app, even offline"
          )}
        </div>
      </div>
      {!ios && (
        <button type="button" onClick={install} className="btn-primary min-h-10 px-4 text-sm">
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-10 w-8 shrink-0 items-center justify-center text-xl text-brand-text"
      >
        ×
      </button>
    </div>
  );
}
