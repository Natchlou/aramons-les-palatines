import "server-only";
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const privateKey = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!;
const subject = process.env.NEXT_PUBLIC_VAPID_SUBJECT!;

if (!publicKey || !privateKey || !subject) {
  throw new Error("Les variables VAPID sont manquantes.");
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export { webpush };
