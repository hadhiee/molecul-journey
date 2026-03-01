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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "MoLeCul - Moklet Learning Culture Journey",
    description: "Aplikasi simulasi budaya sekolah SMK Telkom Malang. Belajar sambil bermain! 🎮📚",
    siteName: "MoLeCul",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MoLeCul - Moklet Learning Culture Journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoLeCul - Moklet Learning Culture Journey",
    description: "Aplikasi simulasi budaya sekolah SMK Telkom Malang. Belajar sambil bermain! 🎮📚",
    images: ["/opengraph-image"],
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
