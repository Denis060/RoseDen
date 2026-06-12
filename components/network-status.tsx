"use client";

import { useEffect, useState } from "react";
import { RefreshCw, SignalLow, WifiOff } from "lucide-react";

type NetworkState = {
  online: boolean;
  constrained: boolean;
};

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function currentNetwork(): NetworkState {
  if (typeof navigator === "undefined") return { online: true, constrained: false };
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return {
    online: navigator.onLine,
    constrained: Boolean(connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType || "")),
  };
}

export function NetworkStatus({ onRetry }: { onRetry?: () => void }) {
  const [network, setNetwork] = useState(currentNetwork);

  useEffect(() => {
    const update = () => setNetwork(currentNetwork());
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    connection?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  if (network.online && !network.constrained) return null;

  return (
    <div className={`admin-print-hidden border-b px-4 py-2 text-xs font-medium ${network.online ? "border-gold/40 bg-gold/10 text-wine" : "border-amber-300 bg-amber-50 text-amber-950"}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-center">
        {network.online ? <SignalLow size={16} className="shrink-0" /> : <WifiOff size={16} className="shrink-0" />}
        <span>{network.online ? "Slow connection detected. RoseDen is using lighter images." : "You are offline. Unfinished forms stay saved on this phone."}</span>
        {!network.online && onRetry ? <button type="button" onClick={onRetry} className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 font-bold"><RefreshCw size={13} />Retry</button> : null}
      </div>
    </div>
  );
}
