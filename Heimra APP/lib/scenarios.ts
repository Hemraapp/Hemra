import { cityPriceData, getRelatedCities } from "@/lib/ssbPrices";
import { calculateHemra, formatNokCompact, toPositiveNumber } from "@/lib/calculations";
import type { HemraInputs, ScenarioResult } from "@/lib/types";

type ScenarioDraft = Omit<ScenarioResult, "result" | "badge" | "capacityDelta" | "equityGapDelta" | "monthsDelta" | "interpretation">;

export function buildScenarios(inputs: HemraInputs): ScenarioResult[] {
  const related = getRelatedCities(inputs.goal.cityId);
  const cheaperCity = related
    .filter((city) => city.id !== inputs.goal.cityId)
    .sort((a, b) => a.apartmentPricePerSqm - b.apartmentPricePerSqm)[0] ?? cityPriceData[0];
  const baseResult = calculateHemra(inputs);
  const savingsIncrease = getSavingsIncreaseForTimeframe(inputs, baseResult);
  const projectionMonths = getProjectionMonths(baseResult.desiredTimeframeMonths);
  const smallerSqm = Math.max(25, Math.round(toPositiveNumber(inputs.goal.desiredSqm || 0) * 0.9));
  const reducedTargetPrice = Math.round(baseResult.estimatedAreaPurchasePrice * 0.9);
  const totalRelevantDebt =
    toPositiveNumber(inputs.financial.consumerDebt) +
    toPositiveNumber(inputs.financial.creditCardUsed) +
    toPositiveNumber(inputs.financial.carLoan) +
    toPositiveNumber(inputs.financial.otherDebt);

  const variants: ScenarioDraft[] = [
    {
      id: "today",
      title: "Dagens plan",
      description: "Utgangspunktet med tallene du har lagt inn.",
      changeSummary: "Ingen endring. Dette er referansen de andre scenarioene måles mot.",
      helpsWith: "Gir en tydelig vurdering av hva som stopper deg akkurat nå.",
      limitation: "Planen endrer ikke egenkapital, gjeld eller boligønske.",
      inputs
    },
    {
      id: "target-savings",
      title: savingsIncrease > 0 ? `Spar ca. ${formatNokCompact(savingsIncrease)} mer i måneden` : "Hold dagens sparetempo",
      description: savingsIncrease > 0
        ? `Tester hva som skjer hvis sparingen økes nok til å passe bedre med tidsmålet ${baseResult.desiredTimeframeLabel.toLowerCase()}.`
        : "Tester effekten av å holde dagens sparetempo stabilt gjennom planperioden.",
      changeSummary: savingsIncrease > 0
        ? `Månedlig sparing økes med ca. ${formatNokCompact(savingsIncrease)}, og ${projectionMonths} måneder med sparing legges til egenkapitalen.`
        : `${projectionMonths} måneder med dagens sparetempo legges til egenkapitalen.`,
      helpsWith: "Egenkapitalgapet krymper raskere og tiden til mulig kjøp kan falle.",
      limitation: "Dette hjelper lite på lånerammen hvis gjeld eller inntekt er hovedbremsen.",
      inputs: addMonthlySaving(inputs, savingsIncrease, projectionMonths)
    },
    {
      id: "more-time",
      title: `Gi planen ${formatShortMonths(projectionMonths)}`,
      description: "Viser hva tiden alene gjør hvis inntekt, gjeld og boligønske holdes uendret.",
      changeSummary: `Dagens månedlige sparing legges til egenkapitalen i ${formatShortMonths(projectionMonths)}.`,
      helpsWith: "Gir et tydelig bilde av om tiden alene flytter deg nærmere.",
      limitation: "Hvis lånerammen er hovedbremsen, løser venting alene sjelden hele problemet.",
      inputs: { ...inputs, financial: { ...inputs.financial, savings: String(toPositiveNumber(inputs.financial.savings) + toPositiveNumber(inputs.financial.monthlySavings) * projectionMonths) } }
    },
    {
      id: "lower-target",
      title: "Senk målprisen litt",
      description: "Tester et boligønske med lavere pris, uten å endre inntekten din.",
      changeSummary: `Målprisen settes til omtrent ${formatNokCompact(reducedTargetPrice)}.`,
      helpsWith: "Lavere pris reduserer egenkapitalbehov, lånebehov og månedskostnad samtidig.",
      limitation: "Dette må fortsatt være en bolig du faktisk kan bo i, ikke bare en penere beregning.",
      inputs: { ...inputs, goal: { ...inputs.goal, targetPurchasePrice: String(reducedTargetPrice) } }
    },
    {
      id: "smaller-home",
      title: `Test ${smallerSqm} m²`,
      description: "Ser på effekten av litt mindre størrelse i samme område.",
      changeSummary: `Størrelsen justeres fra ${toPositiveNumber(inputs.goal.desiredSqm) || "standard"} m² til ${smallerSqm} m².`,
      helpsWith: "Mindre størrelse kan gi lavere pris uten at du må bytte sted.",
      limitation: "Hvis inntekt eller gjeld er hovedbremsen, kan prisreduksjonen fortsatt være for liten alene.",
      inputs: { ...inputs, goal: { ...inputs.goal, desiredSqm: String(smallerSqm), targetPurchasePrice: undefined } }
    },
    {
      id: "cheaper-city",
      title: `Se på ${cheaperCity.name}`,
      description: "Tester samme boligstørrelse i et nærliggende område med lavere prisnivå.",
      changeSummary: `Sted endres til ${cheaperCity.name}, mens størrelse og boligtype beholdes.`,
      helpsWith: "Lavere pris kan redusere egenkapitalbehov, lån og månedskostnad samtidig.",
      limitation: "Det må fortsatt være et sted som passer hverdagen din, ikke bare et billigere tall.",
      inputs: { ...inputs, goal: { ...inputs.goal, cityId: cheaperCity.id, targetPurchasePrice: undefined } }
    }
  ];

  if (totalRelevantDebt > 0) {
    const debtReduction = getDebtScenarioAmount(totalRelevantDebt);
    variants.splice(2, 0, {
      id: "priority-debt",
      title: "Prioriter dyr gjeld",
      description: "Ser på effekten av å redusere dyr eller tydelig gjeld først.",
      changeSummary: `Scenarioet bruker ca. ${formatNokCompact(debtReduction)} i nedbetaling eller lavere kreditteksponering, fordelt på forbruksgjeld, kredittkort, billån og annen gjeld.`,
      helpsWith: "Lavere gjeld kan gi mer lånerom. Hvis gjeldsbetalingen faktisk faller, kan mer av månedsbudsjettet gå til sparing.",
      limitation: "Nedbetaling bruker kapital. Hvis egenkapital er hovedbremsen, må effekten veies mot hvor dyr gjelden er.",
      inputs: reduceDebt(inputs, debtReduction)
    });
  }

  if (toPositiveNumber(inputs.financial.partnerGrossIncome) > 0 && !inputs.goal.buyingWithPartner) {
    variants.push({
      id: "partner",
      title: "Kjøp sammen",
      description: "Viser effekten av partnerinntekten du har lagt inn.",
      changeSummary: "Partnerinntekt tas med i husholdningens inntekt.",
      helpsWith: "Samlet inntekt kan øke lånerammen betydelig.",
      limitation: "Egenkapitalkravet forsvinner ikke, og banken vurderer begge økonomiene.",
      inputs: { ...inputs, goal: { ...inputs.goal, buyingWithPartner: true } }
    });
  }

  return variants.map((scenario) => {
    const result = calculateHemra(scenario.inputs);
    const capacityDelta = result.estimatedBuyingCapacity - baseResult.estimatedBuyingCapacity;
    const equityGapDelta = baseResult.equityGap - result.equityGap;
    const monthsDelta = getMonthsDelta(baseResult.realisticPurchaseMonths, result.realisticPurchaseMonths);

    return {
      ...scenario,
      result,
      capacityDelta,
      equityGapDelta,
      monthsDelta,
      badge: getScenarioBadge(scenario.id, result, capacityDelta, equityGapDelta, monthsDelta),
      interpretation: getInterpretation(scenario.id, result, capacityDelta, equityGapDelta, monthsDelta)
    };
  });
}

