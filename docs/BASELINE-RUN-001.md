# BASELINE_RUN_001

**PRELIMINARY — SINGLE RUN — NOT STATISTICALLY SIGNIFICANT.**

This document freezes the first valid observations currently available in the workspace/session record. Nothing was rerun. Prompts, fixtures, proposition text, expected labels, digests, and application behavior were not changed.

Measurements not present in the existing observation record are recorded as `null`/N/A. They are not reconstructed or estimated.

## Frozen proposition

`tower-vivo-sp`: “The observed feature is a VIVO tower located in SP.”

## Observations

### A — Pure Model

The observed qwen3.5:9b Ollama envelope produced `SUPPORTED`, matching the expected decision. The full recorded latency, byte, token, and provider telemetry are in `results/baseline-run-001.json`.

### A — KOS Governed

The observed decision was `SUPPORTED`, matching the expected decision. Only the decision-level observation is available in the current record; unobserved measurements remain N/A.

### B — Pure Model and KOS Governed

Fixture B differs from A only in the feature operator:

```diff
- "operator": "VIVO"
+ "operator": "TIM"
```

The UF remains `SP`, the feature identity remains `ERB-BENCH-001`, the point remains unchanged, and the state digest changes accordingly. The expected result is `CONTRADICTED` because the proposition specifically asserts a VIVO tower in SP while the observed operator is TIM.

The observed provider result was `INSUFFICIENT` for the recorded B observations. That failure is preserved exactly; it is not corrected to `CONTRADICTED`. Therefore `correct` is `false` against the frozen expected decision. Timing, byte, token, and provider telemetry fields were not available in the existing record and remain N/A.

### C — Pure Model

The observed qwen3.5:9b Pure Model decision was `INSUFFICIENT`, matching the expected decision. No complete measurement envelope is available in the existing record; missing fields remain N/A.

### C — KOS Governed

KOS Governed returned `INSUFFICIENT` without model inference because the required proposition evidence, `operator`, was absent. The recorded values are:

- `inferenceLatencyMs = 0`
- `inputTokens = N/A`
- `outputTokens = N/A`
- `provider = KOS_GOVERNED_POLICY`
- `authority = HUMAN_REQUIRED`
- `governanceLatencyMs ≈ 0.0964 ms`

The total recorded latency was approximately `0.2356 ms`, and the governance overhead in this deterministic policy path was sub-millisecond.

## Preliminary interpretation

1. A: Pure Model and KOS Governed both produced the expected `SUPPORTED` result.
2. B: the provider returned `INSUFFICIENT` while the frozen expected result was `CONTRADICTED`; this failure is preserved without reinterpretation.
3. C: Pure Model invoked qwen3.5:9b and correctly returned `INSUFFICIENT`.
4. C: KOS Governed returned `INSUFFICIENT` without model inference because `operator` was absent.
5. C KOS therefore recorded zero inference latency and no model token counts.
6. The current deterministic governance policy overhead was sub-millisecond.

These observations do not establish statistical significance. Do not compare A Pure Model versus A KOS Governed total latency as architectural performance: model load/cache/runtime state differs between sequential runs.

**Governance != Correctness.**  
**Governance != Model Intelligence.**  
**Governance may avoid unnecessary inference.**

## Exact canonical Fixture B state

```json
{
  "source": {
    "provider": "ESRI_ARCGIS_REST_FEATURE_SERVER",
    "service": "Estacoes_RádioBase_2024",
    "layerId": 0,
    "geometryType": "esriGeometryPoint",
    "spatialReference": { "wkid": 3857, "latestWkid": 3857 }
  },
  "features": [
    {
      "id": "ERB-BENCH-001",
      "operator": "TIM",
      "uf": "SP",
      "point": { "x": -5337000, "y": -2610000 }
    }
  ]
}
```

Fixture B digest: `fcea2962b3830decaafbedcb5c7eb3681316d6e3befa4016b4c528140e4938f9`.
