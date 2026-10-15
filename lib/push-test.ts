"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:n.jullien57@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendTestPush(sub: webpush.PushSubscription) {
  try {
    const res = await webpush.sendNotification(
      sub,
      JSON.stringify({ title: "Test Aramons", body: "Push reçu !", url: "/" }),
    );
    return { ok: true, status: res.statusCode };
  } catch (e: any) {
    console.error("web-push:", e.statusCode, e.body);
    return { ok: false, status: e.statusCode, body: e.body };
  }
}