export function getBestScenario(scenarios: ScenarioResult[]) {
  const alternatives = scenarios.filter((scenario) => scenario.id !== "today");
  return alternatives.sort((a, b) => {
    const progressIndexA = progressIndexScenario(a);
    const progressIndexB = progressIndexScenario(b);
    if (progressIndexA !== progressIndexB) return progressIndexB - progressIndexA;
    return a.result.equityGap - b.result.equityGap;
  })[0] ?? scenarios[0];
}

function progressIndexScenario(scenario: ScenarioResult) {
  const monthsGain = scenario.monthsDelta ?? 0;
  return monthsGain * 3 + scenario.equityGapDelta / 25000 + scenario.capacityDelta / 50000;
}

function addMonthlySaving(inputs: HemraInputs, extraMonthlySaving: number, months: number): HemraInputs {
  const currentSaving = toPositiveNumber(inputs.financial.monthlySavings);
  return {
    ...inputs,
    financial: {
      ...inputs.financial,
      monthlySavings: String(currentSaving + extraMonthlySaving),
      savings: String(toPositiveNumber(inputs.financial.savings) + (currentSaving + extraMonthlySaving) * months)
    }
  };
}

function getMonthsDelta(baseMonths: number | null, scenarioMonths: number | null) {
  if (baseMonths === null || scenarioMonths === null) return null;
  return baseMonths - scenarioMonths;
}

