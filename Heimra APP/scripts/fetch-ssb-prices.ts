import { writeFile } from "node:fs/promises";
import path from "node:path";

const TABLE_ID = "14545";
const SOURCE = "SSB table 14545";
const METADATA_URL = `https://data.ssb.no/api/pxwebapi/v2/tables/${TABLE_ID}/metadata?lang=no`;
const DATA_URL = `https://data.ssb.no/api/v0/no/table/${TABLE_ID}`;

type HousingPriceKey = "apartmentPricePerSqm" | "rowHousePricePerSqm" | "detachedHousePricePerSqm";

interface MunicipalityMapping {
  id: string;
  name: string;
  region: string;
  ssbRegionCode: string;
  relatedCityIds: string[];
}

interface JsonStatDimension {
  category: {
    index: Record<string, number>;
    label?: Record<string, string>;
  };
}

interface JsonStatDataset {
  id: string[];
  size: number[];
  dimension: Record<string, JsonStatDimension>;
  value: Array<number | null>;
}

const municipalities: MunicipalityMapping[] = [
  { id: "oslo", name: "Oslo", region: "Oslo", ssbRegionCode: "0301", relatedCityIds: ["lillestrom", "drammen", "fredrikstad", "sarpsborg", "moss", "asker", "baerum"] },
  { id: "bergen", name: "Bergen", region: "Vestland", ssbRegionCode: "4601", relatedCityIds: ["stavanger", "alesund", "kristiansand", "sandnes"] },
  { id: "trondheim", name: "Trondheim", region: "Trøndelag", ssbRegionCode: "5001", relatedCityIds: ["hamar", "lillehammer", "alesund"] },
  { id: "stavanger", name: "Stavanger", region: "Rogaland", ssbRegionCode: "1103", relatedCityIds: ["sandnes", "bergen", "kristiansand"] },
  { id: "tromso", name: "Tromsø", region: "Troms", ssbRegionCode: "5501", relatedCityIds: ["alta", "harstad", "narvik"] },
  { id: "bodo", name: "Bodø", region: "Nordland", ssbRegionCode: "1804", relatedCityIds: ["fauske", "rana", "narvik", "harstad"] },
  { id: "drammen", name: "Drammen", region: "Buskerud", ssbRegionCode: "3301", relatedCityIds: ["oslo", "lillestrom", "moss", "tonsberg", "asker"] },
  { id: "fredrikstad", name: "Fredrikstad", region: "Østfold", ssbRegionCode: "3107", relatedCityIds: ["sarpsborg", "moss", "tonsberg", "oslo"] },
  { id: "sarpsborg", name: "Sarpsborg", region: "Østfold", ssbRegionCode: "3105", relatedCityIds: ["fredrikstad", "moss", "oslo"] },
  { id: "kristiansand", name: "Kristiansand", region: "Agder", ssbRegionCode: "4204", relatedCityIds: ["stavanger", "sandnes", "bergen"] },
  { id: "sandnes", name: "Sandnes", region: "Rogaland", ssbRegionCode: "1108", relatedCityIds: ["stavanger", "kristiansand", "bergen"] },
  { id: "lillestrom", name: "Lillestrøm", region: "Akershus", ssbRegionCode: "3205", relatedCityIds: ["oslo", "drammen", "moss", "asker"] },
  { id: "asker", name: "Asker", region: "Akershus", ssbRegionCode: "3203", relatedCityIds: ["oslo", "baerum", "drammen"] },
  { id: "baerum", name: "Bærum", region: "Akershus", ssbRegionCode: "3201", relatedCityIds: ["oslo", "asker", "drammen"] },
  { id: "alesund", name: "Ålesund", region: "Møre og Romsdal", ssbRegionCode: "1508", relatedCityIds: ["bergen", "trondheim"] },
  { id: "tonsberg", name: "Tønsberg", region: "Vestfold", ssbRegionCode: "3905", relatedCityIds: ["drammen", "fredrikstad", "moss"] },
  { id: "moss", name: "Moss", region: "Østfold", ssbRegionCode: "3103", relatedCityIds: ["oslo", "fredrikstad", "sarpsborg", "drammen"] },
  { id: "hamar", name: "Hamar", region: "Innlandet", ssbRegionCode: "3403", relatedCityIds: ["lillehammer", "trondheim", "oslo"] },
  { id: "lillehammer", name: "Lillehammer", region: "Innlandet", ssbRegionCode: "3405", relatedCityIds: ["hamar", "trondheim", "oslo"] },
  { id: "narvik", name: "Narvik", region: "Nordland", ssbRegionCode: "1806", relatedCityIds: ["bodo", "tromso", "harstad", "alta"] },
  { id: "harstad", name: "Harstad", region: "Troms", ssbRegionCode: "5503", relatedCityIds: ["tromso", "bodo", "narvik"] },
  { id: "fauske", name: "Fauske", region: "Nordland", ssbRegionCode: "1841", relatedCityIds: ["bodo", "rana", "narvik"] },
  { id: "rana", name: "Rana / Mo i Rana", region: "Nordland", ssbRegionCode: "1833", relatedCityIds: ["bodo", "fauske", "narvik"] },
  { id: "alta", name: "Alta", region: "Finnmark", ssbRegionCode: "5601", relatedCityIds: ["tromso", "harstad", "narvik"] }
];

