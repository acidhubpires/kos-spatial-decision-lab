import { createHash } from "node:crypto";

export const PROPOSITION_ID = "tower-vivo-sp" as const;
export const PROPOSITION = "The observed feature is a VIVO tower located in SP." as const;

export type CanonicalSpatialState = {
  source: {
    provider: "ESRI_ARCGIS_REST_FEATURE_SERVER";
    service: "Estacoes_RádioBase_2024";
    layerId: 0;
    geometryType: "esriGeometryPoint";
    spatialReference: {
      wkid: number;
      latestWkid: number;
    };
  };
  features: readonly [CanonicalSpatialFeature];
};

export type CanonicalSpatialFeature = {
  id: string;
  operator?: string;
  uf: string;
  municipality?: string;
  point: {
    x: number;
    y: number;
  };
};

export type ExpectedLabel = "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort()
        .map((key) => [key, canonicalize(record[key])]),
    );
  }
  return value;
}

export function serializeCanonicalState(state: CanonicalSpatialState): string {
  return JSON.stringify(canonicalize(state));
}

export function digestCanonicalState(state: CanonicalSpatialState): string {
  return createHash("sha256").update(serializeCanonicalState(state), "utf8").digest("hex");
}
