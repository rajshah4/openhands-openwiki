const http = require("http");

const notes = [
  {
    id: "note-1",
    title: "Welcome",
    body: "This in-memory note helps OpenWiki discover the domain model.",
    createdAt: new Date("2026-07-02T00:00:00.000Z").toISOString(),
  },
];

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/healthz") {
    sendJson(res, 200, { ok: true, service: "demo-target" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/notes") {
    sendJson(res, 200, { notes });
    return;
  }

  if (req.method === "POST" && url.pathname === "/notes") {
    try {
      const payload = await readJson(req);
      const note = {
        id: `note-${notes.length + 1}`,
        title: String(payload.title || "Untitled"),
        body: String(payload.body || ""),
        createdAt: new Date().toISOString(),
      };

      notes.push(note);
      sendJson(res, 201, { note });
    } catch {
      sendJson(res, 400, { error: "Invalid JSON body" });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

const port = Number(process.env.PORT || 3000);
const server = http.createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(port, () => {
  console.log(`demo-target listening on ${port}`);
});
