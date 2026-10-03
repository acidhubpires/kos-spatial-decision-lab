# KOS Spatial Decision Lab Functional v0.1.1

This patch release fixes the local static-file serving defect found in Firefox.

## Fixed

- `/app.js` serves the actual application JavaScript with `application/javascript; charset=utf-8`.
- `/styles.css` serves CSS with `text/css; charset=utf-8`.
- `/` and extensionless client routes may fall back to `index.html`.
- Missing extension-bearing assets such as `/definitely-missing.js` return HTTP 404 and never return the HTML shell.
- `/api/fixtures` remains JSON and returns the three frozen fixtures.
- An HTTP regression test covers all of the above behavior.

The Phase 2 proposition, expected labels, fixtures, and SHA-256 digests are unchanged. No inference architecture was changed.

## Validation

`pnpm test`, `pnpm typecheck`, and `pnpm build` pass. A live `pnpm dev` HTTP smoke test confirms the root page, JavaScript, CSS, fixtures API, and missing-asset behavior.
