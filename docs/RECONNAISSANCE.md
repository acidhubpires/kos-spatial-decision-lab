# KOS Spatial Decision Benchmark — Phase 1 Reconnaissance

Inspection date: 2026-10-03

Reference repository snapshots:

- `kos-evidence-platform`: `6313253d31de679225ea6978be99ceadd2fd7056`
- `laya`: `2e4d9c87e8b1621deb344eac7de5c7258f32f849`

The Evidence repository was already dirty when inspected. The Laya repository was clean. Neither repository was modified.

# 1. Evidence Tower Use Case

The existing use case is a read-only Brazilian mobile-base-station/tower layer named `Estacoes_RádioBase_2024`, ArcGIS FeatureServer layer 0.

Primary files and mechanisms:

- `packages/adapters-aws/src/arcgis-spatial-adapter.ts`
  - Defines the default FeatureServer query endpoint.
  - Implements `ArcGisRestSpatialAdapter.executeQuery()` for `spatial.query`.
  - Uses ArcGIS OAuth client credentials, normally resolved from AWS Secrets Manager.
  - Enforces a query-only, read-only boundary and caps `resultRecordCount` at 100.
  - Returns a `SpatialOperationResult` containing provider, endpoint, feature count, geometry type, spatial reference, returned features, source identities, query time, and a SHA-256 digest of the raw response.
  - Also implements `executeIntersection()` against the ArcGIS GeometryServer, but that is a separate capability and is not required for the smallest tower case.
- `packages/domain/src/spatial-capability.ts`
  - Defines `SpatialCapabilityRequest`, `SpatialOperationResult`, and `SpatialObservation`.
  - Requires the authority ceiling `OBSERVATION`; it explicitly separates provider output, spatial observation, evidence, and compliance decision.
  - Provides the candidate, qualification, and contextual-admissibility functions used after observation creation.
- `scripts/run-sprint01-physical-proof.mjs`
  - Performs the live query against `Estacoes_RádioBase_2024/FeatureServer/0/query` with `where=1=1`, `outFields=*`, `resultRecordCount=5`, and `returnGeometry=true`.
  - Shows the actual response facts used by the proof: feature count, `esriGeometryPoint`, WKID/latestWkid, raw-response digest, and sample attributes `Código`, `Operadora`, and `UF`.
  - Constructs a `SPATIAL_OBSERVATION`, submits it to `/projects/{projectId}/spatial/admit`, and verifies candidate, qualification, admissibility, `EvidenceRecord`, and chronicle output.
- `scripts/run-spatial-map-surface-physical-proof.mjs`
  - Verifies the map-facing feature contract and logs `Código`, `Operadora`, `UF`, `Município`, and point geometry.
- `apps/evidence-console/src/components/ProjectSpatialMapSurface.tsx`
  - Displays the provider features and governed spatial basis in the ArcGIS map surface. This is presentation, not the benchmark decision mechanism.
- `packages/adapters-aws/test/arcgis-oauth-query.test.ts`
  - Supplies deterministic mocked feature examples with attributes `FID`, `Código`, `Operadora`, `UF` and point `{x,y}` geometry.
- `docs/kem/KOS_EVIDENCE_MAP_SURFACE_2026_09_20.md`
  - Documents the map route and the intended separation `SpatialObservation → EvidenceCandidate → Qualification → ContextualAdmissibility → EvidenceRecord → ProjectKnowledgeContext`.

The source repository does not contain a committed raw ArcGIS tower response fixture. The production-shaped sample is live-provider data; deterministic tests use synthetic mocked ArcGIS responses.

# 2. Existing Spatial Pipeline

```text
ArcGIS FeatureServer layer 0
  Estacoes_RádioBase_2024
  (OAuth; POST /query; where/outFields/limit/geometry)
        |
        v
ArcGisRestSpatialAdapter.executeQuery()
        |
        v
SpatialOperationResult
  features / featuresCount / geometryType / spatialReference
  sourceFeatureIdentities / queriedAt / rawResponseDigest
  authorityCeiling = OBSERVATION
        |
        v
createSpatialObservation()
  kind = SPATIAL_OBSERVATION
        |
        v
createSpatialCandidate()
        |
        v
qualifySpatialObservation()
  EvidenceRecord claimType = SPATIAL_OBSERVATION
        |
        v
evaluateSpatialAdmissibility()
  ADMISSIBLE / NOT_ADMISSIBLE / INSUFFICIENT_CONTEXT
        |
        v
ProjectKnowledgeContext / map projection
```

