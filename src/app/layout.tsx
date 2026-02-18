import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import GlobalActivityTracker from "@/components/GlobalActivityTracker";
import TopWeatherBar from "@/components/TopWeatherBar";

export const metadata: Metadata = {
  title: "MoLeCul - Moklet Learning Culture Journey",
  description: "A gamified learning experience for SMK Telkom Malang students.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TopWeatherBar />
        <Providers>
          <GlobalActivityTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