function getScenarioBadge(
  id: string,
  result: ReturnType<typeof calculateHemra>,
  capacityDelta: number,
  equityGapDelta: number,
  monthsDelta: number | null
) {
  if (result.status === "Realistisk nå") return "Innen rekkevidde";
  if (id === "today") return result.mainBlocker === "Ingen tydelig hovedbrems" ? "Godt utgangspunkt" : `Hovedbrems: ${result.mainBlocker}`;
  if (id === "priority-debt") return capacityDelta > 0 ? "Bedre låneramme" : "Bedre handlingsrom";
  if (id === "target-savings") return equityGapDelta > 0 ? "Treffer tidsmålet bedre" : "Stabil sparing";
  if (id === "more-time") return monthsDelta !== null && monthsDelta > 0 ? "Tidsbilde" : "Samme tempo";
  if (id === "lower-target") return "Lavere målpris";
  if (id === "smaller-home") return "Mindre bolig";
  if (id === "cheaper-city") return "Lavere prisnivå";
  if (equityGapDelta > 0) return "Mindre gap";
  if (capacityDelta > 0) return "Bedre ramme";
  return "Liten effekt alene";
}

function getInterpretation(id: string, result: ReturnType<typeof calculateHemra>, capacityDelta: number, equityGapDelta: number, monthsDelta: number | null) {
  if (result.status === "Realistisk nå") return "Dette flytter planen inn i et mer realistisk område.";
  if (id === "priority-debt") return capacityDelta > 0
    ? "Gjeldsbildet blir lettere for banken å vurdere. Egenkapital kan likevel fortsatt være hovedbremsen."
    : "Nyttig først hvis gjelden er dyr eller tar mye av månedsbudsjettet ditt.";
  if (id === "target-savings") return "Dette er sparegrepet som matcher gapet og tidsmålet bedre enn et standardbeløp.";
  if (id === "more-time") return monthsDelta !== null && monthsDelta > 0
    ? "Tiden hjelper, men viser også om dagens tempo er nok alene."
    : "Ventetid alene endrer lite når låneramme eller prisnivå er hovedbremsen.";
  if (id === "lower-target") return "Et lavere prismål virker ofte på flere bremser samtidig: egenkapital, lån og månedskostnad.";
  if (id === "smaller-home") return "Mindre størrelse kan være et mer realistisk kompromiss enn å flytte langt unna hverdagen din.";
  if (id === "cheaper-city") return "Lavere prisnivå kan redusere både egenkapitalkrav, lånebehov og boligkostnad.";
  if (capacityDelta > 0 && equityGapDelta <= 0) return `Lånerammen bedres noe, men ${result.mainBlocker.toLowerCase()} kan fortsatt stoppe planen.`;
  if (equityGapDelta > 0) return "Gapet blir mindre, men må ses sammen med låneramme og månedlig betalingsevne.";
  return "Effekten er liten alene. Kombiner gjerne med sparing eller justert boligønske.";
}

function formatShortMonths(months: number) {
  if (months < 12) return `${months} mnd`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} år ${rest} mnd` : `${years} år`;
}

function getProjectionMonths(desiredTimeframeMonths: number) {
  if (desiredTimeframeMonths <= 12) return 12;
  if (desiredTimeframeMonths <= 24) return 18;
  if (desiredTimeframeMonths <= 48) return 24;
  return 36;
}

function getSavingsIncreaseForTimeframe(inputs: HemraInputs, baseResult: ReturnType<typeof calculateHemra>) {
  const currentSaving = toPositiveNumber(inputs.financial.monthlySavings);
  if (baseResult.equityGap <= 0) return 0;
  const required = baseResult.requiredMonthlySavingsForTimeframe ?? 0;
  const gap = Math.max(0, required - currentSaving);
  if (gap > 0) return roundToNearest(Math.min(gap, Math.max(1000, currentSaving + 6000)), 500);
  if (currentSaving > 0 && baseResult.timeframeFeasibility !== "realistisk") return roundToNearest(Math.max(1000, currentSaving * 0.2), 500);
  return 0;
}

function roundToNearest(value: number, nearest: number) {
  if (value <= 0) return 0;
  return Math.max(nearest, Math.round(value / nearest) * nearest);
}

function getDebtScenarioAmount(totalRelevantDebt: number) {
  const roundedShare = Math.round((totalRelevantDebt * 0.3) / 10000) * 10000;
  return Math.min(totalRelevantDebt, Math.max(10000, roundedShare));
}

function reduceDebt(inputs: HemraInputs, amount: number): HemraInputs {
  let remaining = amount;
  const financial = { ...inputs.financial };
  const order: Array<keyof typeof financial> = ["consumerDebt", "creditCardUsed", "carLoan", "otherDebt", "studentLoan"];
  const originalDebt = order.reduce((sum, key) => sum + toPositiveNumber(financial[key]), 0);

  for (const key of order) {
    const reduction = Math.min(remaining, toPositiveNumber(financial[key]));
    financial[key] = String(toPositiveNumber(financial[key]) - reduction);
    remaining -= reduction;
    if (remaining <= 0) break;
  }

  const actualReduction = amount - Math.max(0, remaining);
  if (originalDebt > 0 && toPositiveNumber(financial.monthlyDebtPayments) > 0) {
    const remainingPaymentShare = Math.max(0, 1 - actualReduction / originalDebt);
    financial.monthlyDebtPayments = String(Math.round(toPositiveNumber(financial.monthlyDebtPayments) * remainingPaymentShare));
  }

  return { ...inputs, financial };
}
