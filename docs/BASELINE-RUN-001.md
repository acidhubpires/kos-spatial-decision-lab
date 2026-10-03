# BASELINE_RUN_001

**Status:** PRELIMINARY — SINGLE RUN — NOT STATISTICALLY SIGNIFICANT

## Frozen proposition

> The observed feature is a VIVO tower located in SP.

## Fixture states

- **A — SUPPORTED:** `operator=VIVO`, `uf=SP`
- **B — CONTRADICTED:** `operator=TIM`, `uf=SP`
- **C — INSUFFICIENT:** `operator` absent, `uf=SP`

The expected result for B is `CONTRADICTED` because the proposition asserts that the observed feature is a VIVO tower, while the frozen state explicitly identifies the operator as TIM.

## First six observations

| Fixture | Architecture | Expected | Observed | Correct | Total ms | Inference ms | Governance ms | Tokens in/out | Provider | Authority |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| A | Pure Model | SUPPORTED | SUPPORTED | Yes | 13523.66 | 13523.31 | N/A | 221 / 7 | OLLAMA / qwen3.5:9b | N/A |
| A | KOS Governed | SUPPORTED | SUPPORTED | Yes | 6554.95 | 6554.63 | 0.17 | 221 / 7 | OLLAMA / qwen3.5:9b | HUMAN_REQUIRED |
| B | Pure Model | CONTRADICTED | INSUFFICIENT | No | 479.91 | 479.81 | N/A | 220 / 8 | OLLAMA / qwen3.5:9b | N/A |
| B | KOS Governed | CONTRADICTED | INSUFFICIENT | No | 494.50 | 494.30 | 0.11 | 220 / 8 | OLLAMA / qwen3.5:9b | HUMAN_REQUIRED |
| C | Pure Model | INSUFFICIENT | INSUFFICIENT | Yes | 657.78 | 657.67 | N/A | 216 / 8 | OLLAMA / qwen3.5:9b | N/A |
| C | KOS Governed | INSUFFICIENT | INSUFFICIENT | Yes | 0.26 | 0 | 0.15 | N/A | KOS_GOVERNED_POLICY | HUMAN_REQUIRED |

## Preliminary observations

1. In A, Pure Model and KOS Governed both produced the expected `SUPPORTED` result.
2. In B, both architectures returned `INSUFFICIENT` while the frozen expected result was `CONTRADICTED`. The failure is preserved without prompt tuning or fixture changes.
3. In C, Pure Model invoked qwen3.5:9b and correctly returned `INSUFFICIENT`.
4. In C, KOS Governed returned `INSUFFICIENT` without model inference because `operator` was absent from the observed evidence.
5. C therefore records `inferenceLatencyMs = 0`, no model tokens, and provider `KOS_GOVERNED_POLICY`.
6. Deterministic governance overhead in these first runs was sub-millisecond.
7. A Pure vs A KOS total latency must **not** be interpreted as an architectural performance comparison because sequential model loading, residency and prompt-cache state differed.
8. Governance does not imply correctness or model intelligence. It may, however, avoid unnecessary inference when sufficiency can be resolved deterministically.

## Frozen digests

- A: `f2eb88aaf448af926677d9f5fbb2d75a254698976560396928c38a13dc58d590`
- B: `fcea2962b3830decaafbedcb5c7eb3681316d6e3befa4016b4c528140e4938f9`
- C: `d6e1e74123ccf35480fefe7ee3c359e5b3da8989d94df28f2b54e2e671bc2583`
