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

// iPhone/iPad Safari has no install button; the user must use Share → Add to Home Screen.
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone();

/** Small banner offering to install the app on the home screen. */
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const hidden = useSyncExternalStore(noopSubscribe, () => isStandalone() || wasDismissed(), () => true);
  const ios = useSyncExternalStore(noopSubscribe, isIos, () => false);

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
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-semibold text-emerald-900">Install Trip Money</div>
        <div className="text-emerald-800">
          {ios ? (
            <>
              Tap <b>Share</b> <span aria-hidden>⎋</span> then <b>Add to Home Screen</b>
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
        className="flex h-10 w-8 shrink-0 items-center justify-center text-xl text-emerald-700"
      >
        ×
      </button>
    </div>
  );
}
