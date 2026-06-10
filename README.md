# GPT-5.5 x402 Gateway

Remote MCP and OpenAI-compatible GPT-5.5 gateway with x402 USDC settlement on Base.

## Endpoints

- Service: https://gpt55.558686.xyz
- MCP Streamable HTTP: https://gpt55.558686.xyz/mcp
- MCP SSE discovery: https://gpt55.558686.xyz/mcp/sse
- MCP config: https://gpt55.558686.xyz/mcp/config
- MCP server metadata: https://gpt55.558686.xyz/server.json
- x402 discovery: https://gpt55.558686.xyz/.well-known/x402
- OpenAPI: https://gpt55.558686.xyz/openapi.json
- Pricing: https://gpt55.558686.xyz/pricing.json
- Buyer guide: https://gpt55.558686.xyz/buyer-guide.json

## Pricing

- Compact GPT-5.5 chat: `$0.0001`, up to 192 output tokens.
- Long GPT-5.5 chat: `$0.002134`, up to 4096 output tokens.
- Max-output GPT-5.5 chat: `$0.066667`, up to 128000 output tokens.
- GPT text and utility tools: `$0.0001`.
- Settlement: x402 v2, Base USDC, exact and upto schemes.
- Token-metered `upto` clients can authorize the selected tier cap and settle actual reported usage with a `$0.0001` minimum.

## MCP Smoke Test

```bash
curl -s https://gpt55.558686.xyz/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0.0"}}}'

curl -s https://gpt55.558686.xyz/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## x402 Quote Smoke Test

```bash
curl -i https://gpt55.558686.xyz/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"gpt-5.5","messages":[{"role":"user","content":"Say hi"}],"max_tokens":8}'
```

Expected unauthenticated response: HTTP `402` with a `payment-required` header containing Base USDC x402 payment requirements.

## Tool Surface

The service exposes 64 MCP tools that route to x402-paid HTTP endpoints. Tool calls through the MCP facade return the direct HTTP endpoint, pricing, x402 discovery links, and example payload. Paid execution happens on the HTTP endpoint with x402 Base USDC or a private Bearer key; the MCP facade does not bypass payment.

Core tools include:

- `gpt55_chat_completion`
- `gpt55_long_chat_completion`
- `gpt55_max_chat_completion`
- `gpt55_summarize`
- `gpt55_translate`
- `gpt55_rewrite`
- `gpt55_answer`
- `gpt55_code_review`
- `gpt55_extract_json`
- deterministic utility tools for URL metadata, URL text, links, HTTP status, JSON validation, hashing, Base64, timestamps, regex, UUID, and text stats.

## Contact

Contact: gaishibai@gmail.com
