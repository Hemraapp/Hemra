export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      {label ? <div className="flex justify-between text-xs font-medium text-stone-600"><span>{label}</span><span>{Math.round(width)}%</span></div> : null}
      <div className="h-3 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
