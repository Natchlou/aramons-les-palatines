// → lib/push.ts
"use server";

import webpush from "web-push";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/server"; // adapte au chemin de ton client Supabase serveur

webpush.setVapidDetails(
  "mailto:ton-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

/** Client service_role : contourne la RLS, à n'utiliser que côté serveur. */
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Vérifie que l'utilisateur connecté est autorisé à envoyer des notifications.
 * Ici : liste d'emails dans ADMIN_EMAILS (séparés par des virgules).
 * Adapte à ton système de rôles si tu en as un.
 */
async function assertAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !admins.includes(email.toLowerCase())) {
    throw new Error("Non autorisé");
  }
}

/** Enregistre l'abonnement push de l'appareil courant. */
export async function saveSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const { error } = await getAdminClient()
    .from("push_subscriptions")
    .upsert(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      { onConflict: "endpoint" },
    );

  return { success: !error, error: error?.message };
}

export type SendResult = {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  removed: number;
  error?: string;
};

/** Envoie une notification à tous les appareils enregistrés. */
export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<SendResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, total: 0, sent: 0, failed: 0, removed: 0, error: "Non autorisé" };
  }

  const title = payload.title.trim();
  const body = payload.body.trim();
  if (!title || !body) {
    return { success: false, total: 0, sent: 0, failed: 0, removed: 0, error: "Titre et message requis" };
  }

  const admin = getAdminClient();
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("*");

  if (error) {
    return { success: false, total: 0, sent: 0, failed: 0, removed: 0, error: error.message };
  }

  const message = JSON.stringify({ title, body, url: payload.url || "/" });
  const expired: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          message,
        );
        sent++;
      } catch (e: any) {
        failed++;
        // Abonnement expiré ou révoqué : on le supprime
        if (e.statusCode === 404 || e.statusCode === 410) {
          expired.push(s.endpoint);
        }
      }
    }),
  );

  if (expired.length > 0) {
    await admin.from("push_subscriptions").delete().in("endpoint", expired);
  }

  return {
    success: true,
    total: subs?.length ?? 0,
    sent,
    failed,
    removed: expired.length,
  };
}