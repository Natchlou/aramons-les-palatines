"use client";

import { Button } from "@/components/ui/button";
import { saveSubscription } from "@/lib/push";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle() {
  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    if ((await Notification.requestPermission()) !== "granted") return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });

    const json = sub.toJSON();
    await saveSubscription({
      endpoint: json.endpoint!,
      keys: json.keys as { p256dh: string; auth: string },
    });
  };

  return <Button onClick={subscribe}>Activer les notifications</Button>;
}