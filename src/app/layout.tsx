import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desde el Campo 2026 | Noticias y Marketplace Agropecuario",
  description:
    "Portal agropecuario de San Cristóbal, Santa Fe. Noticias del campo, remates ganaderos, precios de hacienda y marketplace de lotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
