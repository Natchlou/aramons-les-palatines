import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { createClient } from "@/lib/server";
import Link from "next/link";

const Navbar = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <nav className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Logo />

          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button variant="outline" className="hidden sm:inline-flex" render={<Link href={'/account'} />}>
              Mon compte
            </Button>
          ) : (
            <Button variant="outline" className="hidden sm:inline-flex" render={<Link href={'/auth/login'} />}>
              Se connecter
            </Button>
          )}

          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;