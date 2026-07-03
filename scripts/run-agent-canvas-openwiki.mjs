#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const baseUrl = process.env.AGENT_CANVAS_URL || "http://127.0.0.1:8000";
const profileName = process.env.OPENWIKI_PROFILE || "Minimax";
const workspace = process.env.OPENWIKI_WORKSPACE;
const skillPath =
  process.env.OPENWIKI_SKILL_PATH ||
  join(repoRoot, "plugins", "openwiki-docs", "skills", "openwiki-docs", "SKILL.md");

if (!workspace) {
  throw new Error("OPENWIKI_WORKSPACE is required");
}

const keyFiles = [
  process.env.AGENT_CANVAS_API_KEY_FILE,
  join(process.env.HOME || "", ".openhands", "agent-canvas", "api-key.txt"),
  join(process.env.HOME || "", ".openhands", "agent-canvas", "session-api-key.txt"),
].filter(Boolean);

function redactErrorBody(value) {
  return JSON.stringify(value)
    .replace(/"api_key"\s*:\s*"[^"]*"/gi, '"api_key":"<redacted>"')
    .replace(/"[^"]*(secret|token|password)[^"]*"\s*:\s*"[^"]*"/gi, '"<redacted>":"<redacted>"');
}

async function readFirstWorkingSessionKey() {
  for (const file of keyFiles) {
    let key;
    try {
      key = (await readFile(file, "utf8")).trim();
    } catch {
      continue;
    }
    if (!key) continue;

    const response = await fetch(`${baseUrl}/api/profiles`, {
      headers: { "X-Session-API-Key": key },
    }).catch(() => null);
    if (response?.ok) {
      return key;
    }
  }

  throw new Error("No working Agent Canvas API key found");
}

const sessionKey = await readFirstWorkingSessionKey();

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "X-Session-API-Key": sessionKey,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${path}: ${redactErrorBody(body)}`);
  }
  return body;
}

const [serverInfo, settings, profile, skillContent] = await Promise.all([
  request("/server_info"),
  request("/api/settings", { headers: { "X-Expose-Secrets": "encrypted" } }),
  request(`/api/profiles/${encodeURIComponent(profileName)}`, {
    headers: { "X-Expose-Secrets": "encrypted" },
  }),
  readFile(skillPath, "utf8"),
]);

const usableTools = new Set(serverInfo.usable_tools || []);
const desiredTools = [
  "terminal",
  "file_editor",
  "task_tracker",
  "canvas_ui",
  "browser_tool_set",
  "task_tool_set",
].filter((name) => usableTools.size === 0 || usableTools.has(name));

const agentSettings = structuredClone(settings.agent_settings);
const existingContext = agentSettings.agent_context || {};
const existingSkills = Array.isArray(existingContext.skills)
  ? existingContext.skills.filter((skill) => skill?.name !== "openwiki-docs")
  : [];

agentSettings.llm = profile.config;
agentSettings.llm.stream = true;
agentSettings.tools = desiredTools.map((name) => ({ name, params: {} }));
agentSettings.agent_context = {
  ...existingContext,
  skills: [
    ...existingSkills,
    {
      name: "openwiki-docs",
      content: skillContent,
      trigger: {
        type: "keyword",
        keywords: ["openwiki-docs", "openwiki", "/openwiki-docs:init", "/openwiki-docs:update"],
      },
      source: skillPath,
      description:
        "Generate and update OpenWiki-style agent documentation for a repository.",
      is_agentskills_format: true,
    },
  ],
  load_project_skills: true,
  load_user_skills: true,
  load_public_skills: false,
};

const mode = process.env.OPENWIKI_MODE || "init";
const focus = process.env.OPENWIKI_FOCUS ? ` Focus: ${process.env.OPENWIKI_FOCUS}` : "";
const prompt =
  process.env.OPENWIKI_PROMPT ||
  `Use the openwiki-docs skill in this repository and run in ${mode} mode.${focus}

Constraints:
- Read repository files and git history before writing docs.
- Write documentation under openwiki/ and update top-level agent guidance files only if the skill calls for it.
- Do not edit application source files.
- Use the runtime clock for openwiki/.last-update.json updatedAt.
- Run a quick verification with generated file listing, relative link sanity, and git status/diff.
- Finish with a short summary of generated files and verification.`;

const payload = {
  workspace: {
    kind: "LocalWorkspace",
    working_dir: workspace,
  },
  worktree: false,
  confirmation_policy: { kind: "NeverConfirm" },
  initial_message: {
    role: "user",
    content: [{ type: "text", text: prompt }],
    run: true,
  },
  max_iterations: Number(process.env.OPENWIKI_MAX_ITERATIONS || 80),
  stuck_detection: true,
  autotitle: true,
  secrets_encrypted: true,
  agent_settings: agentSettings,
  tags: {
    project: "openwiki",
    surface: "local",
    model: profileName.toLowerCase(),
  },
};

const conversation = await request("/api/conversations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const id = conversation.id || conversation.conversation_id;
const metadata = {
  conversation_id: id,
  conversation_url: `${baseUrl}/conversations/${id}`,
  workspace,
  profile: profile.name,
  model: profile.config.model,
  created_at: new Date().toISOString(),
};

if (process.env.OPENWIKI_RUN_OUTPUT) {
  await writeFile(process.env.OPENWIKI_RUN_OUTPUT, `${JSON.stringify(metadata, null, 2)}\n`);
}

console.log(JSON.stringify(metadata, null, 2));
