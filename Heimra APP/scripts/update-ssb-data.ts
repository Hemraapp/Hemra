/*
  Optional maintenance script for refreshing lib/ssbPrices.json.
  The app imports local data at build/runtime for speed and predictable UX.

  Intended flow:
  1. Fetch latest SSB municipality square-meter price table.
  2. Normalize municipality ids, names, regions and housing type columns.
  3. Write lib/ssbPrices.json with sourceLabel and municipalities.

  Keep this script explicit and reviewable before connecting it to CI.
*/

console.log("Update SSB price data by replacing lib/ssbPrices.json with normalized latest figures.");
