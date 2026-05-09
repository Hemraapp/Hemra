"use client";

import { useState } from "react";
import { formatMonths, formatNokCompact } from "@/lib/calculations";
import type { ScenarioResult } from "@/lib/types";

export function ScenarioCard({ scenario, compact = false }: { scenario: ScenarioResult; compact?: boolean }) {
  const [open, setOpen] = useState(scenario.id === "today");
  const showChange = scenario.id !== "today";

  return (
    <article className="overflow-hidden rounded-[24px] bg-white/80 shadow-sm ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <button type="button" onClick={() => setOpen((current) => !current)} className={compact ? "w-full p-5 text-left" : "w-full p-6 text-left"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className={compact ? "text-xl font-semibold tracking-tight text-stone-950" : "text-2xl font-semibold tracking-tight text-stone-950"}>{scenario.title}</h3>
            <div className="mt-4 rounded-2xl bg-stone-50/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900">Hva testes</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{scenario.description}</p>
            </div>
          </div>
          <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(scenario.badge)}`}>{scenario.badge}</span>
        </div>
        <div className="mt-4 border-t border-stone-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Vurdering</p>
          <p className="mt-1 text-sm leading-6 text-stone-700">{scenario.interpretation}</p>
        </div>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-stone-100 p-5 pt-4">
            <div className={compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-3"}>
              <Metric label="Kjøpsramme" value={formatNokCompact(scenario.result.estimatedBuyingCapacity)} delta={showChange ? formatMoneyDelta(scenario.capacityDelta) : "Utgangspunkt"} />
              <Metric label="Egenkapitalgap" value={formatNokCompact(scenario.result.equityGap)} delta={showChange ? formatGapDelta(scenario.equityGapDelta) : "Det du mangler nå"} />
              <Metric label="Tid mot valgt mål" value={formatMonths(scenario.result.realisticPurchaseMonths)} delta={showChange ? formatMonthsDelta(scenario.monthsDelta) : `Ønsket: ${scenario.result.desiredTimeframeLabel.toLowerCase()}`} />
            </div>
            <div className="mt-4 space-y-2">
              <Explanation title="Hva endres?" text={scenario.changeSummary} />
              <Explanation title="Hvorfor hjelper det?" text={scenario.helpsWith} />
              <Explanation title="Hva kan fortsatt bremse?" text={scenario.limitation} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-xs font-medium text-stone-500">{label}</p>
        <p className="shrink-0 whitespace-nowrap text-right text-base font-semibold tracking-tight text-stone-950">{value}</p>
      </div>
      <p className="mt-1 text-xs font-medium leading-5 text-stone-500">{delta}</p>
    </div>
  );
}

function Explanation({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-stone-100">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{title}</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">{text}</p>
    </div>
  );
}

function formatMoneyDelta(value: number) {
  if (Math.abs(value) < 1) return "Ingen tydelig endring";
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatNokCompact(Math.abs(value))}`;
}

function formatGapDelta(value: number) {
  if (Math.abs(value) < 1) return "Samme gap";
  return value > 0 ? `${formatNokCompact(value)} mindre gap` : `${formatNokCompact(Math.abs(value))} større gap`;
}

function formatMonthsDelta(value: number | null) {
  if (value === null) return "Avhenger av sparing";
  if (value === 0) return "Samme tid";
  return value > 0 ? `${value} mnd raskere` : `${Math.abs(value)} mnd lenger`;
}

function getBadgeClass(badge: string) {
  if (badge === "Liten effekt alene" || badge === "Samme tempo") return "border border-amber-200 bg-amber-50 text-amber-900";
  if (["Innen rekkevidde", "Mer egenkapital", "Lavere prisnivå", "Lavere målpris", "Mindre bolig", "Tidsbilde", "Treffer tidsmålet bedre"].includes(badge)) return "border border-emerald-100 bg-emerald-50 text-emerald-900";
  if (["Bedre låneramme", "Bedre handlingsrom", "Mindre gap", "Bedre ramme", "Sparegrep", "Stabil sparing"].includes(badge)) return "border border-sky-100 bg-sky-50 text-sky-900";
  return "border border-stone-200 bg-stone-100 text-stone-700";
}
