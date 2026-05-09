export function InputSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] bg-white/82 p-6 shadow-[0_24px_70px_rgba(28,25,23,0.08)] ring-1 ring-stone-200/70 backdrop-blur sm:p-8">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

