# Demo Target Service

This tiny service exists so the OpenWiki Docs plugin can be tested against a real repository shape.

## What It Does

The service exposes a small HTTP API for project notes:

- `GET /healthz` returns service health.
- `GET /notes` lists notes from memory.
- `POST /notes` creates a note with a generated id and timestamp.

The implementation is intentionally small so documentation quality is easy to inspect.

## Run

```bash
node src/server.js
```

The server listens on port `3000` unless `PORT` is set.

## Verify

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/notes
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Hello from OpenWiki"}'
```

## Change Surfaces

- Routing and handlers live in `src/server.js`.
- There is no persistence layer yet; notes are stored in memory.
- Tests are not present in this demo target.
