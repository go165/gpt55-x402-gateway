# Glama Submission Packet

Use this packet to submit `go165/gpt55-x402-gateway` to Glama for the pending awesome-mcp-servers PR review.

## Submission Target

- Glama submit page: `https://glama.ai/mcp/servers`
- Repository: `https://github.com/go165/gpt55-x402-gateway`
- Dockerfile path: `Dockerfile`
- Local MCP endpoint after container start: `http://localhost:3000/mcp`
- Public remote MCP endpoint: `https://gpt55.558686.xyz/mcp`
- Public server metadata: `https://gpt55.558686.xyz/server.json`
- x402 discovery: `https://gpt55.558686.xyz/.well-known/x402`
- Pricing: `https://gpt55.558686.xyz/pricing.json`

## Listing Copy

Title:

```text
GPT-5.5 x402 Gateway
```

Short description:

```text
Remote Streamable HTTP MCP gateway for OpenAI-compatible GPT-5.5 chat, deterministic utility tools, and x402 Base USDC payment discovery.
```

Long description:

```text
GPT-5.5 x402 Gateway exposes a public MCP endpoint and paid HTTP execution endpoints for low-cost GPT-5.5 chat, text utilities, web utilities, JSON helpers, and x402 integration resources. The repository includes a no-secret Docker wrapper that starts locally, proxies to the public remote MCP endpoint, and falls back to MCP introspection responses for directory checks. Paid execution remains on the public x402 HTTP endpoints; the Docker wrapper does not handle private keys, wallet signatures, JWTs, custody, KYC, or payment execution.
```

Tags:

```text
typescript,javascript,cloud-service,x402,base-usdc,mcp,streamable-http
```

## Local Precheck

Run before submitting:

```bash
npm run smoke
```

Expected result:

```text
health=ok
server_json=ok
mcp_initialize=ok
mcp_tools_list=ok
```

Optional Docker command for the Glama form or local validation:

```bash
docker build -t gpt55-x402-gateway .
docker run --rm -p 3000:3000 gpt55-x402-gateway
```

This environment may not allow Docker daemon access. If Docker build fails locally with `/var/run/docker.sock` permission denied, submit the repository anyway; Glama can build from the repository Dockerfile.

## Badge Follow-Up

After Glama creates a public page, verify that this URL no longer returns 404:

```text
https://glama.ai/mcp/servers/go165/gpt55-x402-gateway
```

Then update `punkpeye/awesome-mcp-servers#7782` by adding the score badge immediately after the repository link:

```markdown
[go165/gpt55-x402-gateway](https://github.com/go165/gpt55-x402-gateway) [![go165/gpt55-x402-gateway MCP server](https://glama.ai/mcp/servers/go165/gpt55-x402-gateway/badges/score.svg)](https://glama.ai/mcp/servers/go165/gpt55-x402-gateway) 📇 ☁️ - Remote Streamable HTTP MCP gateway for OpenAI-compatible GPT-5.5 chat and 92 text, web, JSON, and x402 discovery tools. Pay-per-call via x402 Base USDC, with public endpoint at `https://gpt55.558686.xyz/mcp`.
```

## Safety Boundary

Do not paste private keys, seed phrases, wallet signatures, JWTs, session cookies, app passwords, KYC documents, or payment credentials into Glama, GitHub comments, or Codex chat. This submission only uses public repository and public service URLs.