The spatial query itself does not decide tower suitability, compliance, risk, or truth of a business proposition. The post-query domain logic validates custody, authority ceiling, tenant/project binding, purpose, subject, and admissibility. A tower-specific proposition or rule was not found in this spatial path.

Other spatial operation found: `spatial.intersection` posts polygon geometries to the ArcGIS GeometryServer and reduces the response to `intersects` plus optional intersection geometry. It is not needed for the minimal point-feature benchmark unless the proposition is explicitly about polygon intersection.

# 3. Minimal Reproducible Spatial Case

The smallest useful independent case is one deterministic point feature representing one base station:

1. Use the mocked ArcGIS response shape already exercised in `packages/adapters-aws/test/arcgis-oauth-query.test.ts`.
2. Keep one feature with `attributes` containing `Código`, `Operadora`, and `UF` (optionally `Município`), and `geometry` containing point `x` and `y`.
3. Preserve the response-level `geometryType: "esriGeometryPoint"` and a declared spatial reference such as WKID 3857/4326, rather than querying ArcGIS during benchmark runs.
4. Compute the same canonical digest over the canonicalized source response for every architecture.
5. Evaluate one explicit proposition over that state, for example: “Is the observed feature a VIVO tower in the target UF?” The proposition must be fixed before runs and must not be inferred from confidence.

This case exercises the actual Evidence-derived feature shape while removing OAuth, AWS Secrets Manager, network variance, ArcGIS availability, map rendering, DynamoDB, Lambda, and the Evidence admission service. A second paired case can change only one proposition-relevant attribute or remove the feature to test evidence sensitivity.

# 4. Proposed CanonicalSpatialState

This is deliberately limited to fields observed in the existing map/proof/tests. It is a draft benchmark interchange state, not an Evidence domain object and not a copy of `SpatialObservation`.

```json
{
  "source": {
    "provider": "ESRI_ARCGIS_REST_FEATURE_SERVER",
    "service": "Estacoes_RádioBase_2024",
    "layerId": 0,
    "geometryType": "esriGeometryPoint",
    "spatialReference": { "wkid": 3857, "latestWkid": 3857 },
    "rawResponseDigest": "sha256-of-canonical-source-response"
  },
  "features": [
    {
      "id": "Código-from-ArcGIS",
      "operator": "VIVO",
      "uf": "SP",
      "municipality": "observed-Município-if-present",
      "point": { "x": 0, "y": 0 }
    }
  ]
}
```

`municipality` may be omitted when absent. The benchmark should not add tenant, project, evidence IDs, qualification status, confidence, or decision fields to this shared state: those are architecture-specific or governance outputs. The proposition should be supplied separately and identically to A, B, and C.

# 5. Laya Integration Findings

### TypeScript integration path

The supported TypeScript API is in `laya/laya-ts`:

```ts
import { Agent } from "laya-ts";

const agent = await Agent.load("./model");
const result = await agent.predict(canonicalSpatialState, {
  tower_proposition: {
    type: "noul",
    instructions: "Is the explicit proposition true for this spatial state?"
  }
});
```

`Agent.load()` accepts a local exported model directory, a Hub repository, or a URL. It lazily creates the Node ONNX provider; `onnxruntime-node` is an optional dependency. The package is ESM-only and exports `Agent`, question types, providers, hooks, and `decide()` from `laya-ts/src/index.ts`. The local model directory must contain the exported ONNX encoder/head, tokenizer, and `rl_agent_config.json`; the README documents `laya-ts/scripts/export_onnx.py` as the export route.

The `decide()` helper can project a JSON schema into Laya’s fixed typed questions, but a single `noul` question is the smallest direct experiment. A choice question is preferable if the benchmark wants an explicit `yes`/`no` output label and probabilities.

### Inference, checkpoint, and measurements

