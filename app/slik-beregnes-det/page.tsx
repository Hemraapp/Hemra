import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const steps = [
  ["01", "Prisnivå", "Hemra tar utgangspunkt i kommune, boligtype og størrelse. Der SSB-data finnes, brukes gjennomsnittlig kvadratmeterpris som grunnlag."],
  ["02", "Egenkapital", "Oppspart egenkapital og BSU vurderes mot egenkapitalkravet. Dette er ofte det første som avgjør om målet er innen rekkevidde."],
  ["03", "Låneramme", "Inntekt og gjeld brukes til å anslå hvor mye nytt lån økonomien kan tåle innen vanlige bankrammer."],
  ["04", "Tidsperspektiv", "Ønsket kjøpetidspunkt sammenlignes med dagens sparetempo, egenkapitalgap og låneramme."],
  ["05", "Månedskostnad", "Lånet regnes som et annuitetslån over 25 år. Hemra viser også en vurdering med høyere rente."],
  ["06", "Samlet vurdering", "Til slutt ser Hemra hva som bremser mest og hvilke grep som kan flytte deg nærmere målet."],
];

const details = [
  {
    title: "Hvilke regler påvirker mest?",
    text: "Total gjeld vurderes normalt opp mot brutto inntekt, og boliglån kan vanligvis ikke dekke hele boligens verdi. Eksisterende gjeld, kredittkortgrenser og faste gjeldskostnader kan derfor trekke ned lånerammen."
  },
  {
    title: "Hva betyr månedskostnaden?",
    text: "Månedskostnaden viser anslått boligkostnad: annuitetslån over 25 år med 5,5 % rente, pluss felleskostnader der det er relevant. Andre gjeldsbetalinger brukes i vurderingen av samlet betalingsevne, men legges ikke inn i boligkostnaden."
  },
  {
    title: "Hvordan brukes ønsket kjøpetidspunkt?",
    text: "Tidsmålet brukes til å sammenligne dagens sparetempo med det egenkapitalgapet krever. Hvis tidsmålet er stramt, vil anbefalingene prioritere grep som faktisk kan korte ned veien, ikke generelle sparebeløp."
  },
  {
    title: "Hva er vurdering med høyere rente?",
    text: "Hemra regner også på boligkostnaden med 8,5 % rente. I tillegg vurderes oppgitte gjeldsbetalinger separat, fordi banken ser på både boliglånet og resten av økonomien."
  },
  {
    title: "Hvordan brukes prisgrunnlaget?",
    text: "Prisgrunnlaget bygger på gjennomsnittlig kvadratmeterpris per kommune og boligtype der data finnes. Faktiske boliger kan avvike med standard, beliggenhet, fellesgjeld, størrelse og markedet på kjøpstidspunktet."
  },
  {
    title: "Hva vurderer banken i tillegg?",
    text: "Banken kan også se på jobbsituasjon, familieansvar, faste utgifter, betalingshistorikk, sikkerhet og interne krav. To personer med like tall kan derfor få ulike svar."
  }
];

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <section className="relative bg-[#f6f3ec] px-4 py-16 sm:px-6 lg:py-24">
          <div className="absolute right-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full border border-emerald-950/10" aria-hidden="true" />
          <div className="absolute right-[12%] top-24 h-24 w-24 rounded-full bg-emerald-950/[0.05] blur-2xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="animate-[fadeIn_360ms_ease-out]">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Metode</p>
              <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">Slik vurderer Hemra tallene dine</h1>
            </div>
            <div className="animate-[fadeIn_520ms_ease-out] space-y-5">
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                Målet er å gjøre boligdrømmen lettere å forstå før du snakker med bank eller vurderer lokale ordninger. Hemra viser hva som betyr mest: egenkapital, gjeld, inntekt, prisnivå eller månedlig belastning.
              </p>
              <DisclaimerBanner compact />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Flyt</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">Fra løse tall til en samlet vurdering</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">Hver del bygger på den forrige. Derfor viser Hemra konklusjonen først, og detaljene når du vil se grunnlaget.</p>
            </div>
            <div className="space-y-0 border-l border-stone-200 pl-6 sm:pl-10">
              {steps.map(([number, title, text], index) => (
                <article key={title} className="group relative pb-10 last:pb-0">
                  <span className="absolute -left-[57px] flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-950 shadow-sm ring-1 ring-stone-200 transition group-hover:-translate-y-0.5 group-hover:ring-emerald-800/30 sm:-left-[62px]">{number}</span>
                  <h3 className="text-2xl font-semibold tracking-tight text-stone-950">{title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f3f0e8] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-900">Detaljer</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">Når du vil se grunnlaget</h2>
              </div>
              <div className="space-y-3">
                {details.map((item) => (
                  <details key={item.title} className="group rounded-[18px] bg-white/70 px-5 py-4 shadow-sm ring-1 ring-stone-200/70 transition hover:bg-white" open={item.title === "Hva betyr månedskostnaden?"}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-stone-950">
                      {item.title}
                      <span className="text-xl font-normal text-stone-500 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{item.text}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
