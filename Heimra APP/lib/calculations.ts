import { defaultHomeSizeByType, getCityById, getPricePerSqm } from "@/lib/ssbPrices";
import type { CalculationResult, HemraInputs, HomeGoalInput, MainBlocker, PurchaseTimeframe, ReadinessStatus, Recommendation, TimeframeFeasibility, UserFinancialInput } from "@/lib/types";

type NumericFinancialInput = Record<keyof UserFinancialInput, number>;
type NumericGoalInput = Omit<HomeGoalInput, "desiredSqm" | "targetPurchasePrice" | "commonCosts"> & {
  desiredSqm: number;
  targetPurchasePrice?: number;
  commonCosts: number;
};

export const defaultFinancialInput: UserFinancialInput = {
  grossIncome: "",
  partnerGrossIncome: "",
  savings: "",
  bsuBalance: "",
  monthlySavings: "",
  rent: "",
  studentLoan: "",
  carLoan: "",
  consumerDebt: "",
  creditCardUsed: "",
  creditCardLimit: "",
  otherDebt: "",
  monthlyDebtPayments: ""
};

export const defaultGoalInput: HomeGoalInput = {
  cityId: "oslo",
  homeType: "apartment",
  desiredSqm: String(defaultHomeSizeByType.apartment),
  targetPurchasePrice: undefined,
  buyingWithPartner: false,
  commonCosts: "",
  purchaseTimeframe: "twoToFour",
  customTargetMonths: ""
};

export const defaultInputs: HemraInputs = {
  financial: defaultFinancialInput,
  goal: defaultGoalInput
};

export function formatNok(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

export function formatNokCompact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(".", ",")} mill.`;
  if (value >= 100000) return `${Math.round(value / 1000)} 000 kr`;
  return formatNok(value);
}

export function formatNokRange(low: number, high: number) {
  return `Ca. ${formatNokCompact(low)}–${formatNokCompact(high)}`;
}

export function formatMonths(months: number | null) {
  if (months === null) return "Ikke beregnbart";
  if (months <= 0) return "Klar nå";
  if (months < 12) return `${months} mnd`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} år og ${rest} mnd` : `${years} år`;
}

export function getTimeframeLabel(timeframe: PurchaseTimeframe, customTargetMonths?: number) {
  if (timeframe === "within1") return "Innen 1 år";
  if (timeframe === "oneToTwo") return "1-2 år";
  if (timeframe === "twoToFour") return "2-4 år";
  if (timeframe === "fivePlus") return "5+ år";
  if (customTargetMonths && customTargetMonths > 0) return `${formatMonths(customTargetMonths)}`;
  return "Egendefinert";
}

export function getTimeframeMonths(timeframe: PurchaseTimeframe, customTargetMonths?: number) {
  if (timeframe === "within1") return 12;
  if (timeframe === "oneToTwo") return 24;
  if (timeframe === "twoToFour") return 48;
  if (timeframe === "fivePlus") return 72;
  return customTargetMonths && customTargetMonths > 0 ? customTargetMonths : 48;
}

export function calculateMonthlyPayment(loanAmount: number, annualInterestRate: number, years = 25) {
  if (loanAmount <= 0) return 0;
  const monthlyRate = annualInterestRate / 100 / 12;
  const payments = years * 12;
  if (monthlyRate === 0) return loanAmount / payments;
  return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
}

