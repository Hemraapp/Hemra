"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InputSection } from "@/components/input-section";
import { defaultInputs, toPositiveNumber } from "@/lib/calculations";
import { cityPriceData, defaultHomeSizeByType, getPriceDataNotice, groupedLocationData, homeTypeLabels } from "@/lib/ssbPrices";
import { saveHemraInputs } from "@/lib/storage";
import type { HemraInputs, HomeType, NumericInput, PurchaseTimeframe } from "@/lib/types";

const steps = [
  { title: "Din økonomi", description: "Inntekt, sparing og det du allerede har bygget opp." },
  { title: "Gjeld", description: "Gjeld og kredittrammer som påvirker låneevnen." },
  { title: "Boligønske", description: "Sted, boligtype, størrelse og om du kjøper alene." },
  { title: "Tidspunkt", description: "Når du ønsker at planen skal begynne å bli realistisk." }
];

const timeframeOptions: Array<{ value: PurchaseTimeframe; label: string; description: string }> = [
  { value: "within1", label: "Innen 1 år", description: "For deg som allerede vil teste om målet er nært." },
  { value: "oneToTwo", label: "1-2 år", description: "Et stramt, men vanlig tidsperspektiv for førstegangskjøpere." },
  { value: "twoToFour", label: "2-4 år", description: "Gir rom for å bygge egenkapital og rydde litt i gjeld." },
  { value: "fivePlus", label: "5+ år", description: "Et roligere løp der planen kan modnes over tid." },
  { value: "custom", label: "Egendefinert", description: "Velg antall måneder selv." }
];

