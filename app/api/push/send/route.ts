
import { NextResponse } from "next/server";
import { webpush } from "@/lib/push";
import { createClient } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("title" in body) ||
      !("body" in body)
    ) {
      return NextResponse.json(
        { error: "Titre et message obligatoires." },
        { status: 400 },
      );
    }

    const { title, body: message, url } = body as {
      title: string;
      body: string;
      url?: string;
    };

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 100 ||
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 500 ||
      (url !== undefined &&
        (typeof url !== "string" ||
          !url.startsWith("/") ||
          url.startsWith("//")))
    ) {
      return NextResponse.json(
        { error: "Contenu invalide." },
        { status: 400 },
      );
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Erreur de lecture des abonnements." },
        { status: 500 },
      );
    }

    let sent = 0;
    let failed = 0;

    for (const item of subscriptions ?? []) {
      try {
        await webpush.sendNotification(
          item.subscription,
          JSON.stringify({
            title: title.trim(),
            body: message.trim(),
            url: url ?? "/",
          }),
        );

        sent++;
      } catch (error) {
        failed++;

        const statusCode = (
          error as { statusCode?: number }
        ).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", item.id)
            .eq("user_id", user.id);
        } else {
          console.error("Erreur Push :", statusCode ?? error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscriptions?.length ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'envoyer les notifications." },
      { status: 400 },
    );
  }
}
