import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

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
      !("endpoint" in body) ||
      !("keys" in body)
    ) {
      return NextResponse.json(
        { error: "Abonnement invalide." },
        { status: 400 },
      );
    }

    const subscription = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (
      typeof subscription.endpoint !== "string" ||
      !subscription.endpoint.startsWith("https://") ||
      typeof subscription.keys?.p256dh !== "string" ||
      typeof subscription.keys?.auth !== "string"
    ) {
      return NextResponse.json(
        { error: "Données d'abonnement invalides." },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          subscription,
        },
        { onConflict: "endpoint" },
      );

    if (error) {
      console.error("Erreur Supabase :", error.message);

      return NextResponse.json(
        { error: "Impossible d'enregistrer l'abonnement." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 },
    );
  }
}
