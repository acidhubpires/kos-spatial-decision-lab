import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { digestCanonicalState, PROPOSITION, PROPOSITION_ID } from "./experiment-contract.js";
import { FIXTURES } from "./fixtures.js";
import { fixtureById, runKosGoverned, runLaya, runPureModel } from "./lab.js";

const root = resolve(join(fileURLToPath(new URL(".", import.meta.url)), "..", "public"));
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

async function body(req: IncomingMessage): Promise<any> {
  let text = "";
  for await (const chunk of req) text += chunk;
  return text ? JSON.parse(text) : {};
}

async function api(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
  if (req.method === "GET" && path === "/api/fixtures") {
    send(res, 200, { propositionId: PROPOSITION_ID, proposition: PROPOSITION, fixtures: FIXTURES.map(({ fixtureId, state, expectedLabel }) => ({ fixtureId, state, expectedLabel, stateDigest: digestCanonicalState(state) })) });
    return;
  }
  if (req.method === "POST" && path === "/api/run") {
    const input = await body(req);
    const fixture = fixtureById(String(input.fixtureId));
    if (!fixture) { send(res, 400, { error: "Unknown fixture" }); return; }
    const architecture = String(input.architecture);
    const result = architecture === "PURE_MODEL" ? await runPureModel(fixture) : architecture === "LAYA" ? await runLaya(fixture) : architecture === "KOS_GOVERNED" ? await runKosGoverned(fixture) : null;
    if (!result) { send(res, 400, { error: "Unknown architecture" }); return; }
    send(res, 200, result);
    return;
  }
  send(res, 404, { error: "Not found" });
}

function contentType(file: string): string {
  switch (extname(file).toLowerCase()) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

async function staticFile(pathname: string, res: ServerResponse): Promise<void> {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const candidate = resolve(join(root, requested.replace(/^\//, "")));
  if (candidate !== root && !candidate.startsWith(root + "\\")) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const extension = extname(candidate).toLowerCase();
  try {
    const content = await readFile(candidate);
    res.writeHead(200, { "content-type": contentType(candidate) });
    res.end(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      if (extension) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }
      const index = await readFile(join(root, "index.html"));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(index);
      return;
    }
    throw error;
  }
}

export function createLabServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://" + (req.headers.host ?? "localhost"));
      if (url.pathname.startsWith("/api/")) return await api(req, res, url.pathname);
      return await staticFile(url.pathname, res);
    } catch (error) {
      send(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}

export function startLabServer(port = Number(process.env.PORT ?? 4173)): ReturnType<typeof createLabServer> {
  const server = createLabServer();
  server.listen(port, "127.0.0.1", () => console.log("KOS Spatial Decision Lab: http://127.0.0.1:" + port));
  return server;
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) startLabServer();
