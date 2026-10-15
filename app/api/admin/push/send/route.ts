
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { webpush } from "@/lib/push";
import { createClient } from "@/lib/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Protection contre les requêtes intersites.
    const origin = request.headers.get("origin");

    if (!origin || origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Origine non autorisée." },
        { status: 403 },
      );
    }

    // Vérification de l'utilisateur connecté.
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

    // Seuls les administrateurs peuvent envoyer à tout le monde.
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs." },
        { status: 403 },
      );
    }

    const payload: unknown = await request.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 },
      );
    }

    const { title, body, url } = payload as {
      title?: unknown;
      body?: unknown;
      url?: unknown;
    };

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 100 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.length > 500 ||
      (url !== undefined &&
        (typeof url !== "string" ||
          !url.startsWith("/") ||
          url.startsWith("//")))
    ) {
      return NextResponse.json(
        { error: "Titre, message ou URL invalide." },
        { status: 400 },
      );
    }

    // Lecture globale avec le client privilégié.
    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, subscription");

    if (error) {
      console.error("Lecture des abonnements :", error.message);

      return NextResponse.json(
        { error: "Impossible de récupérer les abonnements." },
        { status: 500 },
      );
    }

    let sent = 0;
    let failed = 0;
    let removed = 0;

    // Lots pour limiter le nombre d'envois simultanés.
    const batchSize = 20;

    for (let i = 0; i < (subscriptions ?? []).length; i += batchSize) {
      const batch = subscriptions!.slice(i, i + batchSize);

      const results = await Promise.all(
        batch.map(async (item) => {
          try {
            await webpush.sendNotification(
              item.subscription,
              JSON.stringify({
                title: title.trim(),
                body: body.trim(),
                url: url ?? "/",
              }),
              { TTL: 60 * 60 },
            );

            return { id: item.id, status: "sent" as const };
          } catch (error) {
            const statusCode = (
              error as { statusCode?: number }
            ).statusCode;

            if (statusCode === 404 || statusCode === 410) {
              return { id: item.id, status: "expired" as const };
            }

            console.error("Erreur Push :", statusCode ?? error);

            return { id: item.id, status: "failed" as const };
          }
        }),
      );

      sent += results.filter((r) => r.status === "sent").length;
      failed += results.filter((r) => r.status === "failed").length;

      const expiredIds = results
        .filter((r) => r.status === "expired")
        .map((r) => r.id);

      if (expiredIds.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .in("id", expiredIds);

        if (deleteError) {
          console.error("Nettoyage des abonnements :", deleteError.message);
        } else {
          removed += expiredIds.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: subscriptions?.length ?? 0,
      sent,
      failed,
      removed,
    });
  } catch (error) {
    console.error("Envoi global Push :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue pendant l'envoi." },
      { status: 500 },
    );
  }
}
