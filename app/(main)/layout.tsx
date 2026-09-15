import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import Navbar from "@/components/navbar";
import FormProviders from "../providers";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <Toaster />
      <TooltipProvider>
        <FormProviders>
          {children}
        </FormProviders>
      </TooltipProvider>
    </>
  );
}
