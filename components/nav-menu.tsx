
"use client";

import type { ComponentProps } from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const NavMenu = (
  props: ComponentProps<typeof NavigationMenu>,
) => {
  const isVertical = props.orientation === "vertical";

  return (
    <NavigationMenu
      {...props}
      orientation={props.orientation ?? "horizontal"}
      className={isVertical ? "w-full max-w-none" : props.className}
    >
      <NavigationMenuList
        className={
          isVertical
            ? "flex w-full flex-col items-stretch justify-start gap-1"
            : undefined
        }
      >
        <NavigationMenuItem className={isVertical ? "w-full" : undefined}>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} ${isVertical ? "w-full justify-start" : ""
              }`}
            href="/"
          >
            Accueil
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className={isVertical ? "w-full" : undefined}>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} ${isVertical ? "w-full justify-start" : ""
              }`}
            href="/planning"
          >
            Planning
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className={isVertical ? "w-full" : undefined}>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} ${isVertical ? "w-full justify-start" : ""
              }`}
            href="/admin/dashboard"
          >
            Administration
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className={isVertical ? "w-full" : undefined}>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} ${isVertical ? "w-full justify-start" : ""
              }`}
            href="/contact"
          >
            Me contacter
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