export function calculateHemra(inputs: HemraInputs, interestRate = 5.5): CalculationResult {
  const financial = sanitizeFinancial(inputs.financial);
  const goal = sanitizeGoal(inputs.goal);
  const city = getCityById(goal.cityId);
  const estimatedFromArea = getPricePerSqm(city, goal.homeType) * goal.desiredSqm;
  const estimatedAreaPurchasePrice = goal.targetPurchasePrice && goal.targetPurchasePrice > 0 ? goal.targetPurchasePrice : estimatedFromArea;
  const grossHouseholdIncome = financial.grossIncome + (goal.buyingWithPartner ? financial.partnerGrossIncome : 0);
  const totalSavings = financial.savings + financial.bsuBalance;
  const totalExistingDebt = financial.studentLoan + financial.carLoan + financial.consumerDebt + Math.max(financial.creditCardUsed, financial.creditCardLimit) + financial.otherDebt;
  const requiredEquity = estimatedAreaPurchasePrice * 0.1;
  const maxMortgageByDebt = Math.max(0, grossHouseholdIncome * 5 - totalExistingDebt);
  const maxPurchaseByDebt = maxMortgageByDebt / 0.9;
  const maxPurchaseByEquity = totalSavings / 0.1;
  const estimatedBuyingCapacity = Math.min(maxPurchaseByEquity, maxPurchaseByDebt);
  const equityGap = Math.max(0, requiredEquity - totalSavings);
  const monthsUntilReady = equityGap > 0 ? (financial.monthlySavings > 0 ? Math.ceil(equityGap / financial.monthlySavings) : null) : 0;
  const loanNeeded = Math.max(0, estimatedAreaPurchasePrice - totalSavings);
  const commonCosts = goal.homeType === "apartment" ? goal.commonCosts || 3500 : 0;
  const monthlyPaymentEstimate = calculateMonthlyPayment(loanNeeded, interestRate) + commonCosts;
  const stressTestMonthlyPayment = calculateMonthlyPayment(loanNeeded, Math.max(7, interestRate + 3)) + commonCosts;
  const stressedMonthlyCommitments = stressTestMonthlyPayment + financial.monthlyDebtPayments;
  const monthlyPaymentRatio = stressedMonthlyCommitments / Math.max(1, grossHouseholdIncome / 12);
  const customTargetMonths = toPositiveNumber(goal.customTargetMonths);
  const desiredTimeframeMonths = getTimeframeMonths(goal.purchaseTimeframe, customTargetMonths);
  const desiredTimeframeLabel = getTimeframeLabel(goal.purchaseTimeframe, customTargetMonths);
  const requiredMonthlySavingsForTimeframe = equityGap > 0 && desiredTimeframeMonths > 0 ? Math.ceil(equityGap / desiredTimeframeMonths) : 0;
  const savingsPaceGap = requiredMonthlySavingsForTimeframe === null ? null : Math.max(0, requiredMonthlySavingsForTimeframe - financial.monthlySavings);
  const debtCapacityGap = Math.max(0, estimatedAreaPurchasePrice * 0.9 - maxMortgageByDebt);
  const debtPaydownMonths = debtCapacityGap > 0 ? (financial.monthlyDebtPayments > 0 ? Math.ceil(debtCapacityGap / financial.monthlyDebtPayments) : null) : 0;
  const realisticPurchaseMonths = estimateRealisticPurchaseMonths({
    equityMonths: monthsUntilReady,
    debtPaydownMonths,
    debtCapacityGap,
    monthlyPaymentRatio,
    financial
  });
  const debtBlocks = estimatedAreaPurchasePrice > maxPurchaseByDebt;
  const equityBlocks = estimatedAreaPurchasePrice > maxPurchaseByEquity;
  const monthlyBlocks = monthlyPaymentRatio > 0.5;
  const bottlenecks = getBottlenecks({
    debtBlocks,
    equityBlocks,
    monthlyBlocks,
    equityPressure: requiredEquity > 0 ? equityGap / requiredEquity : 0,
    debtPressure: estimatedAreaPurchasePrice > 0 ? debtCapacityGap / (estimatedAreaPurchasePrice * 0.9) : 0,
    monthlyPaymentRatio
  });
  const mainBlocker = bottlenecks.primary;
  const timeframeFeasibility = getTimeframeFeasibility(realisticPurchaseMonths, desiredTimeframeMonths, debtBlocks, monthlyBlocks);
  const timeframeSummary = getTimeframeSummary({
    feasibility: timeframeFeasibility,
    realisticPurchaseMonths,
    desiredTimeframeMonths,
    desiredTimeframeLabel,
    debtBlocks,
    equityGap,
    savingsPaceGap,
    monthlyBlocks
  });
  const capacityRatio = estimatedAreaPurchasePrice > 0 ? estimatedBuyingCapacity / estimatedAreaPurchasePrice : 0;
  const status = getStatus(capacityRatio, equityGap, mainBlocker, timeframeFeasibility);
  const progressIndex = calculateProgressIndex({
    totalSavings,
    requiredEquity,
    estimatedBuyingCapacity,
    estimatedAreaPurchasePrice,
    stressTestMonthlyPayment: stressedMonthlyCommitments,
    grossHouseholdIncome,
    goal,
    timeframeFeasibility
  });

  return {
    grossHouseholdIncome,
    totalExistingDebt,
    totalSavings,
    estimatedAreaPurchasePrice,
    realisticPriceLow: estimatedAreaPurchasePrice * 0.95,
    realisticPriceHigh: estimatedAreaPurchasePrice * 1.05,
    requiredEquity,
    maxMortgageByDebt,
    maxPurchaseByDebt,
    maxPurchaseByEquity,
    estimatedBuyingCapacity,
    equityGap,
    monthsUntilReady,
    mainBlocker,
    monthlyPaymentEstimate,
    stressTestMonthlyPayment,
    monthlyPaymentRatio,
    desiredTimeframeMonths,
    desiredTimeframeLabel,
    realisticPurchaseMonths,
    requiredMonthlySavingsForTimeframe,
    savingsPaceGap,
    debtCapacityGap,
    debtPaydownMonths,
    timeframeFeasibility,
    timeframeSummary,
    primaryBottleneck: bottlenecks.primary,
    secondaryBottleneck: bottlenecks.secondary,
    status,
    progressIndex
  };
}

