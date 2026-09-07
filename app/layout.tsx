import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./simulator.css";
import "./ui-fixes.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clareia Educação | Estude com mais clareza",
  description: "Plataforma Clareia: cronograma, questões, simulados, provas do ENEM, redação, Inglês e acompanhamento do seu progresso.",
  applicationName: "Clareia",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Clareia", statusBarStyle: "default" },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/clareia-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/clareia-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/clareia-icon-32.png",
    apple: { url: "/clareia-icon-180.png", sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161b31",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
