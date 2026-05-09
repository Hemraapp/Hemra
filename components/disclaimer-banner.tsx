export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600" : "rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"}>
      Resultatet er et estimat. Banken gjør alltid en individuell vurdering.
    </div>
  );
}
