# KOS Spatial Decision Lab

Functional prototype and experimental benchmark comparing three decision architectures over the same frozen spatial state and explicit proposition:

- Pure generative model
- Laya typed-decision model
- KOS governed decision pipeline

Current functional baseline: **v0.1.2**

The experiment uses frozen ArcGIS-derived tower fixtures and preserves deterministic SHA-256 digests so the same spatial evidence and proposition can be evaluated by each architecture without moving the experimental boundary.

## Current baseline

`BASELINE_RUN_001` preserves the first six valid observations across fixtures A, B and C.

Preliminary findings only — single run, not statistically significant.

- Fixture A: Pure Model and KOS Governed returned `SUPPORTED` correctly.
- Fixture B: both returned `INSUFFICIENT` while the expected result was `CONTRADICTED`.
- Fixture C: Pure Model returned `INSUFFICIENT` correctly using qwen3.5:9b.
- Fixture C: KOS Governed returned `INSUFFICIENT` without model inference because the required `operator` evidence was absent.
- Governance is not equivalent to correctness or model intelligence.
- A governed architecture may avoid unnecessary model inference.

## Run locally

```powershell
pnpm install
$env:PURE_MODEL="qwen3.5:9b"
$env:OLLAMA_URL="http://127.0.0.1:11434"
pnpm dev
```

Open:

`http://127.0.0.1:4173`

## Status

This repository is an experimental lab, not a production KOS deployment and not yet a statistically validated scientific benchmark.
