import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { MetaPixel } from "@/components/analytics/meta-pixel";

// Geist for headings + UI text. JetBrains Mono is reserved for numeric
// data (weight, doses, prices) — see the `font-numeric` utility.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CanetaOS - Clareza durante a jornada",
  description:
    "Plataforma de acompanhamento e educação para pessoas que utilizam medicamentos da classe GLP-1 e desejam organizar sua jornada com mais clareza.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CanetaOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
          <MetaPixel />
        </ThemeProvider>
      </body>
    </html>
  );
}
