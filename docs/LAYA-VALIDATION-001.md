# Laya Validation 001

## Classification

FUNCTIONAL VALIDATION — SINGLE RUN — NOT STATISTICALLY SIGNIFICANT.

This validation uses the general English `convaiinnovations/laya` checkpoint through the actual local `laya-ts` ONNX implementation. It is a separate artifact and does not modify or replace `BASELINE_RUN_001`.

## Environment

- `laya-ts@0.1.0`, built locally from the read-only upstream source.
- Module: `D:\AI\sandbox\running\kos-spatial-decision-benchmark\.runtime\laya-ts\dist\index.js`.
- Model: general English `convaiinnovations/laya`, exported with the upstream `laya-ts/scripts/export_onnx.py` procedure.
- Model directory: `D:\AI\sandbox\running\kos-spatial-decision-benchmark\.runtime\models\laya`.
- Device: CPU.
- Reference repository commit: `2e4d9c87e8b1621deb344eac7de5c7258f32f849`.
- Node ONNX runtime: `onnxruntime-node@1.30.0`.
- Required artifacts verified: `rl_agent_config.json`, `tokenizer.json`, `encoder.onnx`, `encoder.onnx.data`, `head.onnx`, and `head.onnx.data`.
- The benchmark adapter uses `Agent.load(modelDir, { device })` and `agent.predict(state, questions)`.

## Frozen Contract

The proposition and fixtures were not changed:

`The observed feature is a VIVO tower located in SP.`

- A: `operator = VIVO`, `uf = SP`, expected `SUPPORTED`, digest `f2eb88aaf448af926677d9f5fbb2d75a254698976560396928c38a13dc58d590`.
- B: `operator = TIM`, `uf = SP`, expected `CONTRADICTED`, digest `fcea2962b3830decaafbedcb5c7eb3681316d6e3befa4016b4c528140e4938f9`.
- C: operator absent, `uf = SP`, expected `INSUFFICIENT`, digest `d6e1e74123ccf35480fefe7ee3c359e5b3da8989d94df28f2b54e2e671bc2583`.

## Functional Results

| Fixture | Status | Decision | Expected | Correct | Confidence | Input tokens | Output tokens | Total latency ms | Inference latency ms |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| A | COMPLETED | CONTRADICTED | SUPPORTED | NO | 0.0608 | 190 | 0 | 5434.7883 | 5434.0165 |
| B | COMPLETED | CONTRADICTED | CONTRADICTED | YES | 0.0531 | 188 | 0 | 4245.7493 | 4245.1124 |
| C | COMPLETED | CONTRADICTED | INSUFFICIENT | NO | 0.0747 | 182 | 0 | 5161.7933 | 5161.3314 |

The complete machine-readable records, including probabilities, byte sizes, provider, model path, state digests, and raw Laya usage, are in [`results/laya-validation-001.json`](../results/laya-validation-001.json).

Laya is non-autoregressive. `outputTokens = 0` is preserved exactly as reported by `laya-ts`; it is not interpreted as zero computation or as equivalent to generative-model output-token cost.

The A result is a valid experimental observation but is incorrect against the frozen expected label. No retry, prompt tuning, fixture change, or interpretation was applied. B and C were run because A completed at runtime.

## Validation Scope and Limitations

- This is one run per fixture and is not statistically significant.
- It is a functional readiness test, not a three-architecture scientific comparison.
- Confidence and probabilities are provider outputs, not correctness measures.
- Model load and CPU runtime conditions dominate these single-run latency measurements.
- The general English checkpoint was used as requested; `laya-typed-decisions` was not used.
- The runtime/model files are local ignored artifacts and are not committed.

## Validation Status

LAYA_SETUP: PASS
LAYA_MODULE_BUILD: PASS
LAYA_MODEL_ARTIFACTS: PASS
LAYA_RUNTIME: PASS

LAYA_A_STATUS: COMPLETED
LAYA_A_DECISION: CONTRADICTED
LAYA_A_CORRECT: NO

LAYA_B_STATUS: COMPLETED
LAYA_B_DECISION: CONTRADICTED
LAYA_B_CORRECT: YES

LAYA_C_STATUS: COMPLETED
LAYA_C_DECISION: CONTRADICTED
LAYA_C_CORRECT: NO
