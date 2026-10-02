import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import FormProviders from "../providers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";


export const metadata: Metadata = {
  title: "Administration",
  description: "Planning automatisé",
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Toaster />
      <TooltipProvider>
        <FormProviders>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" collapsible="icon" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex w-full flex-1 flex-col">
                <div className="@container/main w-full flex flex-1 flex-col gap-2">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </FormProviders>
      </TooltipProvider>
    </>
  );
}