export function getResultSummary(result: CalculationResult) {
  if (result.status === "Realistisk nå") {
    return `Tallene dine peker mot at boligkjøp kan være realistisk, men banken må fortsatt gjøre sin egen vurdering. ${result.timeframeSummary}`;
  }
  if (result.mainBlocker === "Egenkapital") {
    return `Du mangler fortsatt nok egenkapital til valgt bolig. Lånerammen kan være nær, men sparetempoet må passe bedre med tidsmålet ditt. ${result.timeframeSummary}`;
  }
  if (result.mainBlocker === "Inntekt / gjeld") {
    return `Gjeld og inntekt begrenser hvor langt banken kan strekke lånerammen, selv om sparebildet kan se bedre ut. ${result.timeframeSummary}`;
  }
  if (result.mainBlocker === "Månedlig betalingsevne") {
    return `Samlet betalingsevne blir stram når boligkostnad og oppgitte gjeldsbetalinger ses sammen. Et rimeligere mål eller lavere faste gjeldsbetalinger hjelper mest. ${result.timeframeSummary}`;
  }
  if (result.mainBlocker === "Egenkapital og låneramme") {
    return `Både egenkapital og låneramme trekker ned. Du trenger en kombinasjon av sparing, lavere gjeld eller et rimeligere mål. ${result.timeframeSummary}`;
  }
  return `Det finnes ingen tydelig hovedbrems i denne forenklede beregningen. Neste steg er å kvalitetssikre tallene med bank. ${result.timeframeSummary}`;
}

