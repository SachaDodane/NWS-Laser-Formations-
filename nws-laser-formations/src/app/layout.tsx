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
  icons: {
    icon: '/nws_laser_logo.png',
    apple: '/nws_laser_logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
