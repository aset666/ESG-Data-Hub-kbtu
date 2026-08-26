import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ESG Data Hub — Карта ESG-данных университета",
  description: "Централизованная система-инвентарь ESG-данных университета",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