export function getPrioritizedActions(inputs: HemraInputs, result: CalculationResult): Recommendation[] {
  const financial = sanitizeFinancial(inputs.financial);
  const goal = sanitizeGoal(inputs.goal);
  const actions: Recommendation[] = [];
  const currentMonthlySavings = financial.monthlySavings;
  const requiredSaving = result.requiredMonthlySavingsForTimeframe ?? 0;

  if (result.equityGap > 0) {
    const suggestedIncrease = result.savingsPaceGap && result.savingsPaceGap > 0
      ? roundToNearest(result.savingsPaceGap, 500)
      : currentMonthlySavings > 0
        ? roundToNearest(Math.max(1000, currentMonthlySavings * 0.25), 500)
        : roundToNearest(Math.max(1500, result.equityGap / Math.max(12, result.desiredTimeframeMonths)), 500);
    actions.push({
      id: "equity",
      title: result.savingsPaceGap && result.savingsPaceGap > 0 ? "Øk sparetempoet målrettet" : "Hold sparetempoet stabilt",
      reason: `Du mangler omtrent ${formatNokCompact(result.equityGap)} i egenkapital. For tidsmålet ${result.desiredTimeframeLabel.toLowerCase()} trengs omtrent ${formatNokCompact(requiredSaving)} per måned mot egenkapital.`,
      effect: result.savingsPaceGap && result.savingsPaceGap > 0
        ? `Å øke sparingen med rundt ${formatNokCompact(suggestedIncrease)} per måned vil treffe bedre på tidsmålet enn et generelt sparegrep.`
        : "Dagens sparetempo ser ut til å være i nærheten av det tidsmålet krever, så stabilitet er viktigere enn store grep.",
      evidence: `Dagens sparing: ${formatNokCompact(currentMonthlySavings)} per måned. Beregnet behov: ${formatNokCompact(requiredSaving)} per måned.`,
      priority: result.mainBlocker.includes("Egenkapital") ? "hoy" : "middels"
    });
  }

  const expensiveDebt = financial.consumerDebt + financial.creditCardUsed + financial.carLoan;
  const visibleDebtPressure = expensiveDebt + financial.creditCardLimit + financial.otherDebt;
  if (visibleDebtPressure > 0 || result.debtCapacityGap > 0) {
    const debtFocus = result.debtCapacityGap > 0 ? Math.min(result.debtCapacityGap, Math.max(25000, visibleDebtPressure * 0.35)) : Math.max(10000, visibleDebtPressure * 0.25);
    actions.push({
      id: "debt",
      title: result.debtCapacityGap > 0 ? "Prioriter gjeld som svekker lånerammen" : "Rydd i dyr og synlig gjeld",
      reason: result.debtCapacityGap > 0
        ? `Lånerammen mangler omtrent ${formatNokCompact(result.debtCapacityGap)} før valgt bolig henger bedre sammen med gjeldsregelen.`
        : "Dyr gjeld og kredittrammer kan gjøre vurderingen tyngre, selv når egenkapitalen er hovedtemaet.",
      effect: `Et konkret første mål kan være å redusere gjeld eller kredittrammer med rundt ${formatNokCompact(roundToNearest(debtFocus, 5000))}, særlig hvis dette også senker månedlige betalinger.`,
      evidence: `Samlet gjeld/kreditteksponering: ${formatNokCompact(result.totalExistingDebt)}. Oppgitte gjeldsbetalinger: ${formatNokCompact(financial.monthlyDebtPayments)} per måned.`,
      priority: result.mainBlocker.includes("gjeld") ? "hoy" : "middels"
    });
  }

  if (result.monthlyPaymentRatio > 0.48) {
    actions.push({
      id: "payment",
      title: "Gjør planen mindre følsom for rente",
      reason: `Stresstestet boligkostnad og oppgitte gjeldsbetalinger utgjør omtrent ${Math.round(result.monthlyPaymentRatio * 100)}% av brutto månedsinntekt.`,
      effect: "Lavere målpris, mindre bolig eller lavere faste gjeldsbetalinger kan gjøre planen mer robust enn bare å spare litt mer.",
      evidence: `Stresstestet boligkostnad: ${formatNokCompact(result.stressTestMonthlyPayment)} per måned, før oppgitte gjeldsbetalinger.`,
      priority: "hoy"
    });
  }

  const lowerTarget = result.estimatedAreaPurchasePrice * 0.9;
  const targetPressure = result.estimatedAreaPurchasePrice > result.estimatedBuyingCapacity ? result.estimatedAreaPurchasePrice - result.estimatedBuyingCapacity : 0;
  actions.push({
    id: "goal",
    title: targetPressure > 0 ? "Test en lavere målpris" : "Sjekk om boligønsket tåler små justeringer",
    reason: targetPressure > 0
      ? `Valgt bolig ligger omtrent ${formatNokCompact(targetPressure)} over beregnet kjøpsramme akkurat nå.`
      : "Boligønsket er ikke åpenbart for høyt, men små justeringer kan gi mer margin.",
    effect: `Et prisnivå rundt ${formatNokCompact(lowerTarget)} vil redusere både egenkapitalbehov, lånebehov og månedskostnad.`,
    evidence: `Valgt mål: ${formatNokCompact(result.estimatedAreaPurchasePrice)}. Beregnet kjøpsramme: ${formatNokCompact(result.estimatedBuyingCapacity)}.`,
    priority: result.status === "Ikke realistisk ennå" ? "hoy" : "middels"
  });

  if (toPositiveNumber(inputs.financial.partnerGrossIncome) > 0 && !inputs.goal.buyingWithPartner) {
    actions.push({
      id: "partner",
      title: "Vurder kjøp sammen",
      reason: "Du har lagt inn partnerinntekt, men beregningen står på kjøp alene.",
      effect: "Partnerinntekt kan øke lånerammen, men egenkapital må fortsatt være tilstrekkelig.",
      evidence: `Partnerinntekt lagt inn: ${formatNokCompact(toPositiveNumber(inputs.financial.partnerGrossIncome))}.`,
      priority: "middels"
    });
  }

  if (goal.homeType === "apartment" && toPositiveNumber(inputs.financial.bsuBalance) === 0 && result.equityGap > 0) {
    actions.push({
      id: "bsu",
      title: "Bruk BSU som del av spareplanen hvis det passer",
      reason: "Når egenkapitalen er hovedgapet, kan en tydelig sparekonto gjøre progresjonen enklere å følge.",
      effect: "BSU endrer ikke lånerammen alene, men saldoen teller som egenkapital i denne beregningen.",
      evidence: "Du har ikke lagt inn BSU-saldo i tallene dine.",
      priority: "lav"
    });
  }

  return actions.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)).slice(0, 4);
}

