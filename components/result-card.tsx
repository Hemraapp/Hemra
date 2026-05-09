export function ResultCard({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_14px_34px_rgba(28,25,23,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(28,25,23,0.09)]">
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{value}</p>
      {note ? <p className="mt-3 text-sm leading-6 text-stone-600">{note}</p> : null}
    </article>
  );
}
