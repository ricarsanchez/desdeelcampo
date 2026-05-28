import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noticias · Admin · Desde el Campo",
  description: "Gestión de noticias del sitio.",
};

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
