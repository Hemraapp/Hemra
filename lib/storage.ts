"use client";

import { defaultInputs } from "@/lib/calculations";
import type { HemraInputs } from "@/lib/types";

export const hemraStorageKey = "hemra-inputs-v1";

export function loadHemraInputs(): HemraInputs {
  if (typeof window === "undefined") return defaultInputs;
  const stored = window.localStorage.getItem(hemraStorageKey);
  if (!stored) return defaultInputs;
  try {
    const parsed = JSON.parse(stored) as Partial<HemraInputs>;
    return {
      financial: { ...defaultInputs.financial, ...parsed.financial },
      goal: { ...defaultInputs.goal, ...parsed.goal }
    } as HemraInputs;
  } catch {
    return defaultInputs;
  }
}

export function saveHemraInputs(inputs: HemraInputs) {
  window.localStorage.setItem(hemraStorageKey, JSON.stringify(inputs));
}
