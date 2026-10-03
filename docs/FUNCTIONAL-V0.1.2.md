# KOS Spatial Decision Lab Functional v0.1.2

This patch hardens the Pure Model inference contract for constrained three-label decisions.

## Pure Model request contract

The application sends Ollama `/api/generate` requests with:

- `stream: false`
- a JSON schema requiring exactly one `decision` property
- enum values `SUPPORTED`, `CONTRADICTED`, and `INSUFFICIENT`
- `think: false`
- `temperature: 0`
- `num_predict: 32`
- an application timeout controlled by `PURE_MODEL_TIMEOUT_MS` (default 30,000 ms)

Successful telemetry preserves input/output token counts and provider timing data.

## Status semantics

- `NOT_CONFIGURED`: provider/model/runtime configuration is missing.
- `RUNTIME_ERROR`: configured execution failed, timed out, or returned HTTP failure.
- `INVALID_OUTPUT`: provider returned output outside the decision contract.
- `COMPLETED`: a valid normalized decision was produced.

## Direct qwen3.5:9b smoke

One functional smoke produced:

- status: `COMPLETED`
- decision: `SUPPORTED`
- input tokens: `221`
- output tokens: `7`
- application wall latency: approximately `11,075 ms`

This is a functional smoke run, not a scientific performance result.
