# GPT-5.5 x402 Gateway

Remote MCP and OpenAI-compatible GPT-5.5 gateway with x402 USDC settlement on Base.

The service is built for agent buyers that need low-cost GPT-5.5 calls, deterministic utility tools, and ready-to-use x402/MCP/Bazaar integration resources.

## Public Endpoints

- Service: `https://gpt55.558686.xyz`
- MCP Streamable HTTP: `https://gpt55.558686.xyz/mcp`
- MCP SSE discovery: `https://gpt55.558686.xyz/mcp/sse`
- MCP config: `https://gpt55.558686.xyz/mcp/config`
- MCP server metadata: `https://gpt55.558686.xyz/server.json`
- x402 discovery: `https://gpt55.558686.xyz/.well-known/x402`
- OpenAPI: `https://gpt55.558686.xyz/openapi.json`
- Pricing: `https://gpt55.558686.xyz/pricing.json`
- Buyer guide: `https://gpt55.558686.xyz/buyer-guide.json`

## Market Positioning

- Compact GPT-5.5 entry request: `$0.0001`, or 10,000 compact requests per `$1`.
- Long GPT-5.5 request: `$0.002134`, up to 4096 output tokens.
- True max-output GPT-5.5 request: `$0.066667`, up to 128000 output tokens.
- Utility tools: from `$0.0001`.
- x402/MCP/Bazaar integration kits: paid deterministic endpoints for buyers and sellers that need copy-paste-ready integration payloads.
- Public x402 API listings commonly use per-call pricing around `$0.001-$0.01`; lead with the `$0.0001` compact endpoint for trials, then route larger buyers to `/v1/chat/completions/long` and `/v1/chat/completions/max`.
- Gross revenue per 1M output tokens is about `$0.521` across the proportional chat tiers.
- Upto-capable x402 clients can use token-metered settlement based on actual GPT-5.5 response usage, with a `$0.0001` minimum and the selected tier price as the cap.
- Token-metered target prices at 70%+ gross margin: input about `$0.0557 / 1M tokens`, cached input about `$0.0056 / 1M tokens`, output about `$0.334 / 1M tokens`.

Live quotes from `https://gpt55.558686.xyz/pricing.json` and unauthenticated HTTP `402` responses are authoritative. Directory pages can lag behind live x402 quote metadata.

## Tool Surface

The service exposes 92 MCP tools that route to direct x402-paid HTTP endpoints. Tool calls through the MCP facade return the direct endpoint, pricing, x402 discovery links, and example payload. Paid execution happens on the HTTP endpoint with x402 Base USDC or a private Bearer key; the MCP facade does not bypass payment.

Core endpoints include:

- `POST /v1/chat/completions`
- `POST /v1/chat/completions/long`
- `POST /v1/chat/completions/max`
- `POST /v1/tools/summarize`
- `POST /v1/tools/translate`
- `POST /v1/tools/rewrite`
- `POST /v1/tools/answer`
- `POST /v1/tools/code-review`
- `POST /v1/tools/extract-json`
- `POST /v1/tools/x402-mcp-integration-kit`
- `POST /v1/tools/x402-agentcore-integration-kit`
- deterministic utility endpoints for URL metadata, URL text, links, HTTP status, JSON validation, hashing, Base64, timestamps, regex, UUID, and text stats.

## Buyer Smoke Tests

MCP initialize:

```bash
curl -s https://gpt55.558686.xyz/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0.0"}}}'
```

x402 quote:

```bash
curl -i https://gpt55.558686.xyz/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"gpt-5.5","messages":[{"role":"user","content":"Say hi"}],"max_tokens":8}'
```

Expected unauthenticated response: HTTP `402` with a `payment-required` header containing Base USDC x402 payment requirements.

## Local Commands

```powershell
cd D:\gpt55-token-gateway
npm start
npm run smoke
npm run stats
npm run funnel
npm run monitor
```

Start a temporary HTTPS tunnel:

```powershell
D:\gpt55-token-gateway\start-tunnel.ps1
```

Use the `https://...trycloudflare.com` URL as the public base URL.

## Poe API Bot Settings

- `base_url`: tunnel URL, no trailing slash
- `api_type`: `chat_completions_api`
- `model`: `gpt-5.5`
- `api_key`: value of `PUBLIC_API_KEY` in `.env`
- `pricing.prompt`: `0.000005`
- `pricing.completion`: `0.00003`
- `pricing.input_cache_reads`: `0.0000005`
- `context_pricing`: optional; keep the same prices initially until real demand appears.

