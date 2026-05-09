import { CalculatorForm } from "@/components/calculator-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function CalculatorPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Beregn</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">La Hemra finne hovedbremsen</h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Gå gjennom økonomi, gjeld og boligønske i en tydelig rekkefølge. Du får en vurdering, et realistisk prisnivå og en tydelig vei videre.
          </p>
        </div>
        <CalculatorForm />
      </main>
      <Footer />
    </>
  );
}

