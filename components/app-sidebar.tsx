"use client"

import * as React from "react"
import Link from "next/link"
import {
  FeatherIcon,
  UserIcon,
  BrushCleaningIcon,
  UtensilsIcon,
  DockIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { SidebarUser } from "@/lib/auth-user"

const navMain = [
  { title: "Tableau de bord", url: "/admin",              icon: <LayoutDashboardIcon /> },
  { title: "Planning",        url: "/admin/planning",     icon: <DockIcon /> },
  { title: "Résidents",       url: "/admin/residents",    icon: <UserIcon /> },
  { title: "Agent d'entretien", url: "/admin/agents",     icon: <BrushCleaningIcon /> },
  { title: "Restaurant",      url: "/admin/restaurant",   icon: <UtensilsIcon /> },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SidebarUser
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/" />}
            >
              <FeatherIcon className="size-5!" />
              <span className="text-base font-semibold">Aramons Les Palatines</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}