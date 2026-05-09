"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Hjem" },
  { href: "/kalkulator", label: "Beregn" },
  { href: "/scenario", label: "Vei videre" },
  { href: "/slik-beregnes-det", label: "Metode" }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fbfaf7]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80" aria-label="Hemra hjem">
          <img src="/hemra-logo.png" alt="Hemra" className="h-7 w-auto sm:h-8" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${pathname === item.href ? "bg-stone-950 text-white shadow-sm" : "text-stone-600 hover:bg-white hover:text-stone-950 hover:shadow-sm"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-full border border-stone-200 bg-white/95 p-1 shadow-[0_18px_45px_rgba(28,25,23,0.16)] backdrop-blur md:hidden">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-center text-xs font-semibold transition ${pathname === item.href ? "bg-emerald-900 text-white" : "text-stone-600"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/kalkulator" className="rounded-full bg-[#063F32] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#052f26] hover:shadow-md">
          Start beregning
        </Link>
      </div>
    </header>
  );
}

