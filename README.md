# KOS Spatial Decision Lab

Functional local prototype for comparing the same frozen Evidence-derived spatial state and proposition through:

- **Pure Model** — local Ollama structured JSON generation.
- **Laya** — optional local `laya-ts` ONNX typed decision integration.
- **KOS Governed** — standalone observation → evidence → proposition → finding → authority trace. It never imports or calls the production Evidence Platform.

## Run

Prerequisites: Node.js, pnpm, and (optionally) a local Ollama installation.

```powershell
pnpm install
pnpm dev
```

Open `http://127.0.0.1:4173`.

Copy `.env.example` to `.env` and configure the process environment as needed. `PURE_MODEL` selects the Ollama model; if omitted, the first model returned by `/api/tags` is used. `OLLAMA_URL` defaults to `http://127.0.0.1:11434`.

Laya is deliberately opt-in. Run `pnpm setup:laya` for the setup notes, then set `LAYA_MODEL_DIR` and `LAYA_TS_MODULE`. The application reports `NOT_CONFIGURED` when either is absent or the ONNX bundle cannot be loaded; it never fabricates a Laya result.

## Frozen input

The proposition is `The observed feature is a VIVO tower located in SP.` with ID `tower-vivo-sp`. Fixtures A, B, and C, expected labels, and SHA-256 digests are defined in `src/fixtures.ts` and `fixtures/manifest.json`. The Phase 2 contract remains unchanged.

## Validation scripts

```powershell
pnpm test
pnpm typecheck
pnpm build
```

## Limitations

This is a functional prototype, not a scientific benchmark or production KOS product. It runs one request at a time, has no repeated-run harness, cold/warm separation, P50/P95, or statistical analysis. Ollama and Laya results depend on local model/runtime configuration. Confidence is not correctness. Laya `output_tokens: 0` is the upstream non-autoregressive usage semantics and is not generative output cost. KOS authority is always `HUMAN_REQUIRED` in this version.
