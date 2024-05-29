# Scott's Fonts

Loads private fonts via Cloudflare KV. This uses cloudflare pages and functions to host and whitelist fonts.

You need a KV namespace connected to your worker, and your font's put into your kv via `wrangler kv:key put --namespace-id YOUR_ID --path LOCALFONTPATH REMOTEFONTPATH`
