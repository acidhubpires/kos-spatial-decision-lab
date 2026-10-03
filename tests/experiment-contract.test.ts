import { strict as assert } from "node:assert";
import test from "node:test";
import {
  digestCanonicalState,
  PROPOSITION,
  PROPOSITION_ID,
  serializeCanonicalState,
} from "../src/experiment-contract.js";
import {
  FIXTURE_A_SUPPORTED,
  FIXTURE_B_CONTRADICTED,
  FIXTURE_C_INSUFFICIENT,
} from "../src/fixtures.js";

test("the proposition is separate from every spatial state", () => {
  assert.equal(PROPOSITION_ID, "tower-vivo-sp");
  assert.equal(PROPOSITION, "The observed feature is a VIVO tower located in SP.");
  assert.equal("proposition" in FIXTURE_A_SUPPORTED, false);
});

test("canonical serialization is deterministic and sorts object keys", () => {
  const reordered = {
    features: FIXTURE_A_SUPPORTED.features,
    source: FIXTURE_A_SUPPORTED.source,
  };
  assert.equal(serializeCanonicalState(FIXTURE_A_SUPPORTED), serializeCanonicalState(reordered));
  assert.match(serializeCanonicalState(FIXTURE_A_SUPPORTED), /^\{"features":.*,"source":/);
});

test("the three frozen fixtures carry the expected distinguishing facts", () => {
  assert.equal(FIXTURE_A_SUPPORTED.features[0].operator, "VIVO");
  assert.equal(FIXTURE_A_SUPPORTED.features[0].uf, "SP");
  assert.equal(FIXTURE_B_CONTRADICTED.features[0].operator, "TIM");
  assert.equal(FIXTURE_B_CONTRADICTED.features[0].uf, "SP");
  assert.equal("operator" in FIXTURE_C_INSUFFICIENT.features[0], false);
  assert.equal(FIXTURE_C_INSUFFICIENT.features[0].uf, "SP");
});

test("changing only operator changes the state digest", () => {
  assert.notEqual(digestCanonicalState(FIXTURE_A_SUPPORTED), digestCanonicalState(FIXTURE_B_CONTRADICTED));
});

test("removing operator changes the state digest", () => {
  assert.notEqual(digestCanonicalState(FIXTURE_A_SUPPORTED), digestCanonicalState(FIXTURE_C_INSUFFICIENT));
});

test("digests are deterministic SHA-256 hex strings", () => {
  const fixtures = [FIXTURE_A_SUPPORTED, FIXTURE_B_CONTRADICTED, FIXTURE_C_INSUFFICIENT];
  for (const fixture of fixtures) {
    const first = digestCanonicalState(fixture);
    assert.equal(first, digestCanonicalState(fixture));
    assert.match(first, /^[0-9a-f]{64}$/);
  }
});
