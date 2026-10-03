# Environment

The requested path `D:\AI\sandbox\running\kos-spatial-decision-lab` was not present in this managed workspace. Validation was performed against the active published-lab contents at `D:\AI\sandbox\running\kos-spatial-decision-benchmark`, which contains the requested application and frozen artifacts. The GitHub page was not fetchable from this environment, so no remote state was substituted.

- Node/pnpm workspace: `pnpm@10.33.2`
- Ollama endpoint: `http://127.0.0.1:11434`
- Pure Model requested for smoke configuration: `qwen3.5:9b`
- Reference repositories: inspected read-only; neither was modified.
- `BASELINE_RUN_001`: not overwritten and not rerun as a baseline.

# Repository Validation

The requested application, fixture, baseline, documentation, and test paths exist in the active workspace. `pnpm install` completed with the lockfile already up to date. The package scripts and source tree are internally consistent.

- `pnpm install`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS — 14 tests
- `pnpm manifest`: PASS

The manifest command emitted the three current fixture digests and did not modify the manifest or fixtures.

# Experiment Contract Integrity

The proposition remains exactly:

`The observed feature is a VIVO tower located in SP.`

Expected labels remain:

- A → `SUPPORTED`
- B → `CONTRADICTED`
- C → `INSUFFICIENT`

The deterministic digest values match both `fixtures/manifest.json` and `results/baseline-run-001.json`:

- A: `f2eb88aaf448af926677d9f5fbb2d75a254698976560396928c38a13dc58d590`
- B: `fcea2962b3830decaafbedcb5c7eb3681316d6e3befa4016b4c528140e4938f9`
- C: `d6e1e74123ccf35480fefe7ee3c359e5b3da8989d94df28f2b54e2e671bc2583`

No fixture regeneration or correction was performed.

# Application Smoke Test

A fresh local server was started with `PURE_MODEL=qwen3.5:9b` and the requested Ollama URL.

- `GET /`: HTTP 200; HTML shell contains the lab title and scenario selector.
- `GET /app.js`: HTTP 200; application JavaScript served and contains fixture-loading code.
- `GET /styles.css`: HTTP 200; CSS served with `text/css`.
- `GET /api/fixtures`: HTTP 200; returns all three fixtures, proposition, labels, and digests.
- The A/B/C selector, proposition binding, expected-label binding, digest binding, Run buttons, raw-result viewer, and measurement-table rendering are present in the published UI code.
- Pure Model execution was not clicked during this validation because doing so against a frozen fixture would rerun historical baseline evidence.

Therefore the UI/static/API smoke passed, while a new Pure Model inference result was intentionally not collected.

# Laya Readiness

Read-only inspection of `D:\AI\sandbox\running\laya\laya-ts` found:

- package name/version: `laya-ts@0.1.0`;
- build command: `npm run build` (`clean`, `tsc -p tsconfig.json`, license copy);
- test command: `npm test` (`vitest`); package test: `npm run test:package`;
- runtime dependency: optional `onnxruntime-node` for Node and `onnxruntime-web` for browser, imported lazily;
- source API: `Agent.load(modelDirOrRepo, options)` in `src/agent.ts`;
- source inference API: `agent.predict(state, questions, options)`;
- required local model files: `rl_agent_config.json`, `tokenizer.json`, `encoder.onnx`, and `head.onnx` (with referenced ONNX data files as applicable);
- expected local model directory: the directory passed to `Agent.load()`/`localDir`, containing those artifacts;
- the checkout has no `laya-ts/dist` directory, no local ONNX model directory, and no discovered `encoder.onnx`, `head.onnx`, `rl_agent_config.json`, or `tokenizer.json` model bundle.

The current benchmark adapter in `src/lab.ts` matches the source API shape: it dynamically imports a configured Laya module, calls `Agent.load(modelDir, { device })`, then calls `agent.predict(state, questions)`. It does not fabricate a result when `LAYA_MODEL_DIR` or `LAYA_TS_MODULE` is absent.

Readiness classification: **LAYA_CONFIGURATION_REQUIRED**.

Missing configuration/artifacts:

1. `LAYA_TS_MODULE` must point to a built/installed `laya-ts` ESM `dist/index.js`.
2. `LAYA_MODEL_DIR` must point to a local exported ONNX bundle containing the required model/config/tokenizer files.
3. The runtime environment must provide the optional Node ONNX runtime dependency.

# Laya Functional Test

Not executed. Laya was not configured and the required upstream build/model artifacts are absent. No Laya result was fabricated.

# KOS Control Test

Fixture C was run as a separate current control validation, not as a replacement or overwrite of `BASELINE_RUN_001`.

- `decision`: `INSUFFICIENT`
- `expectedDecision`: `INSUFFICIENT`
- `correct`: `true`
- `provider`: `KOS_GOVERNED_POLICY`
- `model`: `null`
- `inferenceLatencyMs`: `0`
- `authority`: `HUMAN_REQUIRED`
- `governanceLatencyMs`: approximately `0.1237 ms`
- `totalLatencyMs`: approximately `0.4199 ms`

The result confirms deterministic evidence sufficiency can terminate the pipeline without model inference. This latency must not be compared directly with model inference latency as if they were equivalent computational operations.

# Failures / Limitations

- The requested `kos-spatial-decision-lab` directory and remote GitHub page were unavailable in this environment; the active benchmark workspace was used.
- Pure Model execution was intentionally not rerun to preserve the historical baseline constraint.
- Laya cannot execute until its module build and ONNX artifacts are configured.
- This is functional validation, not a scientific benchmark. No architectural superiority conclusion is drawn.
- `BASELINE_RUN_001` remains historical evidence and was not changed.

# Next Experimental Step

Provision a read-only-compatible, locally built `laya-ts` module and an explicit local ONNX model bundle through `LAYA_TS_MODULE` and `LAYA_MODEL_DIR`. Then run a new, separately identified Laya validation set—never overwrite `BASELINE_RUN_001`—before designing repeated benchmark runs.

POST_PUBLISH_VALIDATION: PASS

TYPECHECK: PASS
TESTS: PASS
MANIFEST: PASS
UI_SMOKE: PASS

PURE_MODEL: NOT_TESTED
KOS_GOVERNED: PASS
LAYA: NOT_CONFIGURED

PROPOSITION_CHANGED: NO
FIXTURES_CHANGED: NO

EVIDENCE_REPO_CHANGED: NO
LAYA_REPO_CHANGED: NO

READY_FOR_REPEATED_BENCHMARK: NO
