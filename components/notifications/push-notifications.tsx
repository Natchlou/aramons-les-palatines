
"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);

  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export default function PushNotifications() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    setLoading(true);
    setMessage("");

    try {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        throw new Error(
          "Les notifications Push ne sont pas prises en charge.",
        );
      }

      if (Notification.permission === "denied") {
        throw new Error(
          "Les notifications sont bloquées dans les réglages du navigateur.",
        );
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("La clé publique VAPID est manquante.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Autorisation de notification refusée.");
      }

      const registration = await navigator.serviceWorker.register(
        "/sw.js",
      );

      await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error(
          "Impossible d'enregistrer l'abonnement sur le serveur.",
        );
      }

      setMessage("Notifications activées avec succès.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Activation..." : "Activer les notifications"}
      </button>

      {message && (
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
