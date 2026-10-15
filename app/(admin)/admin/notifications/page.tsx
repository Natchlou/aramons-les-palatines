import { redirect } from "next/navigation";

import { createClient } from "@/lib/server"; // adapte au chemin de ton client Supabase serveur
import { SendNotificationForm } from "@/components/notifications/send-notification-form";

export default async function NotificationsPage() {
  // Même règle que dans lib/push.ts : seuls les emails de ADMIN_EMAILS accèdent à la page
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !admins.includes(email)) {
    redirect("/");
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Envoyer une notification</h1>
        <p className="text-sm text-muted-foreground">
          La notification est envoyée à tous les appareils ayant activé les notifications.
        </p>
      </div>

      <SendNotificationForm />
    </main>
  );
}