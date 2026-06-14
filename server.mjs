import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL || "https://gpt55.558686.xyz/mcp";
const REMOTE_BASE_URL = process.env.REMOTE_BASE_URL || "https://gpt55.558686.xyz";

function jsonResponse(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function textResponse(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJsonFile(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function localInitialize(id) {
  return rpcResult(id, {
    protocolVersion: "2025-06-18",
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: "gpt55-x402-gateway",
      title: "GPT-5.5 x402 Gateway",
      version: "1.0.0",
    },
    instructions:
      "This container is a public/read-only Glama compatibility wrapper for the remote GPT-5.5 x402 gateway. Paid execution happens at the public x402 HTTP endpoints, not inside this container.",
  });
}

function localToolsList(id) {
  return rpcResult(id, {
    tools: [
      {
        name: "gpt55_gateway_directory",
        title: "GPT-5.5 x402 Gateway Directory",
        description:
          "Returns public endpoint, pricing, x402 discovery, and buyer-guide links for the remote GPT-5.5 x402 gateway.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    ],
  });
}

function localToolCall(id, params = {}) {
  const name = params.name;
  if (name !== "gpt55_gateway_directory") {
    return rpcError(id, -32602, `Unknown local tool: ${name || ""}`);
  }
  return rpcResult(id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            service: REMOTE_BASE_URL,
            mcp: REMOTE_MCP_URL,
            serverJson: `${REMOTE_BASE_URL}/server.json`,
            x402: `${REMOTE_BASE_URL}/.well-known/x402`,
            pricing: `${REMOTE_BASE_URL}/pricing.json`,
            buyerGuide: `${REMOTE_BASE_URL}/buyer-guide.json`,
            payment: "Base USDC x402; no private keys or wallet signing are handled by this container.",
          },
          null,
          2,
        ),
      },
    ],
  });
}

function localRpc(payload) {
  const id = payload?.id ?? null;
  switch (payload?.method) {
    case "initialize":
      return localInitialize(id);
    case "notifications/initialized":
      return null;
    case "tools/list":
      return localToolsList(id);
    case "tools/call":
      return localToolCall(id, payload.params || {});
    case "resources/list":
      return rpcResult(id, { resources: [] });
    case "prompts/list":
      return rpcResult(id, { prompts: [] });
    default:
      return rpcError(id, -32601, `Method not handled by local wrapper: ${payload?.method || ""}`);
  }
}

async function proxyMcp(body, headers = {}) {
  const response = await fetch(REMOTE_MCP_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": "gpt55-x402-gateway-glama-wrapper/1.0",
      ...headers,
    },
    body,
  });
  return {
    status: response.status,
    contentType: response.headers.get("content-type") || "application/json; charset=utf-8",
    body: await response.text(),
  };
}

async function handleMcp(req, res) {
  if (req.method === "GET") {
    return jsonResponse(res, 200, {
      name: "gpt55-x402-gateway",
      remote_mcp_url: REMOTE_MCP_URL,
      note: "POST JSON-RPC requests here. The wrapper proxies to the public remote MCP endpoint and falls back to local introspection responses.",
    });
  }
  if (req.method !== "POST") {
    return jsonResponse(res, 405, { error: "method_not_allowed" }, { allow: "GET, POST" });
  }
  const body = await readBody(req);
  try {
    const proxied = await proxyMcp(body);
    if (proxied.status >= 200 && proxied.status < 500 && proxied.body) {
      return textResponse(res, proxied.status, proxied.body, proxied.contentType);
    }
  } catch {
    // Glama only needs the container to start and answer introspection. If the
    // public remote endpoint is temporarily unavailable, keep introspection live.
  }

  try {
    const payload = JSON.parse(body || "{}");
    if (Array.isArray(payload)) {
      const results = payload.map(localRpc).filter(Boolean);
      return jsonResponse(res, 200, results);
    }
    const result = localRpc(payload);
    if (result === null) {
      res.writeHead(202, { "cache-control": "no-store" });
      return res.end();
    }
    return jsonResponse(res, 200, result);
  } catch {
    return jsonResponse(res, 400, rpcError(null, -32700, "Invalid JSON"));
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse(res, 200, { status: "ok", mcp: "/mcp", remote: REMOTE_MCP_URL });
    }
    if (url.pathname === "/server.json") {
      return jsonResponse(res, 200, await readJsonFile("./server.json"));
    }
    if (url.pathname === "/mcp" || url.pathname === "/mcp/sse") {
      return handleMcp(req, res);
    }
    return jsonResponse(res, 404, { error: "not_found" });
  } catch (error) {
    return jsonResponse(res, 500, { error: "internal_error", message: String(error?.message || error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`gpt55-x402-gateway wrapper listening on http://${HOST}:${PORT}`);
});
