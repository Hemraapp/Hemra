import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const lastUpdatedLabel = "29. april 2026";

const infoNav = [
  { href: "/personvern", label: "Personvern" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/cookies", label: "Cookies" },
  { href: "/forutsetninger", label: "Forutsetninger" }
];

export function InfoPage({
  title,
  intro,
  children
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-[#fbfaf7]">
        <section className="relative border-b border-stone-200/70 bg-[#f6f3ec] px-4 py-16 sm:px-6 lg:py-24">
          <div className="absolute right-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full border border-emerald-950/10" aria-hidden="true" />
          <div className="absolute bottom-[-90px] right-[18%] h-44 w-44 rounded-full bg-emerald-950/[0.05] blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_0.55fr] lg:items-end">
              <div className="animate-[fadeIn_360ms_ease-out]">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Informasjon</p>
                <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">{title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">{intro}</p>
              </div>
              <aside className="animate-[fadeIn_520ms_ease-out] rounded-[28px] bg-white/72 p-5 shadow-[0_24px_70px_rgba(28,25,23,0.08)] ring-1 ring-white/70 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Sist oppdatert</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{lastUpdatedLabel}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {infoNav.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-full bg-stone-50 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:bg-emerald-50 hover:text-emerald-900">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.35fr_1fr] lg:py-20">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l border-stone-200 pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">Leseretning</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">Kort forklart først. Detaljene ligger i tydelige avsnitt, slik at siden kan leses uten å føles som et juridisk dokument.</p>
            </div>
          </aside>
          <div className="space-y-4">{children}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function InfoSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="group rounded-[24px] bg-white/76 p-6 shadow-sm ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:p-7">
      <div className="flex gap-4">
        <span className="mt-2 h-1.5 w-8 shrink-0 rounded-full bg-emerald-800 transition group-hover:w-10" aria-hidden="true" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl bg-stone-50/80 px-4 py-3 text-sm leading-6 text-stone-700">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
