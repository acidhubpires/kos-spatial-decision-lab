import type { CanonicalSpatialState, ExpectedLabel } from "./experiment-contract.js";

const SOURCE = {
  provider: "ESRI_ARCGIS_REST_FEATURE_SERVER",
  service: "Estacoes_RádioBase_2024",
  layerId: 0,
  geometryType: "esriGeometryPoint",
  spatialReference: { wkid: 3857, latestWkid: 3857 },
} as const;

const POINT = { x: -5337000, y: -2610000 } as const;

export const FIXTURE_A_SUPPORTED: CanonicalSpatialState = {
  source: SOURCE,
  features: [{ id: "ERB-BENCH-001", operator: "VIVO", uf: "SP", point: POINT }],
};

export const FIXTURE_B_CONTRADICTED: CanonicalSpatialState = {
  source: SOURCE,
  features: [{ id: "ERB-BENCH-001", operator: "TIM", uf: "SP", point: POINT }],
};

export const FIXTURE_C_INSUFFICIENT: CanonicalSpatialState = {
  source: SOURCE,
  features: [{ id: "ERB-BENCH-001", uf: "SP", point: POINT }],
};

export const FIXTURES = [
  { fixtureId: "A", state: FIXTURE_A_SUPPORTED, expectedLabel: "SUPPORTED" },
  { fixtureId: "B", state: FIXTURE_B_CONTRADICTED, expectedLabel: "CONTRADICTED" },
  { fixtureId: "C", state: FIXTURE_C_INSUFFICIENT, expectedLabel: "INSUFFICIENT" },
] as const satisfies readonly { fixtureId: string; state: CanonicalSpatialState; expectedLabel: ExpectedLabel }[];
