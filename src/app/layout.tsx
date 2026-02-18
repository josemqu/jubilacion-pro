import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jubilacion-pro.vercel.app"),
  title: "Jubilación Pro | Simulador Avanzado de Retiro",
  description: "Planifica tu jubilación con precisión matemática. Calcula tu ahorro, interés compuesto, impacto de la inflación y sostenibilidad de tu capital hasta los 100 años.",
  keywords: ["jubilación", "retiro", "finanzas personales", "libertad financiera", "simulador financiero", "plan de ahorro", "interés compuesto", "inflación", "calculadora de retiro"],
  authors: [{ name: "Jubilación Pro Team" }],
  publisher: "Jubilación Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Jubilación Pro | Planifica tu Futuro Financiero",
    description: "Calculadora de retiro avanzada con visualización de datos en tiempo real. ¿Cuándo podrás retirarte?",
    url: "https://jubilacion-pro.vercel.app",
    siteName: "Jubilación Pro",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Jubilación Pro Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jubilación Pro | Tu Guía para el Retiro",
    description: "Visualiza tu futuro financiero con nuestro simulador avanzado. Análisis de interés compuesto e inflación.",
    images: ["/icon.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jubilación Pro",
    "operatingSystem": "All",
    "applicationCategory": "FinanceApplication",
    "description": "Simulador avanzado de jubilación y libertad financiera con cálculos de interés compuesto e inflación.",
    "softwareVersion": "2.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Simulación de interés compuesto",
      "Ajuste por inflación",
      "Proyección de patrimonio hasta los 100 años",
      "Exportación a Excel",
      "Análisis de margen de seguridad"
    ]
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
