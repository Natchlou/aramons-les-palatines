import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"
import SystemBanner from "@/components/8starlabs-ui/system-banner";
import { GooeyToaster } from "@/components/ui/goey-toaster";
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Résidence Séniors Aramons Les Palatines",
  description: "Planning automatisé",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aramons",
  },
  icons: {
    apple: "/icons/180.png",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#171717"
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full w-full flex flex-col">
        <Analytics />
        <SystemBanner 
          text="Vous êtes en mode développeur"
          color="bg-orange-500"
          size="sm"
          show={process.env.NODE_ENV === "development"}
        />
        {children}
        <GooeyToaster position="top-right" showProgress closeButton="top-right" />
      </body>
    </html>
  );
}