The gateway only forwards `gpt-5.5` upstream, even if a caller passes another model name.

## Create Poe Bot

1. Open `https://poe.com/api/keys` in a browser where you are logged in.
2. Create/copy a Poe API key.
3. Put it in `.env` as `POE_API_KEY=...`.
4. Run:

```powershell
cd D:\gpt55-token-gateway
npm run poe:create
```

## x402 / USDC Settlement

Set these in `.env` to require on-chain payment for callers that do not use `PUBLIC_API_KEY`:

```text
X402_ENABLED=true
X402_PAY_TO=0xYourBaseUsdcWallet
X402_NETWORK=eip155:8453
X402_PRICE=$0.0001
X402_LONG_PRICE=$0.002134
X402_MAX_PRICE=$0.066667
X402_TOOL_PRICE=$0.0001
X402_PROBE_PRICE=$0.0001
X402_ENABLE_UPTO=true
X402_UPTO_MARGIN=3.34
X402_UPTO_MIN_USD=0.0001
MAX_PAID_OUTPUT_TOKENS=192
MAX_LONG_PAID_OUTPUT_TOKENS=4096
MAX_TRUE_PAID_OUTPUT_TOKENS=128000
```

Restart the gateway after changing `.env`.

Calls with your `PUBLIC_API_KEY` still bypass the paywall, so Poe/private tests keep working.

Current x402 settings:

```text
network: Base mainnet (eip155:8453)
asset: USDC
pay_to: 0x1f0130669ca6fd02e025a984cc038f139df19a2f
compact_chat_price: $0.0001 per compact chat completion request, max 192 output tokens
long_chat_price: $0.002134 per long chat completion request, max 4096 output tokens
max_chat_price: $0.066667 per max-output chat completion request, max 128000 output tokens
tool_price: $0.0001 per tool request
probe_price: $0.0001 per payment probe
facilitator: CDP x402
schemes: exact, upto
upto_margin: 3.34
upto_minimum: $0.0001
```

The lowest-cost x402 proof endpoint is available as both `GET /v1/x402-ping` and `POST /v1/x402-ping`.
It does not call the upstream model.

For callers that support the `upto` payment scheme, chat endpoints settle by actual token usage after the upstream response reports `usage`, with the selected fixed tier price as the maximum charge. Callers that only support `exact` continue to pay the fixed tier price.

Check the payment requirement:

```powershell
cd D:\gpt55-token-gateway
npm run x402:check
```

Dry-run the cheapest payment flow without sending funds:

```powershell
cd D:\gpt55-token-gateway
npm run pay:smoke
```

`pay:smoke` defaults to `X402_PAY_SMOKE_TARGET=ping-get`. Other targets are `ping-post`, `summarize`, and `chat`.
It only sends a real payment when both `X402_PAYER_PRIVATE_KEY` is set and `CONFIRM_X402_PAYMENT=true`.

Monitor the full discovery and settlement funnel:

```powershell
cd D:\gpt55-token-gateway
npm run monitor
```

The monitor writes `logs\monitor.jsonl` and checks:

- public health and discovery endpoints
- x402 402 quote shape and Bazaar extension
- OpenX402 facilitator whitelist status
- OpenX402 and CDP Bazaar discovery indexing
- Base USDC receiver balance
- local quote/settle/completion funnel

Submit to x402-list for manual review after setting an operator email:

```powershell
cd D:\gpt55-token-gateway
$env:X402_LIST_CONTACT_EMAIL="you@example.com"
npm run x402list:submit
```

Submit the public discovery URLs to IndexNow-capable search engines:

```powershell
cd D:\gpt55-token-gateway
npm run indexnow:submit
```

The gateway serves the IndexNow key at `/<key>.txt`. Set `INDEXNOW_KEY` only if you need a custom stable key; otherwise a deterministic public key is generated from the site URL and pay-to address.

OpenX402 discovery is not only a website crawl. The pay-to address must be accepted by the facilitator, and Bazaar-style discovery normally appears after a successful x402 settlement has carried the resource metadata.

## Logs

Usage logs are written to:

```text
D:\gpt55-token-gateway\logs\usage.jsonl
```

Estimate revenue and cost from the local usage log:

```powershell
cd D:\gpt55-token-gateway
npm run stats
```
