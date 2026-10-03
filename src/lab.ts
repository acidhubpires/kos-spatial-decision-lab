import { digestCanonicalState, PROPOSITION, PROPOSITION_ID, serializeCanonicalState, type CanonicalSpatialState, type ExpectedLabel } from "./experiment-contract.js";
import { FIXTURES } from "./fixtures.js";
import { pathToFileURL } from "node:url";

export type Architecture = "PURE_MODEL" | "LAYA" | "KOS_GOVERNED";
export type LabStatus = "COMPLETED" | "NOT_CONFIGURED" | "RUNTIME_ERROR" | "INVALID_OUTPUT";

export type CommonResult = {
  architecture: Architecture;
  status: LabStatus;
  fixtureId: string;
  propositionId: string;
  stateDigest: string;
  decision: ExpectedLabel | null;
  expectedDecision: ExpectedLabel;
  correct: boolean | null;
  confidence?: number;
  probabilities?: Record<string, number>;
  metrics: {
    totalLatencyMs: number;
    inferenceLatencyMs?: number;
    governanceLatencyMs?: number;
    inputBytes: number;
    outputBytes: number;
    inputTokens?: number | null;
    outputTokens?: number | null;
  };
  trace?: unknown;
  authority?: string | null;
  provider: string;
  model?: string;
  message?: string;
  raw?: unknown;
  providerMetrics?: Record<string, number>;
  timestamp: string;
};

type Fixture = (typeof FIXTURES)[number];
type ProviderResult = {
  status: LabStatus;
  decision: ExpectedLabel | null;
  confidence?: number;
  probabilities?: Record<string, number>;
  inputTokens?: number | null;
  outputTokens?: number | null;
  inferenceLatencyMs: number;
  provider: string;
  model?: string;
  message?: string;
  raw?: unknown;
  providerMetrics?: Record<string, number>;
};

const LABELS: ExpectedLabel[] = ["SUPPORTED", "CONTRADICTED", "INSUFFICIENT"];
export const PURE_MODEL_GENERATION_LIMIT = 32;
export const PURE_MODEL_TIMEOUT_MS = Number(process.env.PURE_MODEL_TIMEOUT_MS ?? 30000);
export const PURE_MODEL_DECISION_SCHEMA = {
  type: "object",
  properties: { decision: { type: "string", enum: LABELS } },
  required: ["decision"],
  additionalProperties: false,
} as const;
const now = () => globalThis.performance?.now?.() ?? Date.now();
const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value), "utf8");

function makeResult(fixture: Fixture, architecture: Architecture, provider: ProviderResult, extra: Omit<Partial<CommonResult>, "metrics"> & { metrics?: Partial<CommonResult["metrics"]> } = {}): CommonResult {
  const stateDigest = digestCanonicalState(fixture.state);
  const output = { decision: provider.decision, confidence: provider.confidence, probabilities: provider.probabilities, trace: extra.trace, authority: extra.authority };
  return {
    architecture,
    status: provider.status,
    fixtureId: fixture.fixtureId,
    propositionId: PROPOSITION_ID,
    stateDigest,
    decision: provider.decision,
    expectedDecision: fixture.expectedLabel,
    correct: provider.decision === null ? null : provider.decision === fixture.expectedLabel,
    ...(provider.confidence === undefined ? {} : { confidence: provider.confidence }),
    ...(provider.probabilities === undefined ? {} : { probabilities: provider.probabilities }),
    metrics: {
      totalLatencyMs: 0,
      inferenceLatencyMs: provider.inferenceLatencyMs,
      ...(extra.metrics?.governanceLatencyMs === undefined ? {} : { governanceLatencyMs: extra.metrics.governanceLatencyMs }),
      inputBytes: bytes({ state: fixture.state, propositionId: PROPOSITION_ID, proposition: PROPOSITION }),
      outputBytes: bytes(output),
      ...(provider.inputTokens === undefined ? {} : { inputTokens: provider.inputTokens }),
      ...(provider.outputTokens === undefined ? {} : { outputTokens: provider.outputTokens }),
    },
    ...(extra.trace === undefined ? {} : { trace: extra.trace }),
    ...(extra.authority === undefined ? {} : { authority: extra.authority }),
    provider: provider.provider,
    ...(provider.model === undefined ? {} : { model: provider.model }),
    ...(provider.message === undefined ? {} : { message: provider.message }),
    ...(provider.raw === undefined ? {} : { raw: provider.raw }),
    ...(provider.providerMetrics === undefined ? {} : { providerMetrics: provider.providerMetrics }),
    timestamp: new Date().toISOString(),
  };
}

