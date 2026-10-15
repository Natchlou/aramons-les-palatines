"use client";

import { Button } from "@/components/ui/button";
import { sendTestPush } from "@/lib/push-test";

function urlBase64ToUint8Array(base64: string) {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function TestPushButton() {
    const test = async () => {
        try {
            console.log("1. permission:", Notification.permission);
            const reg = await navigator.serviceWorker.register("/sw.js");
            const permission = await Notification.requestPermission();
            console.log("2. permission demandée:", permission);
            if (permission !== "granted") return;

            await navigator.serviceWorker.ready;
            const old = await reg.pushManager.getSubscription();
            await old?.unsubscribe();
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                ),
            });
            console.log("3. abonné:", sub.endpoint);

            const res = await sendTestPush(sub.toJSON() as any);
            console.log("4. résultat serveur:", res);
        } catch (e) {
            console.error("Erreur:", e);
        }
    };

    return <Button onClick={test}>Tester un push</Button>;
}