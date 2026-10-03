# KOS Spatial Decision Lab — Session Freeze — 2026-10-03

## Experimental State

All three architectures are now functionally executable against the same frozen spatial state and proposition:

- Pure Model
- Laya
- KOS Governed

This is a session record of manual functional observations, not a statistical benchmark.

## Frozen Contract

Proposition:

`The observed feature is a VIVO tower located in SP.`

Fixture A:

- `operator = VIVO`
- `uf = SP`
- expected: `SUPPORTED`
- digest: `f2eb88aaf448af926677d9f5fbb2d75a254698976560396928c38a13dc58d590`

Fixture B:

- `operator = TIM`
- `uf = SP`
- expected: `CONTRADICTED`
- digest: `fcea2962b3830decaafbedcb5c7eb3681316d6e3befa4016b4c528140e4938f9`

Fixture C:

- operator absent
- `uf = SP`
- expected: `INSUFFICIENT`
- digest: `d6e1e74123ccf35480fefe7ee3c359e5b3da8989d94df28f2b54e2e671bc2583`

The proposition, fixture states, expected labels, canonicalization, and SHA-256 digests were not changed. `BASELINE_RUN_001` remains a separate historical artifact and was not merged with these observations.

## Manual Functional Observation

These are manual functional observations. They are not statistically significant benchmark results.

| Fixture | Expected | Pure Model | Laya | KOS Governed |
|---|---|---|---|---|
| A | SUPPORTED | SUPPORTED — correct | CONTRADICTED — incorrect | SUPPORTED — correct |
| B | CONTRADICTED | INSUFFICIENT — incorrect | CONTRADICTED — correct | INSUFFICIENT — incorrect |
| C | INSUFFICIENT | INSUFFICIENT — correct | CONTRADICTED — incorrect | INSUFFICIENT — correct |

No new inference was run for this session freeze. The entries above preserve the manually observed results already available in the session record.

## Fixture C Governance Observation

For Fixture C, KOS Governed recorded:

- `decision = INSUFFICIENT`
- `provider = KOS_GOVERNED_POLICY`
- `inferenceLatencyMs = 0`
- `authority = HUMAN_REQUIRED`
- reason: `operator is absent from the observed feature`

This demonstrates that the governed architecture can terminate deterministically when required evidence is absent, avoiding model inference for this case.

This does not claim that KOS is faster than Laya or qwen, more intelligent, or generally more accurate. Governance does not improve model intelligence.

**Governance != Correctness**  
**Governance != Model Intelligence**  
**Governance may avoid unnecessary inference.**

## Laya Observation

Laya executed successfully in all three cases and returned:

- A → `CONTRADICTED`
- B → `CONTRADICTED`
- C → `CONTRADICTED`

Laya reported `outputTokens = 0`. This is expected for the non-autoregressive encoder/head architecture and must not be interpreted as zero computation or as generative-token equivalence.

The invariant `CONTRADICTED` output across A/B/C motivates a future sensitivity experiment to determine whether the current Laya configuration is responsive to changes in evidence and proposition. This remains a hypothesis, not a conclusion about decision collapse.

## Next Experiment

### SENSITIVITY_RUN_001

Planned independent interventions:

- Evidence/operator: `VIVO ↔ TIM ↔ missing`
- Proposition: `VIVO tower in SP ↔ TIM tower in SP`
- Spatial attribute: `SP ↔ PR`

Purpose: measure whether decisions respond coherently to controlled changes in evidence, proposition, and spatial state.

This experiment was documented but not implemented or run today.

## Session Boundary

`BASELINE_RUN_001`, `results/laya-validation-001.json`, and `docs/POST-PUBLISH-VALIDATION-001.md` remain preserved as separate artifacts. No application inference was invoked during this freeze, and no conclusion of architectural superiority is drawn.
