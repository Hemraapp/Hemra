"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ScenarioCard } from "@/components/scenario-card";
import { defaultInputs, formatMonths, formatNokCompact, getPrioritizedActions } from "@/lib/calculations";
import { buildScenarios, getBestScenario } from "@/lib/scenarios";
import { loadHemraInputs } from "@/lib/storage";
import type { HemraInputs, ScenarioResult } from "@/lib/types";

export default function ScenarioPage() {
  const [inputs, setInputs] = useState<HemraInputs>(defaultInputs);

  useEffect(() => {
    setInputs(loadHemraInputs());
  }, []);

  const scenarios = useMemo(() => buildScenarios(inputs), [inputs]);
  const current = scenarios[0];
  const best = getBestScenario(scenarios);
  const alternatives = scenarios.filter((scenario) => scenario.id !== "today" && scenario.id !== best.id).slice(0, 3);
  const actions = getPrioritizedActions(inputs, current.result).slice(0, 3);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="max-w-3xl pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Vei videre</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">Dette gir størst effekt akkurat nå</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Hemra vurderer tiltakene opp mot tallene dine og tidsmålet du valgte. Målet er å vise hva som faktisk flytter planen, ikke bare generelle råd.
          </p>
        </section>

        <FeaturedScenario scenario={best} />

        <section className="py-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Alternative grep</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">Andre muligheter som kan være relevante</h2>
            </div>
            <Link href="/kalkulator" className="inline-flex w-fit rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white">
              Juster tallene mine
            </Link>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {alternatives.map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} compact />)}
          </div>
        </section>

        <section className="rounded-[28px] bg-[#f3f0e8] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Neste fornuftige steg</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {actions.map((action, index) => (
              <article key={action.id}>
                <span className="text-sm font-semibold text-emerald-900">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-stone-950">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{action.effect}</p>
                <p className="mt-2 text-xs leading-5 text-stone-500">{action.evidence}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8"><DisclaimerBanner /></section>
      </main>
      <Footer />
    </>
  );
}

function FeaturedScenario({ scenario }: { scenario: ScenarioResult }) {
  return (
    <section className="rounded-[30px] bg-emerald-950 p-6 text-white shadow-[0_30px_80px_rgba(6,63,50,0.18)] sm:p-8">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-100">Mest effekt</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{scenario.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">{scenario.interpretation}</p>
        </div>
        <div className="rounded-[22px] bg-white/10 p-5 ring-1 ring-white/15">
          <FeaturedLine label="Egenkapitalgap" value={formatNokCompact(scenario.result.equityGap)} note={scenario.equityGapDelta > 0 ? formatNokCompact(scenario.equityGapDelta) + " mindre gap" : "Samme hovedbilde"} />
          <FeaturedLine label="Tid mot valgt mål" value={formatMonths(scenario.result.realisticPurchaseMonths)} note={`Ønsket: ${scenario.result.desiredTimeframeLabel.toLowerCase()}`} />
          <FeaturedLine label="Hovedbrems etterpå" value={scenario.result.mainBlocker} note="Dette må fortsatt vurderes" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 border-t border-white/15 pt-6 md:grid-cols-3">
        <Explanation title="Hva endres?" text={scenario.changeSummary} />
        <Explanation title="Hvorfor hjelper det?" text={scenario.helpsWith} />
        <Explanation title="Hva kan fortsatt bremse?" text={scenario.limitation} />
      </div>
    </section>
  );
}

function FeaturedLine({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border-b border-white/15 py-4 first:pt-0 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-emerald-50">{note}</p>
    </div>
  );
}

function Explanation({ title, text }: { title: string; text: string }) {
  return (
    <article>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-emerald-50">{text}</p>
    </article>
  );
}