function getBottlenecks(args: {
  debtBlocks: boolean;
  equityBlocks: boolean;
  monthlyBlocks: boolean;
  equityPressure: number;
  debtPressure: number;
  monthlyPaymentRatio: number;
}) {
  const candidates: Array<{ value: MainBlocker; score: number }> = [
    { value: "Egenkapital" as MainBlocker, score: args.equityBlocks ? 60 + args.equityPressure * 40 : args.equityPressure * 35 },
    { value: "Inntekt / gjeld" as MainBlocker, score: args.debtBlocks ? 60 + args.debtPressure * 40 : args.debtPressure * 35 },
    { value: "Månedlig betalingsevne" as MainBlocker, score: args.monthlyBlocks ? 55 + Math.max(0, args.monthlyPaymentRatio - 0.45) * 120 : Math.max(0, args.monthlyPaymentRatio - 0.35) * 55 }
  ].sort((a, b) => b.score - a.score);

  if (args.equityBlocks && args.debtBlocks && Math.abs(candidates[0].score - candidates[1].score) < 24) {
    return {
      primary: "Egenkapital og låneramme" as MainBlocker,
      secondary: candidates[0].value === "Egenkapital" ? "Inntekt / gjeld" as MainBlocker : "Egenkapital" as MainBlocker
    };
  }

  const primary = candidates[0].score > 18 ? candidates[0].value : "Ingen tydelig hovedbrems";
  const secondary = candidates[1] && candidates[1].score > 18 && candidates[1].value !== primary ? candidates[1].value : null;
  return { primary: primary as MainBlocker, secondary: secondary as MainBlocker | null };
}

function estimateRealisticPurchaseMonths(args: {
  equityMonths: number | null;
  debtPaydownMonths: number | null;
  debtCapacityGap: number;
  monthlyPaymentRatio: number;
  financial: NumericFinancialInput;
}) {
  const equityMonths = args.equityMonths ?? null;
  const debtMonths = args.debtCapacityGap > 0 ? args.debtPaydownMonths : 0;
  if (equityMonths === null && debtMonths === null) return null;
  const knownMonths = Math.max(equityMonths ?? 0, debtMonths ?? 0);
  if (args.monthlyPaymentRatio > 0.58) return knownMonths + 18;
  if (args.monthlyPaymentRatio > 0.5) return knownMonths + 9;
  return knownMonths;
}

function getTimeframeFeasibility(
  realisticPurchaseMonths: number | null,
  desiredTimeframeMonths: number,
  debtBlocks: boolean,
  monthlyBlocks: boolean
): TimeframeFeasibility {
  if (realisticPurchaseMonths === null) return "ikke-beregnbar";
  if (realisticPurchaseMonths <= desiredTimeframeMonths && !debtBlocks && !monthlyBlocks) return "realistisk";
  if (realisticPurchaseMonths <= desiredTimeframeMonths * 1.35) return "krevende";
  return "svært-krevende";
}

