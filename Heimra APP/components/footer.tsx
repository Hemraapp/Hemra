import Link from "next/link";

const legalLinks = [
  { href: "/personvern", label: "Personvern" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/cookies", label: "Cookies" },
  { href: "/forutsetninger", label: "Forutsetninger" }
];

const productLinks = [
  { href: "/kalkulator", label: "Beregn" },
  { href: "/scenario", label: "Vei videre" },
  { href: "/slik-beregnes-det", label: "Metode" }
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200/70 bg-[#f6f3ec] pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <img src="/hemra-logo.png" alt="Hemra" className="h-7 w-auto" />
            <p className="mt-5 max-w-md text-base leading-7 text-stone-700">Et intelligent planleggingsverktøy for førstegangskjøpere som vil forstå hva som stopper dem og hva som hjelper mest.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <FooterGroup title="Produkt" links={productLinks} />
            <FooterGroup title="Informasjon" links={legalLinks} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">{title}</p>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="w-fit text-sm font-semibold text-stone-700 transition hover:text-emerald-900">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