function finish(result: CommonResult, started: number): CommonResult {
  return { ...result, metrics: { ...result.metrics, totalLatencyMs: Math.max(0, now() - started) } };
}

function notConfigured(provider: string, message: string, inferenceLatencyMs = 0, raw?: unknown): ProviderResult {
  return { status: "NOT_CONFIGURED", decision: null, inferenceLatencyMs, provider, message, ...(raw === undefined ? {} : { raw }) };
}

function runtimeError(provider: string, message: string, inferenceLatencyMs: number, raw?: unknown, model?: string): ProviderResult {
  return { status: "RUNTIME_ERROR", decision: null, inferenceLatencyMs, provider, message, ...(raw === undefined ? {} : { raw }), ...(model === undefined ? {} : { model }) };
}

function normalize(value: unknown): ExpectedLabel | null {
  const text = String(value ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  return LABELS.includes(text as ExpectedLabel) ? text as ExpectedLabel : null;
}

export function parseModelJson(raw: unknown): { decision: ExpectedLabel | null } {
  let value: any = raw;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { value = {}; }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { decision: null };
  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== "decision") return { decision: null };
  return { decision: normalize(value.decision) };
}

function promptFor(state: CanonicalSpatialState): string {
  return [
    "Classify the explicit proposition using only the supplied CanonicalSpatialState.",
    "Do not use external knowledge. Do not invent evidence.",
    `Proposition: ${PROPOSITION}`,
    "Allowed labels: SUPPORTED, CONTRADICTED, INSUFFICIENT.",
    "Use INSUFFICIENT when the supplied state lacks a required fact.",
    `CanonicalSpatialState: ${serializeCanonicalState(state)}`,
    'Return JSON only: {"decision":"SUPPORTED|CONTRADICTED|INSUFFICIENT","confidence":0..1}.',
  ].join("\n");
}

export async function pureProvider(state: CanonicalSpatialState): Promise<ProviderResult> {
  const started = now();
  const endpoint = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
  let model = process.env.PURE_MODEL;
  const controller = new AbortController();
  const timeoutMs = Number(process.env.PURE_MODEL_TIMEOUT_MS ?? PURE_MODEL_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    if (!model) {
      const tags = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
      const tagText = await tags.text();
      let data: { models?: { name?: string }[] } = {};
      try { data = JSON.parse(tagText) as { models?: { name?: string }[] }; } catch { /* runtime error below */ }
      if (!tags.ok) return runtimeError("OLLAMA", `Ollama /api/tags returned HTTP ${tags.status}`, now() - started, data);
      model = data.models?.find((item) => item.name)?.name;
    }
    if (!model) return notConfigured("OLLAMA", "No Ollama model found. Set PURE_MODEL.", now() - started);
    const response = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt: promptFor(state),
        stream: false,
        format: PURE_MODEL_DECISION_SCHEMA,
        think: false,
        options: { temperature: 0, num_predict: PURE_MODEL_GENERATION_LIMIT },
      }),
    });
    const responseText = await response.text();
    let data: any = {};
    try { data = JSON.parse(responseText); } catch { data = { rawResponse: responseText }; }
    const providerMetrics = ["prompt_eval_count", "eval_count", "prompt_eval_duration", "eval_duration", "load_duration", "total_duration"]
      .filter((key) => typeof data[key] === "number")
      .reduce<Record<string, number>>((metrics, key) => { metrics[key] = data[key]; return metrics; }, {});
    if (!response.ok) return runtimeError("OLLAMA", `Ollama /api/generate returned HTTP ${response.status}`, now() - started, data, model);
    const parsed = parseModelJson(data.response);
    if (!parsed.decision) return { status: "INVALID_OUTPUT", decision: null, inferenceLatencyMs: now() - started, provider: "OLLAMA", model, raw: data, providerMetrics, message: "Ollama output did not satisfy the exact decision contract." };
    return {
      status: "COMPLETED",
      ...parsed,
      inferenceLatencyMs: now() - started,
      inputTokens: typeof data.prompt_eval_count === "number" ? data.prompt_eval_count : null,
      outputTokens: typeof data.eval_count === "number" ? data.eval_count : null,
      provider: "OLLAMA",
      model,
      raw: data,
      providerMetrics,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return runtimeError("OLLAMA", `Ollama request timed out after ${timeoutMs} ms`, now() - started, { error: "TIMEOUT", timeoutMs }, model);
    return runtimeError("OLLAMA", `Ollama request failed: ${error instanceof Error ? error.message : String(error)}`, now() - started, { error: String(error) }, model);
  } finally {
    clearTimeout(timeout);
  }
}

