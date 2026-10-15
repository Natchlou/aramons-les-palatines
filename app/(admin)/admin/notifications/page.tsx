
import { redirect } from "next/navigation";
import PushBroadcastForm from "@/components/admin/push-broadcast-form";
import { createClient } from "@/lib/server";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-6 lg:p-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">
          Administration
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Notifications Push
        </h1>

        <p className="max-w-2xl text-sm text-muted-foreground">
          Envoie une notification aux appareils des utilisateurs
          qui ont activé les notifications.
        </p>
      </header>

      <PushBroadcastForm />
    </main>
  );
}