- `laya-ts` performs inference locally through split ONNX `encoder.onnx` and `head.onnx`; it does not call a remote Laya runtime/service when given local model artifacts.
- The Python package metadata at this snapshot is `laya` version `0.3.26`, Python `>=3.10`.
- `laya-ts/package.json` is version `0.1.0` and has optional `onnxruntime-node`/`onnxruntime-web` dependencies.
- The typed-decision golden metadata records `laya_version: 0.3.24`, encoder `answerdotai/ModernBERT-large`, `max_len: 1024`, and model name `laya-typed-decisions`. This is artifact metadata, not evidence that the current workspace has the checkpoint files.
- The README describes three checkpoints: `laya` (English, ModernBERT-large, 421M, 512-token context), `laya-multilingual` (mmBERT-base, 322M, 1024-token context), and `laya-typed-decisions` (ModernBERT-large, 421M, 1024-token context).
- For this arbitrary spatial proposition, the general English `laya` checkpoint is the most defensible small local starting point. `laya-typed-decisions` is specialized to four fixed training workflows and question-ID signatures (`invoice_processing`, `customer_service`, `security_incidents`, and `agent_trace_observability`); it should not be treated as a general spatial competence model. Use it only as a separately labeled specialist condition if the benchmark intentionally adopts one of those schemas.
- `PredictContext.elapsedMs` is measured internally with `performance.now()` (falling back to `Date.now()`) and exposed to hooks. A benchmark can install an `onPredictStart`/`onPredictEnd` hook or wrap `await agent.predict()` with an external monotonic timer. The timer must distinguish cold `Agent.load()` plus first inference from warm inference.
- Laya returns `usage.input_tokens`, based on the tokenizer-rendered decision input, and `usage.output_tokens`. In `laya-ts/src/agent.ts`, inference records `input_tokens: built[s].nTokens` and `output_tokens: 0`; this is a non-autoregressive encoder/head model, not generated text. Input token counts are meaningful for comparing input serialization within Laya and against a defined generative prompt tokenizer, but Laya output-token counts are not equivalent to generative output tokens and should be reported as not applicable/zero rather than used as a cost proxy.
- Directly measurable Laya outputs include typed answer, probabilities, `confidence`, `answer_confidence`, `action.act_probability`, truncation fields, and usage. None establishes correctness; correctness must be scored against the predeclared proposition label.

Important limitations:

- `laya-typed-decisions`’s training-task specialization may confound architecture comparison with task/schema familiarity.
- Local ONNX inference has model-load, provider, device, thread, and cache effects. Report cold and warm latency separately and fix device/thread settings.
- Laya’s typed output prevents text parsing errors but does not guarantee decision competence.
- Confidence and action probability are model reports, not correctness labels.
- JSON serialization length, tokenizer input tokens, and autoregressive output tokens are different measurements and must not be conflated.

# 6. Experimental Boundary

Outside this independent benchmark:

- live ArcGIS calls, OAuth credentials, AWS Secrets Manager, AWS Lambda, API Gateway, DynamoDB, CloudFront, ArcGIS map rendering, and network latency;
- the Evidence repository’s admission endpoint, `EvidenceCandidate`, `EvidenceRecord`, `ProjectKnowledgeContext`, chronicle events, and production decision handlers;
- importing or depending on Evidence packages at benchmark runtime;
- changing or installing into either reference repository;
- reusing Evidence’s production tenant/project identifiers, secrets, deployment state, or mutable records;
- treating the Evidence post-query admission result as the benchmark’s ground-truth decision;
- using confidence, typed validity, or output formatting as a substitute for proposition correctness.

The benchmark should copy only the minimal, canonicalized observation fixture and the explicit proposition into its own workspace. KOS can later be represented as a standalone governed pipeline that reproduces the relevant authority/evidence checks without executing Evidence.

# 7. Proposed Next Step

Implement only the independent fixture and contract layer: one canonical JSON fixture containing one ArcGIS-shaped point feature, one paired proposition label, and a deterministic canonicalization/digest function. Add no model runner yet. Validate that the same bytes, proposition text, feature identity, and expected label can be handed to three future adapters. This is the smallest step that fixes the experimental input before latency, token, or architecture measurements are introduced.

FILES_CREATED

- `docs/RECONNAISSANCE.md`

FILES_MODIFIED

- None

EVIDENCE_REPO_CHANGED: NO

LAYA_REPO_CHANGED: NO

KEY_FINDING

Evidence supplies a real, reproducible tower observation shape and a governed post-observation promotion path, but it does not supply a tower decision proposition. Laya supplies local typed inference and useful input/latency telemetry, but its non-autoregressive `output_tokens` field is not comparable to generated-model output tokens.

NEXT_RECOMMENDED_STEP

Freeze one Evidence-derived canonical point-feature fixture plus one explicit proposition and label inside this benchmark workspace.