export async function runPureModel(fixture: Fixture): Promise<CommonResult> {
  const started = now();
  return finish(makeResult(fixture, "PURE_MODEL", await pureProvider(fixture.state)), started);
}

export async function runLaya(fixture: Fixture): Promise<CommonResult> {
  const started = now();
  const modelDir = process.env.LAYA_MODEL_DIR;
  const modulePath = process.env.LAYA_TS_MODULE;
  if (!modelDir || !modulePath) {
    return finish(makeResult(fixture, "LAYA", notConfigured("LAYA_TS", "Set LAYA_MODEL_DIR and LAYA_TS_MODULE to enable local laya-ts ONNX inference.")), started);
  }
  const inferenceStarted = now();
  try {
    const module = await import(pathToFileURL(modulePath).href);
    const agent = await module.Agent.load(modelDir, { device: process.env.LAYA_DEVICE ?? "cpu" });
    const result = await agent.predict(fixture.state, {
      spatial_decision: {
        type: "choice",
        instructions: PROPOSITION,
        criteria: {
          SUPPORTED: "The proposition is supported by the supplied state.",
          CONTRADICTED: "The proposition is contradicted by the supplied state.",
          INSUFFICIENT: "The state lacks enough evidence to evaluate the proposition.",
        },
      },
    });
    const answer = result.answers?.spatial_decision;
    const decision = normalize(answer?.choice);
    const provider: ProviderResult = {
      status: decision ? "COMPLETED" : "INVALID_OUTPUT",
      decision,
      confidence: typeof answer?.confidence === "number" ? answer.confidence : undefined,
      probabilities: answer?.probabilities,
      inputTokens: result.usage?.input_tokens ?? null,
      outputTokens: result.usage?.output_tokens ?? null,
      inferenceLatencyMs: now() - inferenceStarted,
      provider: "LAYA_TS_ONNX",
      model: modelDir,
      raw: result,
      ...(decision ? {} : { message: "Laya returned no supported typed decision." }),
    };
    return finish(makeResult(fixture, "LAYA", provider), started);
  } catch (error) {
    return finish(makeResult(fixture, "LAYA", { ...runtimeError("LAYA_TS_ONNX", `Laya execution failed: ${error instanceof Error ? error.message : String(error)}`, now() - inferenceStarted, { error: String(error) }, modelDir), model: modelDir }), started);
  }
}

function evidenceSufficiency(state: CanonicalSpatialState): { sufficient: boolean; reason: string } {
  const feature = state.features[0];
  if (!feature.operator) return { sufficient: false, reason: "operator is absent from the observed feature" };
  if (!feature.uf) return { sufficient: false, reason: "uf is absent from the observed feature" };
  return { sufficient: true, reason: "operator and uf are present" };
}

export async function runKosGoverned(fixture: Fixture): Promise<CommonResult> {
  const started = now();
  const governanceStarted = now();
  const stateDigest = digestCanonicalState(fixture.state);
  const observation = { kind: "SPATIAL_OBSERVATION", observationId: `OBS-BENCH-${fixture.fixtureId}-${stateDigest.slice(0, 12)}`, stateDigest, source: fixture.state.source, features: fixture.state.features };
  const evidence = { evidenceId: `EVIDENCE-BENCH-${fixture.fixtureId}`, claimType: "SPATIAL_OBSERVATION", sourceObservationId: observation.observationId, stateDigest };
  const sufficiency = evidenceSufficiency(fixture.state);
  let evaluation: unknown;
  let provider: ProviderResult;
  if (!sufficiency.sufficient) {
    evaluation = { outcome: "INSUFFICIENT", reason: sufficiency.reason };
    provider = { status: "COMPLETED", decision: "INSUFFICIENT", inferenceLatencyMs: 0, provider: "KOS_GOVERNED_POLICY" };
  } else {
    const modelResult = await pureProvider(fixture.state);
    provider = modelResult;
    evaluation = { outcome: modelResult.decision ?? "UNRESOLVED", source: modelResult.provider, model: modelResult.model };
  }
  const finding = { findingId: `FINDING-BENCH-${fixture.fixtureId}`, propositionId: PROPOSITION_ID, evaluation };
  const authority = "HUMAN_REQUIRED";
  const governanceLatencyMs = Math.max(0, now() - governanceStarted - provider.inferenceLatencyMs);
  const trace = { observation, evidence, proposition: { propositionId: PROPOSITION_ID, text: PROPOSITION }, evaluation, finding, authority };
  return finish(makeResult(fixture, "KOS_GOVERNED", provider, { trace, authority, metrics: { governanceLatencyMs } }), started);
}

export function fixtureById(id: string): Fixture | undefined {
  return FIXTURES.find((fixture) => fixture.fixtureId === id);
}
