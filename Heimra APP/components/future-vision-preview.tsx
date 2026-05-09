import Link from "next/link";

const flow = [
  ["Legg inn det du vet", "Tomme felt er lov. Du kan justere senere."],
  ["Få overblikk", "Se status og hovedbrems når tallene er på plass."],
  ["Test muligheter", "Sammenlign sparing, gjeld, tid og nærliggende områder."]
];

export function FutureVisionPreview() {
  return (
    <section className="bg-[#f3f0e8]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Flyt</p>
            <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-stone-950">Fra usikkerhet til en plan du kan handle på</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
              Resultatet er ikke en dom. Det er et ryddig utgangspunkt for å se hva som kan gjøre neste steg mer realistisk.
            </p>
            <Link href="/kalkulator" className="mt-7 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md">
              Kom i gang
            </Link>
          </div>
          <div className="space-y-7">
            {flow.map(([title, text], index) => (
              <article key={title} className="grid grid-cols-[42px_1fr] gap-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-emerald-950 shadow-sm">{index + 1}</span>
                <div className="border-b border-stone-300/70 pb-7 last:border-b-0">
                  <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

