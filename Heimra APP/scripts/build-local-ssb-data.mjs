import fs from "node:fs";
import path from "node:path";

const sourcePath = path.join("SSB DATA", "06035_20260509-181350.json");
const raw = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const groupOrder = [
  "Oslo og Akershus",
  "Østfold",
  "Innlandet",
  "Buskerud",
  "Vestfold",
  "Telemark",
  "Agder",
  "Rogaland",
  "Vestland",
  "Møre og Romsdal",
  "Trøndelag",
  "Nordland",
  "Troms",
  "Finnmark"
];

const countyGroupByPrefix = {
  "03": "Oslo og Akershus",
  "31": "Østfold",
  "32": "Oslo og Akershus",
  "33": "Buskerud",
  "34": "Innlandet",
  "39": "Vestfold",
  "40": "Telemark",
  "42": "Agder",
  "11": "Rogaland",
  "46": "Vestland",
  "15": "Møre og Romsdal",
  "50": "Trøndelag",
  "18": "Nordland",
  "55": "Troms",
  "56": "Finnmark"
};

const homeTypeByCode = {
  "01": "detachedHouse",
  "02": "rowHouse",
  "03": "apartment"
};

const regionLabels = raw.dimension.Region.category.label;
const regionIndex = raw.dimension.Region.category.index;
const boligtypeIndex = raw.dimension.Boligtype.category.index;
const year = Number(Object.keys(raw.dimension.Tid.category.index)[0]);
const valueStatus = raw.status ?? {};
const sizes = raw.size;

function valueOffset(regionPosition, homeTypeCode) {
  const boligtypePosition = boligtypeIndex[homeTypeCode];
  return regionPosition * sizes[1] * sizes[2] * sizes[3] + boligtypePosition;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupForCode(code) {
  return countyGroupByPrefix[String(code).slice(0, 2)] ?? "Uplassert";
}

const municipalities = Object.entries(regionLabels)
  .map(([code, name]) => {
    const regionPosition = regionIndex[code];
    const prices = {};
    const rawPrices = {};
    const missingTypes = [];

    for (const [typeCode, key] of Object.entries(homeTypeByCode)) {
      const offset = valueOffset(regionPosition, typeCode);
      const value = raw.value[offset];
      const isMissing = value === null || value === undefined || valueStatus[String(offset)];
      rawPrices[key] = typeof value === "number" ? value : null;
      prices[key] = typeof value === "number" ? value : null;
      if (prices[key] === null) missingTypes.push(key);
    }

    return {
      id: slugify(name),
      code,
      name,
      region: groupForCode(code),
      year,
      source: "SSB table 06035",
      rawPrices,
      prices,
      missingTypes
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "nb"));

function nearestFallback(target, type) {
  const targetCode = Number(target.code);
  const sameRegion = municipalities
    .filter((candidate) => candidate.id !== target.id && candidate.region === target.region && candidate.rawPrices[type] !== null)
    .map((candidate) => ({
      candidate,
      score: Math.abs(Number(candidate.code) - targetCode)
    }))
    .sort((a, b) => a.score - b.score || a.candidate.name.localeCompare(b.candidate.name, "nb"));

  if (sameRegion[0]) return sameRegion[0].candidate;

  return municipalities
    .filter((candidate) => candidate.id !== target.id && candidate.rawPrices[type] !== null)
    .map((candidate) => ({
      candidate,
      score: Math.abs(Number(candidate.code) - targetCode)
    }))
    .sort((a, b) => a.score - b.score || a.candidate.name.localeCompare(b.candidate.name, "nb"))[0]?.candidate;
}

const fallbackMap = {};

for (const municipality of municipalities) {
  const fallbackByType = {};
  for (const type of Object.keys(municipality.rawPrices)) {
    if (municipality.rawPrices[type] !== null) continue;
    const fallback = nearestFallback(municipality, type);
    if (!fallback) continue;
    municipality.prices[type] = fallback.rawPrices[type];
    fallbackByType[type] = {
      fallbackId: fallback.id,
      fallbackName: fallback.name,
      reason: "low_data_volume"
    };
  }

  if (Object.keys(fallbackByType).length > 0) {
    fallbackMap[municipality.id] = {
      municipality: municipality.name,
      fallbackByType
    };
  }
}

for (const municipality of municipalities) {
  const related = municipalities
    .filter((candidate) => candidate.id !== municipality.id && candidate.region === municipality.region)
    .map((candidate) => ({
      id: candidate.id,
      distance: Math.abs(Number(candidate.code) - Number(municipality.code)),
      complete: Object.values(candidate.rawPrices).filter((value) => value !== null).length
    }))
    .sort((a, b) => a.distance - b.distance || b.complete - a.complete)
    .slice(0, 5)
    .map((candidate) => candidate.id);

  municipality.relatedCityIds = related;
}

const cityPriceData = municipalities.map((municipality) => {
  const hasFallback = Boolean(fallbackMap[municipality.id]);
  return {
    id: municipality.id,
    code: municipality.code,
    name: municipality.name,
    region: municipality.region,
    apartmentPricePerSqm: municipality.prices.apartment ?? 0,
    rowHousePricePerSqm: municipality.prices.rowHouse ?? 0,
    detachedHousePricePerSqm: municipality.prices.detachedHouse ?? 0,
    rawApartmentPricePerSqm: municipality.rawPrices.apartment,
    rawRowHousePricePerSqm: municipality.rawPrices.rowHouse,
    rawDetachedHousePricePerSqm: municipality.rawPrices.detachedHouse,
    dataQuality: hasFallback ? "fallback" : "local",
    fallbackByType: fallbackMap[municipality.id]?.fallbackByType ?? {},
    relatedCityIds: municipality.relatedCityIds,
    source: municipality.source,
    year: municipality.year
  };
});

const groups = groupOrder.map((group) => ({
  id: slugify(group),
  name: group,
  locationIds: cityPriceData
    .filter((municipality) => municipality.region === group)
    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
    .map((municipality) => municipality.id)
}));

const sourceLabel = `SSB, siste tilgjengelige tall (${year})`;
const output = {
  sourceLabel,
  source: "SSB table 06035",
  year,
  municipalities: cityPriceData
};

fs.writeFileSync(path.join("SSB DATA", "housing-prices.json"), JSON.stringify(output, null, 2));
fs.writeFileSync(path.join("SSB DATA", "municipalities.json"), JSON.stringify(cityPriceData, null, 2));
fs.writeFileSync(path.join("SSB DATA", "location-groups.json"), JSON.stringify(groups, null, 2));
fs.writeFileSync(path.join("SSB DATA", "fallback-map.json"), JSON.stringify(fallbackMap, null, 2));
fs.writeFileSync(path.join("lib", "ssbPrices.json"), JSON.stringify(output, null, 2));
fs.writeFileSync(path.join("lib", "locationGroups.json"), JSON.stringify(groups, null, 2));

console.log(`Generated ${cityPriceData.length} municipalities from ${sourcePath}`);
console.log(`Fallback entries: ${Object.keys(fallbackMap).length}`);
