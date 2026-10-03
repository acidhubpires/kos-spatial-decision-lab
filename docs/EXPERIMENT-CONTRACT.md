# KOS Spatial Decision Benchmark — Experimental Contract

Phase 2 freezes the shared input before any inference architecture is introduced.

## Proposition

- Proposition ID: `tower-vivo-sp`
- Text: `The observed feature is a VIVO tower located in SP.`

The proposition is separate from `CanonicalSpatialState` and is identical for all fixtures.

## Frozen fixtures

| Fixture | State facts | Expected label |
|---|---|---|
| A | `operator = VIVO`, `uf = SP` | `SUPPORTED` |
| B | `operator = TIM`, `uf = SP` | `CONTRADICTED` |
| C | operator absent, `uf = SP` | `INSUFFICIENT` |

Each state preserves only the Evidence-derived source and point-feature fields identified in `docs/RECONNAISSANCE.md`: provider/service/layer, point geometry type and spatial reference, feature identity, operator, UF, optional municipality, and point coordinates. It contains no KOS governance, evidence, tenant, project, confidence, or decision fields.

## Contract and digest

`src/experiment-contract.ts` defines the minimal TypeScript contract, recursively key-sorted canonical JSON serialization, and SHA-256 digest. Arrays retain order and absent optional fields remain absent. The state digest is calculated over the canonical state only; it does not include the proposition or expected label.

`fixtures/manifest.json` records the proposition, expected label, and frozen digest for each fixture. The manifest is generated/verified from the typed fixtures by `src/manifest.ts`.

## Scope boundary

This phase contains no Laya, LLM, Ollama, Bedrock, KOS pipeline, ArcGIS call, AWS integration, benchmark loop, latency measurement, or inference code. The next phase may add architecture adapters that consume these exact frozen states and the separate proposition.
