"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CityComparisonCard } from "@/components/city-comparison-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { buildScenarios, getBestScenario } from "@/lib/scenarios";
import { calculateHemra, defaultInputs, formatMonths, formatNok, formatNokRange, getPrioritizedActions, getResultSummary, toPositiveNumber } from "@/lib/calculations";
import { defaultHomeSizeByType, getCityById, getPriceDataNotice, getRelatedCities, priceBasisTooltip, priceSourceLabel } from "@/lib/ssbPrices";
import { loadHemraInputs } from "@/lib/storage";
import type { HemraInputs } from "@/lib/types";

export default function ResultsPage() {
  const [inputs, setInputs] = useState<HemraInputs>(defaultInputs);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setInputs(loadHemraInputs());
  }, []);

  const result = useMemo(() => calculateHemra(inputs), [inputs]);
  const actions = useMemo(() => getPrioritizedActions(inputs, result).slice(0, 3), [inputs, result]);
  const scenarios = useMemo(() => buildScenarios(inputs), [inputs]);
  const bestScenario = getBestScenario(scenarios);
  const city = getCityById(inputs.goal.cityId);
  const priceNotice = getPriceDataNotice(city, inputs.goal.homeType);
  const selectedSqm = toPositiveNumber(inputs.goal.desiredSqm) || defaultHomeSizeByType[inputs.goal.homeType];
  const comparisons = getRelatedCities(inputs.goal.cityId).slice(0, 3).map((relatedCity, index) => ({
    city: relatedCity,
    label: index === 0 ? "Nærmest ønsket mål" : index === 1 ? "Lavere prisnivå" : "Samme region",
    reason: relatedCity.name + " vises fordi stedet ligger i samme brede region som " + city.name + ".",
    result: calculateHemra({ ...inputs, goal: { ...inputs.goal, cityId: relatedCity.id, targetPurchasePrice: undefined } })
  }));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="animate-[fadeIn_360ms_ease-out] border-b border-stone-200 pb-12">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Resultat</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">{result.status}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">{getResultSummary(result)}</p>
            </div>
            <div className="rounded-[24px] bg-white/78 p-5 shadow-[0_24px_70px_rgba(28,25,23,0.09)] ring-1 ring-stone-200/70 backdrop-blur">
              <ResultLine label="Realistisk prisnivå" value={formatNokRange(result.realisticPriceLow, result.realisticPriceHigh)} strong />
              <ResultLine label="Hovedbrems" value={result.mainBlocker} />
              <ResultLine label="Ønsket tid" value={result.desiredTimeframeLabel} />
              <ResultLine label="Dagens tempo" value={result.realisticPurchaseMonths === null ? "Ikke beregnbart" : formatMonths(result.realisticPurchaseMonths)} />
              {priceNotice.type === "fallback" ? (
                <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
                  {priceNotice.text}{priceNotice.fallbackName ? ` Prisnivået hentes fra ${priceNotice.fallbackName} for valgt boligtype.` : ""}
                </p>
              ) : null}
              <div className="mt-4"><DisclaimerBanner compact /></div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Hva hjelper mest?</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">Tiltakene som faktisk passer tallene dine</h2>
            </div>
            <div className="space-y-5">
              {actions.map((action, index) => (
                <article key={action.id} className="grid grid-cols-[44px_1fr] gap-5 border-b border-stone-200 pb-5 last:border-b-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950 text-sm font-semibold text-white">{index + 1}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-stone-950">{action.title}</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900">{action.priority === "hoy" ? "Høy relevans" : "Relevant"}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{action.reason}</p>
                    <p className="mt-1 text-sm leading-6 text-stone-700">{action.effect}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">{action.evidence}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-[#f3f0e8] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Vei videre</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Se hvilke scenarioer som kan endre bildet</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Beste scenario akkurat nå: <span className="font-semibold text-stone-950">{bestScenario.title}</span>. {bestScenario.interpretation}</p>
            </div>
            <Link href="/scenario" className="inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md">
              Utforsk scenarioer og veien videre
            </Link>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-stone-950">Nærliggende alternativer</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Vi viser steder som hører naturlig til samme region som målet ditt.</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CityComparisonCard cityName={city.name} label="Nåværende mål" reason={city.name + ", " + selectedSqm + " m²"} result={result} />
            {comparisons.map(({ city: relatedCity, result: relatedResult, label, reason }) => (
              <CityComparisonCard key={relatedCity.id} cityName={relatedCity.name} label={label} reason={reason} result={relatedResult} />
            ))}
          </div>
        </section>

        <section className="pb-12">
          <button type="button" onClick={() => setShowDetails((current) => !current)} className="flex w-full items-center justify-between rounded-[18px] bg-white/70 px-5 py-4 text-left shadow-sm ring-1 ring-stone-200/70 transition hover:bg-white">
            <span>
              <span className="block text-sm font-semibold text-stone-950">Detaljer bak vurderingen</span>
              <span className="mt-1 block text-sm text-stone-600">Tallene bak vurderingen, inkludert rente og prisgrunnlag.</span>
            </span>
            <span className="text-xl text-stone-500">{showDetails ? "-" : "+"}</span>
          </button>
          {showDetails ? (
            <div className="mt-3 rounded-[18px] bg-white/72 p-5 shadow-sm ring-1 ring-stone-200/70 md:grid md:grid-cols-2 md:gap-x-8">
              <Detail label="Estimert pris i valgt område" value={formatNok(result.estimatedAreaPurchasePrice)} />
              <Detail label="Estimert kjøpekraft" value={formatNok(result.estimatedBuyingCapacity)} />
              <Detail label="Egenkapitalbehov" value={formatNok(result.requiredEquity)} />
              <Detail label="Mangler egenkapital" value={formatNok(result.equityGap)} />
              <Detail label="Ønsket kjøpetidspunkt" value={result.desiredTimeframeLabel} note={result.timeframeSummary} />
              <Detail label="Månedlig sparing som trengs for tidsmålet" value={result.requiredMonthlySavingsForTimeframe === null ? "Ikke beregnbart" : formatNok(result.requiredMonthlySavingsForTimeframe)} note={result.savingsPaceGap && result.savingsPaceGap > 0 ? `Omtrent ${formatNok(result.savingsPaceGap)} mer enn dagens oppgitte sparing.` : "Dagens sparetempo er ikke hovedproblemet i tidsmålet."} />
              <Detail label="Lånerammegap" value={formatNok(result.debtCapacityGap)} note={result.secondaryBottleneck ? `Sekundær brems: ${result.secondaryBottleneck}.` : "Ingen tydelig sekundær brems i denne beregningen."} />
              <Detail label="Anslått boligkostnad" value={formatNok(result.monthlyPaymentEstimate)} note="Annuitetslån over 25 år med 5,5 % rente, pluss felleskostnader der det er relevant." />
              <Detail label="Boligkostnad ved høyere rente" value={formatNok(result.stressTestMonthlyPayment)} note="Samme boligkostnad beregnet med 8,5 % rente. Oppgitte gjeldsbetalinger brukes i vurderingen av samlet betalingsevne, ikke i boligkostnaden." />
              {toPositiveNumber(inputs.financial.monthlyDebtPayments) > 0 ? (
                <Detail label="Oppgitte gjeldsbetalinger" value={formatNok(toPositiveNumber(inputs.financial.monthlyDebtPayments))} note="Brukes bare for å vurdere hvor mye økonomien tåler samlet." />
              ) : null}
              <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600 md:col-span-2" title={priceBasisTooltip}>
                Prisgrunnlag: {priceSourceLabel}. Prisene er basert på gjennomsnittlig kvadratmeterpris per kommune og boligtype. Faktiske boliger vil variere.
                {priceNotice.type === "fallback" ? <span className="mt-2 block">{priceNotice.text}</span> : null}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ResultLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 py-3 first:pt-0 last:border-b-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={strong ? "max-w-[210px] text-right text-xl font-semibold tracking-tight text-stone-950" : "max-w-[210px] text-right text-sm font-semibold text-stone-950"}>{value}</span>
    </div>
  );
}

function Detail({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-b border-stone-100 py-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="text-stone-500">{label}</span>
        <span className="text-right font-semibold text-stone-950">{value}</span>
      </div>
      {note ? <p className="mt-1 max-w-xl text-xs leading-5 text-stone-500">{note}</p> : null}
    </div>
  );
}
