"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/", label: "Каталог" },
  { href: "/heatmap", label: "Gaps / Heatmap" },
  { href: "/audit-log", label: "Журнал изменений" },
  { href: "/about", label: "О системе" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  if (pathname === "/login") return null;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-slate-900 text-lg tracking-tight">
            ESG Data Hub
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  pathname === l.href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/metrics/new" className="btn-primary">
              + Новая запись
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="text-right hidden sm:block">
                <div className="font-medium text-slate-800">{user.full_name}</div>
                <div className="text-xs text-slate-400">{user.role === "admin" ? "Администратор" : "Наблюдатель"}</div>
              </div>
              <button onClick={logout} className="btn-secondary">
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
      <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium ${
              pathname === l.href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
