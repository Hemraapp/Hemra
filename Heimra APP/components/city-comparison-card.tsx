import { formatMonths, formatNokRange } from "@/lib/calculations";
import type { CalculationResult } from "@/lib/types";

export function CityComparisonCard({ cityName, label, reason, result }: { cityName: string; label: string; reason: string; result: CalculationResult }) {
  return (
    <article className="rounded-[22px] bg-white/76 p-5 shadow-sm ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="min-h-[118px]">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">{label}</span>
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-stone-950">{cityName}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">{reason}</p>
      </div>
      <dl className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm">
        <div>
          <dt className="text-stone-500">Prisnivå</dt>
          <dd className="mt-1 font-semibold text-stone-950">{formatNokRange(result.realisticPriceLow, result.realisticPriceHigh)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone-500">Tid</dt>
          <dd className="font-medium text-stone-900">{formatMonths(result.monthsUntilReady)}</dd>
        </div>
      </dl>
    </article>
  );
}

