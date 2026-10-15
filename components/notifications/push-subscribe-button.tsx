// → components/push-subscribe-button.tsx
// À placer là où les utilisateurs peuvent activer les notifications (accueil, paramètres...)
"use client";

import { useEffect, useState } from "react";
import { BellIcon, BellOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveSubscription } from "@/lib/push";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushSubscribeButton() {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      if ((await Notification.requestPermission()) !== "granted") {
        setError("Notifications refusées dans le navigateur.");
        return;
      }
      await navigator.serviceWorker.ready;

      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        }));

      const json = sub.toJSON();
      const res = await saveSubscription({
        endpoint: json.endpoint!,
        keys: json.keys as { p256dh: string; auth: string },
      });

      if (!res.success) throw new Error(res.error);
      setSubscribed(true);
    } catch (e) {
      console.error(e);
      setError("Impossible d'activer les notifications.");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      await sub?.unsubscribe(); // l'entrée en base sera purgée au prochain envoi (410)
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex flex-col gap-2">
      {subscribed ? (
        <Button variant="outline" onClick={unsubscribe} disabled={loading}>
          <BellOffIcon />
          Désactiver les notifications
        </Button>
      ) : (
        <Button onClick={subscribe} disabled={loading}>
          <BellIcon />
          Activer les notifications
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}