// SSB 14545 uses 01=Eneboliger, 02=Småhus and 03=Blokkleiligheter.
// If SSB changes table codes, this is the place to adjust the app mapping.
const housingTypeMap: Record<string, HousingPriceKey> = {
  "03": "apartmentPricePerSqm",
  "02": "rowHousePricePerSqm",
  "01": "detachedHousePricePerSqm"
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`SSB request failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json() as Promise<T>;
}

function getLatestYear(metadata: JsonStatDataset) {
  const years = Object.keys(metadata.dimension.Tid.category.index)
    .map((year) => Number(year))
    .filter(Number.isFinite)
    .sort((a, b) => b - a);

  if (!years[0]) {
    throw new Error("Could not find any years in SSB table metadata.");
  }

  return years[0];
}

function getCell(dataset: JsonStatDataset, selectors: Record<string, string>) {
  let offset = 0;
  let stride = dataset.value.length;

  dataset.id.forEach((dimensionId, dimensionPosition) => {
    stride = stride / dataset.size[dimensionPosition];
    const code = selectors[dimensionId];
    const index = dataset.dimension[dimensionId].category.index[code];

    if (index === undefined) {
      throw new Error(`Missing SSB code "${code}" in dimension "${dimensionId}".`);
    }

    offset += index * stride;
  });

  return dataset.value[offset];
}

async function main() {
  const metadata = await fetchJson<JsonStatDataset>(METADATA_URL);
  const latestYear = getLatestYear(metadata);
  const municipalityCodes = municipalities.map((municipality) => municipality.ssbRegionCode);
  const housingCodes = Object.keys(housingTypeMap);

  const query = {
    query: [
      { code: "Region", selection: { filter: "item", values: municipalityCodes } },
      { code: "Boligtype", selection: { filter: "item", values: housingCodes } },
      { code: "ContentsCode", selection: { filter: "item", values: ["KvPris"] } },
      { code: "Tid", selection: { filter: "item", values: [String(latestYear)] } }
    ],
    response: { format: "json-stat2" }
  };

  const dataset = await fetchJson<JsonStatDataset>(DATA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });

  const missingValues: string[] = [];
  const normalizedMunicipalities = municipalities.map(({ ssbRegionCode, ...municipality }) => {
    const prices = Object.entries(housingTypeMap).reduce(
      (result, [ssbHousingCode, priceKey]) => {
        const value = getCell(dataset, {
          Region: ssbRegionCode,
          Boligtype: ssbHousingCode,
          ContentsCode: "KvPris",
          Tid: String(latestYear)
        });

        if (typeof value !== "number") {
          missingValues.push(`${municipality.name} (${ssbRegionCode}) ${ssbHousingCode}`);
          return result;
        }

        return { ...result, [priceKey]: value };
      },
      {} as Record<HousingPriceKey, number>
    );

    return {
      ...municipality,
      ...prices,
      source: SOURCE,
      year: latestYear
    };
  });

  if (missingValues.length > 0) {
    throw new Error(`SSB returned missing price values for: ${missingValues.join(", ")}`);
  }

  const output = {
    sourceLabel: "SSB, siste tilgjengelige år",
    source: SOURCE,
    year: latestYear,
    municipalities: normalizedMunicipalities
  };

  const outputPath = path.join(process.cwd(), "lib", "ssbPrices.json");
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${normalizedMunicipalities.length} municipalities from SSB ${TABLE_ID} (${latestYear}) to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