export function CalculatorForm() {
  const router = useRouter();
  const [inputs, setInputs] = useState<HemraInputs>(defaultInputs);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  function setFinancial(key: keyof HemraInputs["financial"], value: string) {
    setInputs((current) => ({
      ...current,
      financial: { ...current.financial, [key]: value }
    }));
  }

  function setGoal(key: keyof HemraInputs["goal"], value: string | boolean | undefined) {
    setInputs((current) => ({
      ...current,
      goal: { ...current.goal, [key]: value }
    }));
  }

  function setHomeType(homeType: HomeType) {
    setInputs((current) => ({
      ...current,
      goal: {
        ...current.goal,
        homeType,
        desiredSqm: String(defaultHomeSizeByType[homeType]),
        commonCosts: homeType === "apartment" ? current.goal.commonCosts || "3500" : current.goal.commonCosts
      }
    }));
  }

  function analyzeSituation() {
    if (!toPositiveNumber(inputs.financial.grossIncome) && !toPositiveNumber(inputs.financial.partnerGrossIncome)) {
      setError("Legg inn minst én brutto årsinntekt, så kan vi regne et realistisk scenario.");
      setStep(0);
      return;
    }
    setError("");
    saveHemraInputs(inputs);
    setAnalyzing(true);
    window.setTimeout(() => router.push("/resultater"), 900);
  }

  return (
    <div className="relative">
      {analyzing ? <AnalysisOverlay /> : null}
      <div className="space-y-8">
        <div className="sticky top-[65px] z-20 rounded-full bg-[#fbfaf7]/90 px-2 py-2 shadow-[0_14px_38px_rgba(28,25,23,0.08)] ring-1 ring-stone-200/70 backdrop-blur">
          <div className="grid gap-1 sm:grid-cols-4">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-full px-4 py-2.5 text-center transition ${step === index ? "bg-emerald-950 text-white shadow-sm" : "text-stone-500 hover:bg-white hover:text-stone-950"}`}
              >
                <span className="text-sm font-semibold">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</div> : null}

        <div className="animate-[fadeIn_280ms_ease-out]">
          {step === 0 ? (
            <InputSection title="1. Din økonomi" description="Fyll inn det du vet nå. Du kan la resten stå tomt og justere senere.">
              <NumberField label="Brutto årsinntekt" value={inputs.financial.grossIncome} onChange={(value) => setFinancial("grossIncome", value)} helper="Årsinntekt før skatt brukes til å anslå hvor stor låneramme banken kan vurdere." />
              <NumberField label="Partnerinntekt (valgfritt)" value={inputs.financial.partnerGrossIncome} onChange={(value) => setFinancial("partnerGrossIncome", value)} helper="Tas med når du velger å kjøpe sammen." />
              <NumberField label="Oppspart egenkapital" value={inputs.financial.savings} onChange={(value) => setFinancial("savings", value)} helper="Frie sparepenger som kan brukes som egenkapital." />
              <NumberField label="BSU-saldo" value={inputs.financial.bsuBalance} onChange={(value) => setFinancial("bsuBalance", value)} helper="Regnes med som egenkapital. Skattefordel og rente beregnes ikke her." />
              <NumberField label="Månedlig sparing" value={inputs.financial.monthlySavings} onChange={(value) => setFinancial("monthlySavings", value)} helper="Dette brukes til å vurdere om tidsmålet ditt henger sammen med egenkapitalgapet." />
              <NumberField label="Nåværende husleie (valgfritt)" value={inputs.financial.rent} onChange={(value) => setFinancial("rent", value)} helper="Kun som sammenligning for deg. Husleie tas ikke med i låneramme." />
            </InputSection>
          ) : null}

          {step === 1 ? (
            <InputSection title="2. Gjeld" description="All gjeld reduserer lånerammen. Dyr gjeld kan også gjøre økonomien tyngre måned for måned.">
              <NumberField label="Studielån" value={inputs.financial.studentLoan} onChange={(value) => setFinancial("studentLoan", value)} />
              <NumberField label="Billån" value={inputs.financial.carLoan} onChange={(value) => setFinancial("carLoan", value)} />
              <NumberField label="Forbrukslån" value={inputs.financial.consumerDebt} onChange={(value) => setFinancial("consumerDebt", value)} />
              <NumberField label="Kredittkort brukt" value={inputs.financial.creditCardUsed} onChange={(value) => setFinancial("creditCardUsed", value)} />
              <NumberField label="Kredittkortgrense" value={inputs.financial.creditCardLimit} onChange={(value) => setFinancial("creditCardLimit", value)} helper="Banken kan vurdere kredittrammen selv om kortet ikke er brukt." />
              <NumberField label="Annen gjeld" value={inputs.financial.otherDebt} onChange={(value) => setFinancial("otherDebt", value)} />
              <NumberField label="Månedlige gjeldskostnader" value={inputs.financial.monthlyDebtPayments} onChange={(value) => setFinancial("monthlyDebtPayments", value)} helper="Legges til når månedlig belastning vurderes." />
            </InputSection>
          ) : null}

          {step === 2 ? (
            <InputSection title="3. Boligønske" description="Velg et mål som gir mening for hverdagen din. Hemra bruker SSB-basert prisnivå der data finnes.">
              <CityCombobox value={inputs.goal.cityId} homeType={inputs.goal.homeType} onChange={(value) => setGoal("cityId", value)} />
              <SelectField label="Boligtype" value={inputs.goal.homeType} onChange={(value) => setHomeType(value as HomeType)}>
                {Object.entries(homeTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectField>
              <NumberField label="Størrelse (m²)" value={inputs.goal.desiredSqm} onChange={(value) => setGoal("desiredSqm", value)} helper={`Standard for ${homeTypeLabels[inputs.goal.homeType].toLowerCase()}: ${defaultHomeSizeByType[inputs.goal.homeType]} m².`} />
              <SelectField label="Kjøper" value={inputs.goal.buyingWithPartner ? "partner" : "alone"} onChange={(value) => setGoal("buyingWithPartner", value === "partner")}>
                <option value="alone">Kjøper alene</option>
                <option value="partner">Kjøper sammen</option>
              </SelectField>
              <NumberField label="Eventuell målpris" value={inputs.goal.targetPurchasePrice ?? ""} onChange={(value) => setGoal("targetPurchasePrice", value)} helper="La stå tomt hvis du vil bruke stedets m²-pris." />
              {inputs.goal.homeType === "apartment" ? (
                <NumberField label="Felleskostnader per måned" value={inputs.goal.commonCosts ?? ""} onChange={(value) => setGoal("commonCosts", value)} />
              ) : null}
            </InputSection>
          ) : null}

          {step === 3 ? (
            <InputSection title="4. Når ønsker du realistisk å kjøpe?" description="Dette er ikke en lovnad. Det brukes til å vurdere om tempoet ditt passer med målet.">
              <div className="md:col-span-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  {timeframeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGoal("purchaseTimeframe", option.value)}
                      className={`rounded-[18px] border px-4 py-4 text-left transition ${
                        inputs.goal.purchaseTimeframe === option.value
                          ? "border-emerald-900 bg-emerald-950 text-white shadow-sm"
                          : "border-stone-200 bg-[#fffefa] text-stone-800 hover:border-stone-300 hover:bg-white"
                      }`}
                    >
                      <span className="block text-base font-semibold">{option.label}</span>
                      <span className={`mt-1 block text-sm leading-6 ${inputs.goal.purchaseTimeframe === option.value ? "text-emerald-50" : "text-stone-500"}`}>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              {inputs.goal.purchaseTimeframe === "custom" ? (
                <NumberField label="Egendefinert mål i måneder" value={inputs.goal.customTargetMonths ?? ""} onChange={(value) => setGoal("customTargetMonths", value)} helper="Skriv for eksempel 30 hvis du vil teste et mål på omtrent to og et halvt år." />
              ) : null}
            </InputSection>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="rounded-full border border-stone-300 bg-white/60 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
            Tilbake
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md">
              Neste steg
            </button>
          ) : (
            <button type="button" onClick={analyzeSituation} className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md">
              Analyser situasjonen min
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, helper, onChange }: { label: string; value: NumericInput; helper?: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-");
  return (
    <div className="block">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <label htmlFor={id}>{label}</label>
        {helper ? <HelpBubble text={helper} /> : null}
      </div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/\s/g, "");
          if (/^\d*$/.test(nextValue)) onChange(nextValue);
        }}
        className="mt-2 w-full rounded-[14px] border border-stone-200 bg-[#fffefa] px-4 py-4 text-lg text-stone-950 outline-none transition duration-200 placeholder:text-stone-300 hover:border-stone-300 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function SelectField({ label, value, helper, onChange, children }: { label: string; value: string; helper?: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
        {label}
        {helper ? <HelpBubble text={helper} /> : null}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full appearance-none rounded-[14px] border border-stone-200 bg-[#fffefa] bg-[linear-gradient(45deg,transparent_50%,#57534e_50%),linear-gradient(135deg,#57534e_50%,transparent_50%)] bg-[length:6px_6px,6px_6px] bg-[position:calc(100%-20px)_50%,calc(100%-15px)_50%] bg-no-repeat px-4 py-4 pr-10 text-base text-stone-950 outline-none transition hover:border-stone-300 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-100">
        {children}
      </select>
    </label>
  );
}

function CityCombobox({ value, homeType, onChange }: { value: string; homeType: HomeType; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedCity = cityPriceData.find((city) => city.id === value) ?? cityPriceData[0];
  const selectedNotice = getPriceDataNotice(selectedCity, homeType);
  const visibleGroups = useMemo(() => {
    const normalized = normalizeLocationQuery(query);
    return groupedLocationData
      .map((group) => ({
        ...group,
        locations: normalized
          ? group.locations.filter((city) => normalizeLocationQuery(`${city.name} ${city.region}`).includes(normalized))
          : group.locations
      }))
      .filter((group) => group.locations.length > 0);
  }, [query]);
  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.locations.length, 0);

  return (
    <div className="relative block">
      <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
        Sted
        <HelpBubble text="Søk eller bla i grupperte steder. Alle kommuner i datagrunnlaget er med, også små og mindre tett befolkede steder." />
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between rounded-[14px] border border-stone-200 bg-[#fffefa] px-4 py-4 text-left text-base text-stone-950 outline-none transition hover:border-stone-300 focus:border-emerald-800 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        <span>
          <span className="block">{selectedCity.name}</span>
          <span className="mt-0.5 block text-xs text-stone-500">{selectedCity.region}</span>
        </span>
        <span className={"text-stone-500 transition " + (open ? "rotate-180" : "")} aria-hidden="true">⌄</span>
      </button>
      {selectedNotice.type === "fallback" ? (
        <p className="mt-2 rounded-[14px] bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-600">
          {selectedNotice.text}{selectedNotice.fallbackName ? ` Prisnivået hentes fra ${selectedNotice.fallbackName} for valgt boligtype.` : ""}
        </p>
      ) : null}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[18px] border border-stone-200 bg-white shadow-[0_24px_70px_rgba(28,25,23,0.16)]">
          <div className="border-b border-stone-100 p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Søk etter sted"
              className="w-full rounded-[12px] bg-stone-50 px-3 py-2.5 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div role="listbox" className="max-h-72 overflow-y-auto p-1.5">
            {visibleGroups.map((group) => (
              <div key={group.id} className="py-1 first:pt-0">
                <div className="sticky top-0 z-10 bg-white/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-900 backdrop-blur">
                  {group.name}
                </div>
                <div className="space-y-0.5">
                  {group.locations.map((city) => {
                    const notice = getPriceDataNotice(city, homeType);
                    const isSelected = city.id === value;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(city.id);
                          setOpen(false);
                          setQuery("");
                        }}
                        className={"flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm transition " + (isSelected ? "bg-emerald-950 text-white" : "text-stone-700 hover:bg-stone-50 hover:text-stone-950")}
                      >
                        <span>
                          <span className="block font-medium">{city.name}</span>
                          {notice.type === "fallback" ? (
                            <span className={isSelected ? "mt-0.5 block text-xs text-emerald-50/80" : "mt-0.5 block text-xs text-stone-400"}>Begrenset lokalt datagrunnlag</span>
                          ) : null}
                        </span>
                        {isSelected ? <span className="text-xs font-semibold text-emerald-50">Valgt</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {visibleCount === 0 ? <p className="px-3 py-4 text-sm text-stone-500">Ingen steder funnet.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeLocationQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a");
}

function MiniLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-stone-100 pt-3 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-semibold text-stone-950">{value}</span>
    </div>
  );
}

function HelpBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label="Vis forklaring"
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onFocus={() => setOpen(true)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 bg-white text-[11px] font-semibold text-stone-600 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100"
      >
        ?
      </button>
      {open ? <span className="absolute left-1/2 top-7 z-20 w-64 -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-3 text-xs font-normal leading-5 text-stone-600 shadow-[0_18px_45px_rgba(28,25,23,0.14)]">{text}</span> : null}
    </span>
  );
}

function AnalysisOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center rounded-lg bg-[#fbfaf7]/80 pt-16 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(28,25,23,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-900">Analyserer mulighetene dine</p>
        <div className="mt-4 space-y-3 text-sm text-stone-600">
          {["Vurderer låneevne", "Ser på egenkapital", "Tester tidsmålet ditt", "Sammenligner prisnivå"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-800" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
