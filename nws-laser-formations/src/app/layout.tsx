import "./globals.css";
import "@/styles/animations.css";
import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "NWS Laser Formations",
  description: "Plateforme de formations laser en ligne",
  icons: [
    { rel: 'icon', url: '/nws_laser_logo.png' },
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/nws_laser_logo.png' },
    { rel: 'shortcut icon', url: '/nws_laser_logo.png' }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/nws_laser_logo.png" />
        <link rel="shortcut icon" href="/nws_laser_logo.png" />
        <link rel="apple-touch-icon" href="/nws_laser_logo.png" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
