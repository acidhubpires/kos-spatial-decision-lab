import assert from "node:assert/strict";
import test from "node:test";
import { createLabServer } from "../src/server.js";

let server: ReturnType<typeof createLabServer>;
let baseUrl: string;

test.before(async () => {
  server = createLabServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("static assets, API, and missing-asset behavior are correct", async () => {
  const root = await fetch(`${baseUrl}/`);
  assert.equal(root.status, 200);
  assert.match(root.headers.get("content-type") ?? "", /^text\/html(?:;|$)/);

  const app = await fetch(`${baseUrl}/app.js`);
  assert.equal(app.status, 200);
  assert.match(app.headers.get("content-type") ?? "", /(?:application|text)\/javascript(?:;|$)/);
  assert.match(await app.text(), /loadFixtures|\/api\/fixtures/);

  const css = await fetch(`${baseUrl}/styles.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get("content-type") ?? "", /^text\/css(?:;|$)/);

  const fixtures = await fetch(`${baseUrl}/api/fixtures`);
  assert.equal(fixtures.status, 200);
  assert.match(fixtures.headers.get("content-type") ?? "", /^application\/json(?:;|$)/);
  const fixtureBody = await fixtures.json() as { fixtures?: unknown[] };
  assert.equal(fixtureBody.fixtures?.length, 3);

  const missing = await fetch(`${baseUrl}/definitely-missing.js`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.text()).includes("KOS Spatial Decision Lab"), false);
});
