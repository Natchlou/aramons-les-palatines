import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Mon compte
        </h1>

        <p className="mt-2 text-muted-foreground">
          Gérez les informations de votre compte.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Vos informations personnelles.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium">Identifiant</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compte */}
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>
              Informations concernant votre compte.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Statut
                </p>

                <p className="text-sm text-muted-foreground">
                  Compte actif
                </p>
              </div>

              <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                Actif
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card>
          <CardHeader>
            <CardTitle>Déconnexion</CardTitle>
            <CardDescription>
              Déconnectez-vous de votre compte sur cet appareil.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="destructive">
                Se déconnecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}