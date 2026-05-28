import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Desde el Campo",
  description: "Panel administrativo para gestionar lotes, publicidad y contenido del sitio.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
