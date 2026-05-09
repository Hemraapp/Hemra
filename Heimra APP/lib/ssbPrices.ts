import ssbPrices from "@/lib/ssbPrices.json";
import locationGroups from "@/lib/locationGroups.json";
import type { CityPriceData, HomeType } from "@/lib/types";

export const priceSourceLabel = ssbPrices.sourceLabel;
export const priceBasisTooltip = "Prisene er basert på gjennomsnittlig kvadratmeterpris per kommune og boligtype. Faktiske boliger vil variere.";

export const cityPriceData = ssbPrices.municipalities as CityPriceData[];
export const groupedLocationData = locationGroups.map((group) => ({
  ...group,
  locations: group.locationIds
    .map((id) => cityPriceData.find((city) => city.id === id))
    .filter((city): city is CityPriceData => Boolean(city))
    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
}));

export const homeTypeLabels: Record<HomeType, string> = {
  apartment: "Leilighet",
  rowHouse: "Rekkehus/tomannsbolig",
  detachedHouse: "Enebolig"
};

export const defaultHomeSizeByType: Record<HomeType, number> = {
  apartment: 45,
  rowHouse: 85,
  detachedHouse: 130
};

export function getCityById(cityId: string) {
  return cityPriceData.find((city) => city.id === cityId) ?? cityPriceData[0];
}

export function getPricePerSqm(city: CityPriceData, homeType: HomeType) {
  if (homeType === "rowHouse") return city.rowHousePricePerSqm;
  if (homeType === "detachedHouse") return city.detachedHousePricePerSqm;
  return city.apartmentPricePerSqm;
}

export function getLocalPricePerSqm(city: CityPriceData, homeType: HomeType) {
  if (homeType === "rowHouse") return city.rawRowHousePricePerSqm ?? null;
  if (homeType === "detachedHouse") return city.rawDetachedHousePricePerSqm ?? null;
  return city.rawApartmentPricePerSqm ?? null;
}

export function getPriceDataNotice(city: CityPriceData, homeType: HomeType) {
  const localPrice = getLocalPricePerSqm(city, homeType);
  if (localPrice !== null) {
    return {
      type: "local" as const,
      text: `Lokalt prisgrunnlag for ${city.name}.`,
      fallbackName: null
    };
  }
  const fallback = city.fallbackByType?.[homeType];
  return {
    type: "fallback" as const,
    text: fallback
      ? "Lite lokalt datagrunnlag tilgjengelig. Viser estimater basert på nærmeste sammenlignbare boligmarked."
      : "Lite lokalt datagrunnlag tilgjengelig. Viser estimat med beste tilgjengelige SSB-grunnlag.",
    fallbackName: fallback?.fallbackName ?? null
  };
}

export function getRelatedCities(cityId: string) {
  const city = getCityById(cityId);
  return city.relatedCityIds
    .map((id) => cityPriceData.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is CityPriceData => Boolean(candidate))
    .slice(0, 4);
}
