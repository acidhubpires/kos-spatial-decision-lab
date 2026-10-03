# KOS Spatial Decision Lab Functional v0.1.0

## Works

- Local Node/TypeScript web application with scenario selector A/B/C.
- Displays the frozen canonical state, proposition, expected label, and digest.
- Runs Pure Model through Ollama when reachable and configured.
- Runs Laya only when explicit local `laya-ts` module and ONNX model paths are configured.
- Reports `NOT_CONFIGURED` instead of fabricating unavailable model results.
- Runs the standalone KOS governed representation, including observation, evidence, proposition, evaluation, finding, and `HUMAN_REQUIRED` authority trace.
- Measures deterministic JSON input/output bytes and external wall-clock latency; captures token telemetry where supplied by the provider.

## Not tested/configured by default

- Ollama availability and a real Pure Model run depend on the machine running the lab.
- Laya is not assumed configured; no upstream repository is modified and no checkpoint is bundled.
- No production Evidence API, AWS, ArcGIS, or KOS credentials are required or used.

## Patch note

The v0.1.1 patch corrects static JavaScript MIME handling and ensures missing `.js`/`.css` assets return 404 instead of being hidden behind the HTML fallback. HTTP regression coverage now checks the root document, `app.js`, `styles.css`, fixtures API, and a missing JavaScript asset.

## Scientific limitations

This release is a human-operated functional comparison only. It does not implement repeated runs, cold/warm separation, P50/P95, stability analysis, evidence/proposition sensitivity suites, or scientific conclusions. It must not be described as production-ready.
