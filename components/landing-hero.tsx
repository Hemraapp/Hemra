import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#f6f3ec]">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_72%_36%,rgba(6,63,50,0.13),transparent_31%),linear-gradient(180deg,rgba(255,255,255,0.3),rgba(246,243,236,0))]" />
        <div className="absolute right-[-120px] top-28 h-[520px] w-[520px] rounded-full border border-emerald-950/10" />
        <div className="absolute right-[10%] top-20 h-28 w-28 rounded-full bg-emerald-950/[0.05] blur-2xl" />
      </div>
      <div className="relative mx-auto grid min-h-[650px] max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-900">For førstegangskjøpere</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-7xl">
            Mindre gjetting. Mer retning mot første bolig.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            Hemra gir deg et tydelig overblikk over kjøpekraft, egenkapital, gjeld og hvilke grep som kan flytte deg nærmere bolig.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/kalkulator" className="rounded-full bg-[#063F32] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#052f26] hover:shadow-lg">
              Start beregning
            </Link>
            <Link href="/slik-beregnes-det" className="rounded-full border border-stone-300 bg-white/70 px-6 py-3 text-center text-sm font-semibold text-stone-800 backdrop-blur transition hover:bg-white">
              Slik fungerer det
            </Link>
          </div>
        </div>
        <div className="relative lg:pl-4">
          <div className="absolute -inset-6 rounded-[32px] bg-emerald-950/10 blur-3xl" aria-hidden="true" />
          <div className="relative rounded-[28px] bg-white/76 p-5 shadow-[0_34px_90px_rgba(28,25,23,0.14)] ring-1 ring-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
              <p className="text-sm font-semibold text-stone-950">Analyse</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">Eksempel</span>
            </div>
            <div className="py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Status</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Nær målet</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">Du mangler først og fremst mer egenkapital før planen blir realistisk.</p>
            </div>
            <div className="grid gap-3">
              <PreviewLine label="Hovedbrems" value="Egenkapital" strong />
              <PreviewLine label="Realistisk prisnivå" value="Ca. 3,0–3,3 mill." />
              <PreviewLine label="Neste steg" value="Se hva som hjelper mest" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f7f5f0] px-4 py-3">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={strong ? "text-sm font-semibold text-emerald-950" : "text-sm font-semibold text-stone-950"}>{value}</span>
    </div>
  );
}

