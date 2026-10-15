
"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";

type NavigationSheetProps = {
  isAuthenticated: boolean;
};

export const NavigationSheet = ({
  isAuthenticated,
}: NavigationSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            size="icon"
            variant="outline"
            aria-label="Ouvrir le menu de navigation"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-75 px-6 py-5">
        <VisuallyHidden>
          <SheetTitle>Menu de navigation</SheetTitle>
        </VisuallyHidden>

        <Logo />

        <nav className="mt-8">
          <NavMenu
            orientation="vertical"
            className="w-full [&>div]:h-auto"
          />
        </nav>

        <div className="mt-6 flex flex-col gap-3 border-t pt-5">
          {isAuthenticated ? (
            <Button
              variant="outline"
              className="w-full"
            >
              <Link href="/account">
                Mon compte
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
            >
              <Link href="/auth/login">
                Se connecter
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
