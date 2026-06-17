import{j as e}from"./index-BoykkW4Y.js";import{S as s}from"./SiteHeader-CICznEH5.js";function i(){return e.jsxs("div",{className:"min-h-screen",children:[e.jsx(s,{}),e.jsxs("article",{className:"mx-auto max-w-3xl px-6 py-16",children:[e.jsx("div",{className:"font-mono text-[11px] uppercase tracking-[0.2em] text-primary",children:"How it works"}),e.jsx("h1",{className:"mt-2 font-display text-5xl font-bold tracking-tight",children:"The Safety Score, explained."}),e.jsx("p",{className:"mt-6 text-lg text-muted-foreground",children:"Aegis Route is a navigation system that ranks every road segment in the world by safety, not just by speed. Every route gets a 0–100 score derived from eight live signals."}),e.jsxs("section",{className:"mt-12 space-y-4",children:[e.jsx("h2",{className:"font-display text-2xl font-bold",children:"The model"}),e.jsx("pre",{className:"overflow-x-auto rounded-2xl border border-border bg-card/60 p-5 font-mono text-xs leading-relaxed text-muted-foreground",children:`Safety Score = 100 − Σ ( wᵢ × riskᵢ )

riskᵢ ∈ {
  crime, accidents, traffic, road_condition,
  lighting, weather, crowd_density, essentials_nearby
}

Default weights:
  crime         0.22    lighting     0.12
  accidents     0.16    weather      0.10
  traffic       0.10    crowd        0.10
  road          0.10    essentials   0.10

Personalization (additive):
  night_mode      → +lighting +crime
  avoid_isolated  → +crowd +essentials
  prefer_crowded  → +crowd`})]}),e.jsxs("section",{className:"mt-12 space-y-4",children:[e.jsx("h2",{className:"font-display text-2xl font-bold",children:"Roadmap"}),e.jsx("div",{className:"grid gap-3",children:[{phase:"Phase 1 · MVP",body:"Global routing via OpenStreetMap + OSRM, mock-weighted safety scoring, community incident reports, saved routes."},{phase:"Phase 2",body:"Live data pipelines: crime open-data, weather APIs, traffic APIs. ML re-routing."},{phase:"Phase 3",body:"Worldwide real-time scoring, behavioral personalization, fleet & enterprise APIs."}].map(t=>e.jsxs("div",{className:"rounded-2xl border border-border bg-card/60 p-5",children:[e.jsx("div",{className:"font-mono text-[10px] uppercase tracking-[0.18em] text-primary",children:t.phase}),e.jsx("div",{className:"mt-1 text-sm text-muted-foreground",children:t.body})]},t.phase))})]})]})]})}export{i as component};
