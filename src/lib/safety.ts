// Aegis Route — Safety Scoring + Real Data Sources
// Weighted Risk Aggregation Model. Returns 0–100 (higher = safer).

export type SafetyFactors = {
  crime: number;
  accidents: number;
  traffic: number;
  roadCondition: number;
  lighting: number;
  weather: number;
  crowdDensity: number;
  essentialsNearby: number;
};

export type Mode = "default" | "solo" | "accessible" | "cyclist";

export const DEFAULT_WEIGHTS: Record<keyof SafetyFactors, number> = {
  crime: 0.22,
  accidents: 0.16,
  traffic: 0.10,
  roadCondition: 0.10,
  lighting: 0.12,
  weather: 0.10,
  crowdDensity: 0.10,
  essentialsNearby: 0.10,
};

export const MODE_WEIGHTS: Record<Mode, Record<keyof SafetyFactors, number>> = {
  default: { ...DEFAULT_WEIGHTS },
  solo: { ...DEFAULT_WEIGHTS, crime: 0.30, lighting: 0.20 },
  accessible: { ...DEFAULT_WEIGHTS, roadCondition: 0.22, lighting: 0.20 },
  cyclist: { ...DEFAULT_WEIGHTS, accidents: 0.26, roadCondition: 0.20 },
};

export function computeSafetyScore(
  f: SafetyFactors,
  weights: Record<keyof SafetyFactors, number> = DEFAULT_WEIGHTS,
  prefs?: { nightMode?: boolean; avoidIsolated?: boolean; preferCrowded?: boolean }
): number {
  const w = { ...weights };
  if (prefs?.nightMode) { w.lighting += 0.05; w.crime += 0.03; }
  if (prefs?.avoidIsolated) { w.crowdDensity += 0.04; w.essentialsNearby += 0.03; }
  if (prefs?.preferCrowded) { w.crowdDensity += 0.04; }
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  Object.keys(w).forEach((k) => { w[k as keyof SafetyFactors] /= total; });
  const risk =
    f.crime * w.crime + f.accidents * w.accidents + f.traffic * w.traffic +
    f.roadCondition * w.roadCondition + f.lighting * w.lighting +
    f.weather * w.weather + f.crowdDensity * w.crowdDensity +
    f.essentialsNearby * w.essentialsNearby;
  return Math.round(Math.max(0, Math.min(100, 100 - risk)));
}

export function scoreLabel(score: number): { label: string; tone: "safe" | "caution" | "risk" | "danger" } {
  if (score >= 80) return { label: "Very Safe", tone: "safe" };
  if (score >= 65) return { label: "Mostly Safe", tone: "caution" };
  if (score >= 45) return { label: "Caution", tone: "risk" };
  return { label: "High Risk", tone: "danger" };
}

function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967295;
  };
}

// ----- Real Data Sources -----
// OFFLINE MODE: returns deterministic seeded mocks so the app runs in VS Code
// with zero API keys. To re-enable Open-Meteo + Overpass, restore the original
// fetchWeatherRisk / fetchOsmRisks implementations from version control.

export type RealBase = {
  weather: number;
  lighting: number;
  crowdDensity: number;
  essentialsNearby: number;
};

const baseCache = new Map<string, Promise<RealBase>>();

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

export function fetchRealBase(lat: number, lng: number): Promise<RealBase> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = baseCache.get(key);
  if (cached) return cached;
  const r = seededRand(key);
  const base: RealBase = {
    weather: Math.round(clamp(15 + r() * 45)),
    lighting: Math.round(clamp(20 + r() * 50)),
    crowdDensity: Math.round(clamp(30 + r() * 50)),
    essentialsNearby: Math.round(clamp(20 + r() * 55)),
  };
  const p = Promise.resolve(base);
  baseCache.set(key, p);
  return p;
}

// Sync function — replaces previous mockFactorsFor signature.
// `base` is optional; when provided (from fetchRealBase) the factors use real data.
export function mockFactorsFor(seed: string, hour = new Date().getHours(), base?: RealBase): SafetyFactors {
  const r = seededRand(seed);
  const isNight = hour < 6 || hour >= 20;
  const nightBoost = isNight ? 18 : 0;
  // Seed-derived (crime/accidents/traffic/road) — no public global API is reliable for these.
  const crime = clamp(20 + r() * 50 + nightBoost);
  const accidents = clamp(15 + r() * 55);
  const traffic = clamp(20 + r() * 70);
  const roadCondition = clamp(10 + r() * 60);
  // Real or fallback for the rest:
  const lighting = clamp((base?.lighting ?? 25) + (isNight ? 30 : 0));
  const weather = base?.weather ?? clamp(10 + r() * 50);
  const crowdDensity = clamp((base?.crowdDensity ?? 50) + (isNight ? 18 : 0));
  const essentialsNearby = base?.essentialsNearby ?? clamp(20 + r() * 50);
  return {
    crime: Math.round(crime),
    accidents: Math.round(accidents),
    traffic: Math.round(traffic),
    roadCondition: Math.round(roadCondition),
    lighting: Math.round(lighting),
    weather: Math.round(weather),
    crowdDensity: Math.round(crowdDensity),
    essentialsNearby: Math.round(essentialsNearby),
  };
}
