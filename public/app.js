const architectures = ["PURE_MODEL", "LAYA", "KOS_GOVERNED"];
const labels = { PURE_MODEL: "Pure Model", LAYA: "Laya", KOS_GOVERNED: "KOS Governed" };
let fixtures = [];
let selected = null;
const results = new Map();
const $ = (id) => document.getElementById(id);
const pretty = (x) => JSON.stringify(x, null, 2);

async function loadFixtures() {
  const response = await fetch("/api/fixtures");
  const data = await response.json();
  fixtures = data.fixtures;
  window.proposition = data.proposition;
  window.propositionId = data.propositionId;
  renderScenario("A");
}
function renderScenario(id) {
  selected = fixtures.find((x) => x.fixtureId === id);
  if (!selected) return;
  $("state").textContent = pretty(selected.state);
  $("proposition").textContent = window.proposition;
  $("expected").textContent = selected.expectedLabel;
  $("digest").textContent = selected.stateDigest;
  results.clear(); renderCards(); renderTable(); $("raw").textContent = "Run an architecture to inspect its result.";
}
async function run(architecture) {
  if (!selected) return;
  $("status").textContent = `Running ${labels[architecture]}…`;
  const response = await fetch("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fixtureId: selected.fixtureId, architecture }) });
  const result = await response.json(); results.set(architecture, result); renderCards(); renderTable(); $("raw").textContent = pretty(result); $("status").textContent = `${labels[architecture]} complete`;
}
function value(x) { return x === undefined || x === null ? "N/A" : x; }
function renderCards() {
  $("cards").innerHTML = architectures.map((architecture) => { const r = results.get(architecture); return `<article class="card"><h3>${labels[architecture]}</h3><p class="state ${r ? r.status.toLowerCase() : "not-run"}">${r ? r.status : "NOT RUN"}</p><dl><dt>Decision</dt><dd>${value(r?.decision)}</dd><dt>Correct</dt><dd>${r?.correct === true ? "YES" : r?.correct === false ? "NO" : "N/A"}</dd><dt>Total latency</dt><dd>${r ? `${r.metrics.totalLatencyMs.toFixed(2)} ms` : "N/A"}</dd><dt>Input / output</dt><dd>${r ? `${r.metrics.inputBytes} / ${r.metrics.outputBytes} B` : "N/A"}</dd><dt>Tokens</dt><dd>${r ? `${value(r.metrics.inputTokens)} / ${value(r.metrics.outputTokens)}` : "N/A"}</dd><dt>Provider</dt><dd>${r ? `${r.provider}${r.model ? ` / ${r.model}` : ""}` : "N/A"}</dd>${architecture === "KOS_GOVERNED" ? `<dt>Authority</dt><dd>${value(r?.authority)}</dd>` : ""}</dl><button class="run" data-architecture="${architecture}">RUN</button>${r?.message ? `<p class="warn">${r.message}</p>` : ""}</article>`; }).join("");
  document.querySelectorAll(".run").forEach((button) => button.addEventListener("click", () => run(button.dataset.architecture)));
}
function renderTable() {
  $("measurements").innerHTML = architectures.map((a) => { const r = results.get(a); return `<tr><td>${labels[a]}</td><td>${value(r?.status)}</td><td>${value(r?.decision)}</td><td>${r?.correct === true ? "YES" : r?.correct === false ? "NO" : "N/A"}</td><td>${r ? r.metrics.totalLatencyMs.toFixed(2) : "N/A"}</td><td>${r ? value(r.metrics.inferenceLatencyMs) : "N/A"}</td><td>${r ? value(r.metrics.governanceLatencyMs) : "N/A"}</td><td>${r ? r.metrics.inputBytes : "N/A"}</td><td>${r ? r.metrics.outputBytes : "N/A"}</td><td>${r ? `${value(r.metrics.inputTokens)} / ${value(r.metrics.outputTokens)}` : "N/A"}</td><td>${r ? `${r.provider}${r.model ? ` / ${r.model}` : ""}` : "N/A"}</td></tr>`; }).join("");
}
$("fixture").addEventListener("change", (event) => renderScenario(event.target.value));
$("runAll").addEventListener("click", async () => { for (const architecture of architectures) await run(architecture); });
renderCards(); renderTable(); loadFixtures().catch((error) => { $("status").textContent = error.message; });
