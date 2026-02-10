import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jubilación Pro v2.0 | Simulador Avanzado de Retiro y Libertad Financiera",
  description: "Planifica tu jubilación con precisión matemática. Calcula tu ahorro, interés compuesto, impacto de la inflación y sostenibilidad de tu capital hasta los 100 años.",
  keywords: ["jubilación", "retiro", "finanzas personales", "libertad financiera", "simulador financiero", "plan de ahorro", "interés compuesto", "inflación"],
  authors: [{ name: "Jubilación Pro Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Jubilación Pro v2.0 | Planifica tu Futuro Financiero",
    description: "Calculadora de retiro avanzada con visualización de datos en tiempo real.",
    url: "https://jubilacion-pro.vercel.app",
    siteName: "Jubilación Pro",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jubilación Pro | Tu Guía para el Retiro",
    description: "Visualiza tu futuro financiero con nuestro simulador avanzado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
