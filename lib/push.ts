import "server-only";
import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY!;
const privateKey = process.env.VAPID_PRIVATE_KEY!;
const subject = process.env.VAPID_SUBJECT!;

if (!publicKey || !privateKey || !subject) {
  throw new Error("Les variables VAPID sont manquantes.");
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export { webpush };
