"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

export type NavItem = {
  href: string;
  label: string;
  icon?: string;
};

export function DashboardShell({
  title,
  nav,
  userName,
  roleLabel,
  children,
}: {
  title: string;
  nav: NavItem[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-100 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 px-5 border-b border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold">
            E
          </div>
          <span className="font-semibold">EduGestão</span>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== nav[0]?.href && pathname.startsWith(item.href + "/")) ||
              (pathname.startsWith(item.href) && item.href.split("/").length > 2);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className="w-5 text-center">{item.icon ?? "•"}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden rounded-lg p-2 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700 leading-tight">{userName}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
