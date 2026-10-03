# KOS Spatial Decision Lab Functional v0.1.2

This patch hardens the Pure Model inference contract for constrained three-label decisions.

## Pure Model request contract

The application sends Ollama `/api/generate` requests with:

- `stream: false`
- the JSON schema object requiring exactly one `decision` property
- enum values `SUPPORTED`, `CONTRADICTED`, and `INSUFFICIENT`
- `think: false` when supported by the installed Ollama/model API
- `options.temperature: 0`
- `options.num_predict: 32`
- an application timeout controlled by `PURE_MODEL_TIMEOUT_MS` (default 30,000 ms)

The locally installed Ollama runtime accepted `think: false` and the schema-shaped `format` request during direct probing. A deliberately smaller eight-token probe stopped at the ceiling with incomplete JSON, so the application uses 32 as a strict upper bound while still rejecting incomplete or non-contract output.

Successful telemetry is preserved: `prompt_eval_count` → `inputTokens`, `eval_count` → `outputTokens`, plus raw `prompt_eval_duration`, `eval_duration`, `load_duration`, and `total_duration` under `providerMetrics`.

## Status semantics

- `NOT_CONFIGURED`: provider/model/runtime configuration is missing.
- `RUNTIME_ERROR`: configured execution failed, timed out, or returned HTTP failure.
- `INVALID_OUTPUT`: the provider returned output that does not satisfy the exact decision contract.
- `COMPLETED`: a valid normalized decision was produced.

The UI renders runtime and invalid-output states distinctly from configuration failures. Failed executions never receive a valid decision or correctness result.

## Validation

The test suite covers request bounds, thinking control, exact labels, malformed output, timeout, HTTP 500, missing model discovery, successful completion, and the HTTP static/API smoke contract. Phase 2 fixtures, proposition, expected labels, and digests are unchanged.

## Direct qwen3.5:9b smoke

The same application request contract was executed through the local application with `PURE_MODEL=qwen3.5:9b`:

- status: `COMPLETED`
- decision: `SUPPORTED`
- input tokens: `221`
- output tokens: `7`
- application wall latency: approximately `11,075 ms`
- provider telemetry `total_duration`: `10,950,701,500 ns`

This is one functional smoke run, not a scientific performance result.
