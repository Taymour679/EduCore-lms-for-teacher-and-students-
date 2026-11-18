"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] bg-warning px-4 py-2 text-center text-sm text-white" role="status">
      You are offline. Changes will not save until the connection returns.
    </div>
  );
}
