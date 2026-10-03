import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import test from "node:test";
import { FIXTURE_A_SUPPORTED } from "../src/fixtures.js";
import { PURE_MODEL_DECISION_SCHEMA, PURE_MODEL_GENERATION_LIMIT, parseModelJson, pureProvider } from "../src/lab.js";

type MockResponse = { status?: number; body?: unknown; delayMs?: number };

async function withOllama(handler: (request: { path: string; body: any }) => MockResponse | Promise<MockResponse>, fn: (requests: { path: string; body: any }[]) => Promise<void>, model = "test-model"): Promise<void> {
  const requests: { path: string; body: any }[] = [];
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    const request = { path: req.url ?? "", body: text ? JSON.parse(text) : {} };
    requests.push(request);
    const response = await handler(request);
    if (response.delayMs) await new Promise((resolve) => setTimeout(resolve, response.delayMs));
    res.writeHead(response.status ?? 200, { "content-type": "application/json" });
    res.end(JSON.stringify(response.body ?? {}));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const previousUrl = process.env.OLLAMA_URL;
  const previousModel = process.env.PURE_MODEL;
  const previousTimeout = process.env.PURE_MODEL_TIMEOUT_MS;
  process.env.OLLAMA_URL = `http://127.0.0.1:${address.port}`;
  if (model) process.env.PURE_MODEL = model; else delete process.env.PURE_MODEL;
  try { await fn(requests); } finally {
    if (previousUrl === undefined) delete process.env.OLLAMA_URL; else process.env.OLLAMA_URL = previousUrl;
    if (previousModel === undefined) delete process.env.PURE_MODEL; else process.env.PURE_MODEL = previousModel;
    if (previousTimeout === undefined) delete process.env.PURE_MODEL_TIMEOUT_MS; else process.env.PURE_MODEL_TIMEOUT_MS = previousTimeout;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("the request contract bounds generation and disables thinking", async () => {
  await withOllama(() => ({ body: { response: '{"decision":"SUPPORTED"}', prompt_eval_count: 219, eval_count: 6, prompt_eval_duration: 1, eval_duration: 2, load_duration: 3, total_duration: 4 } }), async (requests) => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "COMPLETED");
    const request = requests.find((item) => item.path === "/api/generate");
    assert.ok(request);
    assert.equal(request.body.stream, false);
    assert.deepEqual(request.body.format, PURE_MODEL_DECISION_SCHEMA);
    assert.equal(request.body.think, false);
    assert.equal(request.body.options.temperature, 0);
    assert.equal(request.body.options.num_predict, PURE_MODEL_GENERATION_LIMIT);
    assert.ok(request.body.options.num_predict <= 32);
    assert.deepEqual(result.providerMetrics, { prompt_eval_count: 219, eval_count: 6, prompt_eval_duration: 1, eval_duration: 2, load_duration: 3, total_duration: 4 });
    assert.equal(result.inputTokens, 219);
    assert.equal(result.outputTokens, 6);
  });
});

test("only the three decision labels are accepted", () => {
  for (const label of ["SUPPORTED", "CONTRADICTED", "INSUFFICIENT"]) assert.equal(parseModelJson({ decision: label }).decision, label);
  assert.equal(parseModelJson({ decision: "MAYBE" }).decision, null);
  assert.equal(parseModelJson({ decision: "SUPPORTED", explanation: "extra" }).decision, null);
  assert.equal(parseModelJson("not-json").decision, null);
});

test("malformed model output is INVALID_OUTPUT", async () => {
  await withOllama(() => ({ body: { response: '{"decision":"MAYBE"}' } }), async () => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "INVALID_OUTPUT");
    assert.equal(result.decision, null);
    assert.ok(result.raw);
  });
});

test("request timeout is RUNTIME_ERROR with diagnostics", async () => {
  process.env.PURE_MODEL_TIMEOUT_MS = "20";
  await withOllama(() => ({ delayMs: 100, body: { response: '{"decision":"SUPPORTED"}' } }), async () => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "RUNTIME_ERROR");
    assert.equal((result.raw as { error?: string }).error, "TIMEOUT");
  });
});

test("HTTP 500 is RUNTIME_ERROR with raw diagnostics", async () => {
  await withOllama(() => ({ status: 500, body: { error: "model failed" } }), async () => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "RUNTIME_ERROR");
    assert.deepEqual(result.raw, { error: "model failed" });
  });
});

test("empty model discovery is NOT_CONFIGURED", async () => {
  const previousModel = process.env.PURE_MODEL;
  delete process.env.PURE_MODEL;
  await withOllama((request) => request.path === "/api/tags" ? { body: { models: [] } } : { body: {} }, async () => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "NOT_CONFIGURED");
    assert.equal(result.decision, null);
  }, "");
  if (previousModel !== undefined) process.env.PURE_MODEL = previousModel;
});

test("successful valid response is COMPLETED", async () => {
  await withOllama(() => ({ body: { response: '{"decision":"CONTRADICTED"}', prompt_eval_count: 10, eval_count: 4 } }), async () => {
    const result = await pureProvider(FIXTURE_A_SUPPORTED);
    assert.equal(result.status, "COMPLETED");
    assert.equal(result.decision, "CONTRADICTED");
  });
});
