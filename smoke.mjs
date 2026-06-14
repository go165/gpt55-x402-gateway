const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";

async function assertOk(name, fn) {
  try {
    await fn();
    console.log(`${name}=ok`);
  } catch (error) {
    console.error(`${name}=failed`);
    console.error(error);
    process.exitCode = 1;
  }
}

await assertOk("health", async () => {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new Error(`health status ${response.status}`);
  const payload = await response.json();
  if (payload.status !== "ok") throw new Error("health payload mismatch");
});

await assertOk("server_json", async () => {
  const response = await fetch(`${baseUrl}/server.json`);
  if (!response.ok) throw new Error(`server.json status ${response.status}`);
  const payload = await response.json();
  if (payload.name !== "xyz.558686.gpt55/token-gateway") throw new Error("server.json name mismatch");
});

await assertOk("mcp_initialize", async () => {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "local-smoke", version: "1.0.0" },
      },
    }),
  });
  if (!response.ok) throw new Error(`initialize status ${response.status}`);
  const payload = await response.json();
  if (payload.jsonrpc !== "2.0" || !payload.result) throw new Error("initialize payload mismatch");
});

await assertOk("mcp_tools_list", async () => {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
  });
  if (!response.ok) throw new Error(`tools/list status ${response.status}`);
  const payload = await response.json();
  const tools = payload.result?.tools;
  if (!Array.isArray(tools) || tools.length < 1) throw new Error("tools/list returned no tools");
});
