# KOS Spatial Decision Lab Functional v0.1.0

## Works

- Local Node/TypeScript web application with scenario selector A/B/C.
- Displays the frozen canonical state, proposition, expected label, and digest.
- Runs Pure Model through Ollama when reachable and configured.
- Runs Laya only when explicit local `laya-ts` module and ONNX model paths are configured.
- Reports `NOT_CONFIGURED` instead of fabricating unavailable model results.
- Runs the standalone KOS governed representation, including observation, evidence, proposition, evaluation, finding, and `HUMAN_REQUIRED` authority trace.
- Measures deterministic JSON input/output bytes and external wall-clock latency; captures token telemetry where supplied by the provider.

## Scientific limitations

This release is a human-operated functional comparison only. It does not implement repeated runs, cold/warm separation, P50/P95, stability analysis, evidence/proposition sensitivity suites, or scientific conclusions. It must not be described as production-ready.
