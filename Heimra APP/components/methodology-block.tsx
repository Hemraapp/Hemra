export function MethodologyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-stone-700">{children}</div>
    </section>
  );
}
