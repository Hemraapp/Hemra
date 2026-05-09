const signals = [
  ["Kjøpekraft", "Se omtrent hvor langt inntekt og egenkapital kan rekke."],
  ["Hovedbrems", "Forstå om det først og fremst er sparing, gjeld eller prisnivå som holder igjen."],
  ["Neste steg", "Få en kort prioritering av grepene som passer tallene dine."]
];

export function ProblemCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Oversikt før valg</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-stone-950">
            Mindre gjetting. Mer retning.
          </h2>
        </div>
        <div className="space-y-8 border-l border-stone-200 pl-6 sm:pl-10">
          <p className="max-w-2xl text-base leading-7 text-stone-600">
            Hemra samler de viktigste delene av boligdrømmen, så du slipper å tolke mange løse tall alene.
          </p>
          <div className="grid gap-7 md:grid-cols-3">
            {signals.map(([title, text]) => (
              <article key={title} className="group">
                <span className="block h-1 w-8 rounded-full bg-emerald-900 transition group-hover:w-12" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-stone-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

