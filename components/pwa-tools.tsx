"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The web app remains fully usable when registration is unavailable.
      });
    }
  }, []);
  return null;
}

export function InstallAppButton({ onComplete }: { onComplete?: () => void }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone) setInstalled(true);
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (installed) {
    return <p className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">RoseDen OS is installed on this device.</p>;
  }

  return (
    <button
      type="button"
      disabled={!prompt}
      onClick={async () => {
        if (!prompt) return;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          onComplete?.();
        }
        setPrompt(null);
      }}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-burgundy disabled:bg-black/5 disabled:text-black/40"
    >
      <Download size={18} />
      {prompt ? "Install RoseDen OS" : "Use browser menu: Add to Home Screen"}
    </button>
  );
}
