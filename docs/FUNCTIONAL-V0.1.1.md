# KOS Spatial Decision Lab Functional v0.1.1

This patch release fixes the local static-file serving defect found in Firefox.

## Fixed

- `/app.js` serves actual JavaScript with `application/javascript; charset=utf-8`.
- `/styles.css` serves CSS with `text/css; charset=utf-8`.
- Missing extension-bearing assets return HTTP 404 rather than the HTML shell.
- `/api/fixtures` remains JSON and returns the three frozen fixtures.
- HTTP regression tests cover the root document, JavaScript, CSS, fixtures API, and missing assets.

The proposition, expected labels, fixtures, and SHA-256 digests are unchanged.
