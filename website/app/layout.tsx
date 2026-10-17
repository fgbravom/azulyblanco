import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `Club Deportivo ${SITE_CONFIG.name} | Fútbol amateur en Curicó`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  keywords: ['azul y blanco', 'club deportivo azul y blanco', 'azul y blanco curicó', 'fútbol amateur curicó', 'fútbol amateur'],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  // './' se resuelve con la ruta de cada página: cada una apunta a sí misma
  // en el dominio de producción (evita duplicados con *.vercel.app)
  alternates: {
    canonical: './',
  },
  // La imagen la pone app/opengraph-image.png
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: './',
    siteName: SITE_CONFIG.name,
    title: `Club Deportivo ${SITE_CONFIG.name} - Fútbol amateur en Curicó`,
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Club Deportivo ${SITE_CONFIG.name} - Fútbol amateur en Curicó`,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={openSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ScrollToTop />
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
