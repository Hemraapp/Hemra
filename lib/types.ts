export type HomeType = "apartment" | "rowHouse" | "detachedHouse";
export type NumericInput = string;
export type PurchaseTimeframe = "within1" | "oneToTwo" | "twoToFour" | "fivePlus" | "custom";
export type TimeframeFeasibility = "realistisk" | "krevende" | "svært-krevende" | "ikke-beregnbar";

export interface CityPriceData {
  id: string;
  code?: string;
  name: string;
  region: string;
  apartmentPricePerSqm: number;
  rowHousePricePerSqm: number;
  detachedHousePricePerSqm: number;
  rawApartmentPricePerSqm?: number | null;
  rawRowHousePricePerSqm?: number | null;
  rawDetachedHousePricePerSqm?: number | null;
  dataQuality?: "local" | "fallback";
  fallbackByType?: Partial<Record<HomeType, { fallbackId: string; fallbackName: string; reason: string }>>;
  source: string;
  year: number;
  relatedCityIds: string[];
}

export interface UserFinancialInput {
  grossIncome: NumericInput;
  partnerGrossIncome: NumericInput;
  savings: NumericInput;
  bsuBalance: NumericInput;
  monthlySavings: NumericInput;
  rent: NumericInput;
  studentLoan: NumericInput;
  carLoan: NumericInput;
  consumerDebt: NumericInput;
  creditCardUsed: NumericInput;
  creditCardLimit: NumericInput;
  otherDebt: NumericInput;
  monthlyDebtPayments: NumericInput;
}

export interface HomeGoalInput {
  cityId: string;
  homeType: HomeType;
  desiredSqm: NumericInput;
  targetPurchasePrice?: NumericInput;
  buyingWithPartner: boolean;
  commonCosts?: NumericInput;
  purchaseTimeframe: PurchaseTimeframe;
  customTargetMonths?: NumericInput;
}

export type MainBlocker =
  | "Egenkapital"
  | "Inntekt / gjeld"
  | "Månedlig betalingsevne"
  | "Egenkapital og låneramme"
  | "Ingen tydelig hovedbrems";

export type ReadinessStatus =
  | "Realistisk nå"
  | "Nær målet"
  | "Mulig med noen endringer"
  | "Ikke realistisk ennå";

export interface CalculationResult {
  grossHouseholdIncome: number;
  totalExistingDebt: number;
  totalSavings: number;
  estimatedAreaPurchasePrice: number;
  realisticPriceLow: number;
  realisticPriceHigh: number;
  requiredEquity: number;
  maxMortgageByDebt: number;
  maxPurchaseByDebt: number;
  maxPurchaseByEquity: number;
  estimatedBuyingCapacity: number;
  equityGap: number;
  monthsUntilReady: number | null;
  mainBlocker: MainBlocker;
  monthlyPaymentEstimate: number;
  stressTestMonthlyPayment: number;
  monthlyPaymentRatio: number;
  desiredTimeframeMonths: number;
  desiredTimeframeLabel: string;
  realisticPurchaseMonths: number | null;
  requiredMonthlySavingsForTimeframe: number | null;
  savingsPaceGap: number | null;
  debtCapacityGap: number;
  debtPaydownMonths: number | null;
  timeframeFeasibility: TimeframeFeasibility;
  timeframeSummary: string;
  primaryBottleneck: MainBlocker;
  secondaryBottleneck: MainBlocker | null;
  status: ReadinessStatus;
  progressIndex: number;
}

export interface HemraInputs {
  financial: UserFinancialInput;
  goal: HomeGoalInput;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  effect: string;
  evidence: string;
  priority: "hoy" | "middels" | "lav";
}

export interface ScenarioResult {
  id: string;
  title: string;
  description: string;
  changeSummary: string;
  helpsWith: string;
  limitation: string;
  interpretation: string;
  inputs: HemraInputs;
  result: CalculationResult;
  badge: string;
  capacityDelta: number;
  equityGapDelta: number;
  monthsDelta: number | null;
}
