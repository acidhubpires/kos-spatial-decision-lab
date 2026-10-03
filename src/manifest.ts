import { digestCanonicalState, PROPOSITION_ID } from "./experiment-contract.js";
import { FIXTURES } from "./fixtures.js";

const manifest = FIXTURES.map(({ fixtureId, state, expectedLabel }) => ({
  fixtureId,
  propositionId: PROPOSITION_ID,
  expectedLabel,
  stateDigest: digestCanonicalState(state),
}));

console.log(JSON.stringify(manifest, null, 2));
