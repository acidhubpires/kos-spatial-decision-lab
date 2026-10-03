import { digestCanonicalState, PROPOSITION, PROPOSITION_ID } from "./experiment-contract.js";
import { FIXTURES } from "./fixtures.js";

export const EXPERIMENT_MANIFEST = FIXTURES.map(({ fixtureId, state, expectedLabel }) => ({
  fixtureId,
  propositionId: PROPOSITION_ID,
  proposition: PROPOSITION,
  expectedLabel,
  stateDigest: digestCanonicalState(state),
}));

console.log(JSON.stringify(EXPERIMENT_MANIFEST, null, 2));