function getTimeframeSummary(args: {
  feasibility: TimeframeFeasibility;
  realisticPurchaseMonths: number | null;
  desiredTimeframeMonths: number;
  desiredTimeframeLabel: string;
  debtBlocks: boolean;
  equityGap: number;
  savingsPaceGap: number | null;
  monthlyBlocks: boolean;
}) {
  if (args.feasibility === "ikke-beregnbar") {
    return "Uten månedlig sparing er tidsmålet vanskelig å beregne på en nyttig måte.";
  }
  if (args.feasibility === "realistisk") {
    return `Tidsmålet ${args.desiredTimeframeLabel.toLowerCase()} virker mulig med dagens tempo, så lenge tallene holder seg stabile.`;
  }
  if (args.feasibility === "krevende") {
    if (args.savingsPaceGap && args.savingsPaceGap > 0) {
      return `For å nærme deg ${args.desiredTimeframeLabel.toLowerCase()} må egenkapitalen sannsynligvis økes raskere enn dagens tempo tilsier.`;
    }
    if (args.debtBlocks) return `Tidsmålet ${args.desiredTimeframeLabel.toLowerCase()} er ikke bare et spareproblem; lånerammen må også henge bedre sammen.`;
    return `Tidsmålet ${args.desiredTimeframeLabel.toLowerCase()} virker krevende, men ikke utenfor rekkevidde med riktige justeringer.`;
  }
  if (args.realisticPurchaseMonths !== null) {
    return `Med dagens tempo virker målet mer realistisk rundt ${formatMonths(args.realisticPurchaseMonths).toLowerCase()}, med mindre boligønske, gjeld eller sparing endres.`;
  }
  return `Tidsmålet ${args.desiredTimeframeLabel.toLowerCase()} virker krevende med dagens tall.`;
}

function getStatus(capacityRatio: number, equityGap: number, mainBlocker: MainBlocker, timeframeFeasibility: TimeframeFeasibility): ReadinessStatus {
  if (mainBlocker === "Ingen tydelig hovedbrems") return "Realistisk nå";
  if (timeframeFeasibility === "realistisk" && capacityRatio >= 0.86) return "Nær målet";
  if (capacityRatio >= 0.9 || equityGap <= 75000) return "Nær målet";
  if (capacityRatio >= 0.62) return "Mulig med noen endringer";
  return "Ikke realistisk ennå";
}

function calculateProgressIndex(args: {
  totalSavings: number;
  requiredEquity: number;
  estimatedBuyingCapacity: number;
  estimatedAreaPurchasePrice: number;
  stressTestMonthlyPayment: number;
  grossHouseholdIncome: number;
  goal: NumericGoalInput;
  timeframeFeasibility: TimeframeFeasibility;
}) {
  const equityProgress = ratio(args.totalSavings, args.requiredEquity);
  const debtProgress = ratio(args.estimatedBuyingCapacity, args.estimatedAreaPurchasePrice);
  const monthlyIncome = Math.max(1, args.grossHouseholdIncome / 12);
  const monthlyRoom = Math.max(0, monthlyIncome * 0.48 - args.stressTestMonthlyPayment);
  const affordability = Math.min(1, Math.max(0, 0.65 + monthlyRoom / monthlyIncome));
  const clarity = args.goal.cityId && args.goal.desiredSqm > 0 && args.goal.homeType ? 1 : 0.45;
  const timeframeScore = args.timeframeFeasibility === "realistisk" ? 1 : args.timeframeFeasibility === "krevende" ? 0.62 : args.timeframeFeasibility === "svært-krevende" ? 0.32 : 0.18;
  return Math.round((equityProgress * 0.3 + debtProgress * 0.3 + affordability * 0.18 + timeframeScore * 0.14 + clarity * 0.08) * 100);
}

function ratio(value: number, target: number) {
  if (target <= 0) return 1;
  return Math.min(1, Math.max(0, value / target));
}

function priorityWeight(priority: Recommendation["priority"]) {
  if (priority === "hoy") return 3;
  if (priority === "middels") return 2;
  return 1;
}

function roundToNearest(value: number, nearest: number) {
  if (value <= 0) return 0;
  return Math.max(nearest, Math.round(value / nearest) * nearest);
}

function sanitizeFinancial(financial: UserFinancialInput): NumericFinancialInput {
  return Object.fromEntries(Object.entries(financial).map(([key, value]) => [key, toPositiveNumber(value)])) as NumericFinancialInput;
}

function sanitizeGoal(goal: HomeGoalInput): NumericGoalInput {
  const desiredSqm = toPositiveNumber(goal.desiredSqm) || defaultHomeSizeByType[goal.homeType];
  const targetPurchasePrice = toPositiveNumber(goal.targetPurchasePrice);
  return {
    ...goal,
    desiredSqm,
    targetPurchasePrice: targetPurchasePrice > 0 ? targetPurchasePrice : undefined,
    commonCosts: toPositiveNumber(goal.commonCosts)
  };
}

export function toPositiveNumber(value: unknown) {
  return Math.max(0, Number(value || 0) || 0);
}
