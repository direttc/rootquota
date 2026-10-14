# RootSys Quota & Expiry Checker

A lightweight, client-side web utility built with **HTML**, **Tailwind CSS**, and vanilla **JavaScript** to inspect your API key quota, token consumption, and expiry status from `rootsys.cloud`.

---

## Features

- 🔒 **Client-Side Security**: Your API key is entered in your browser and passed through the proxy to the official endpoint—it is never stored or logged by this app.
- 📊 **Interactive KPI Dashboard**:
  - **Token Consumption** with a visual progress bar.
  - **Tokens Used** with compacted numbers (e.g., `1.27B`, `45.2M`).
  - **Runway** simplified into clean **Days and Hours**.
  - **Remaining (%)** tracker and snapshot timestamps.
- 🎨 **Dark / Light Mode**: Automatically adapts to your system preferences, with a manual toggle that is remembered across reloads.
- 📋 **Raw JSON Inspector**: View and copy the raw API payload instantly.

---

## How to Run Locally

Because modern web browsers enforce CORS security policies on direct `fetch` calls to external domains, opening `index.html` directly with the `file://` protocol may not work. Serve the file over HTTP using one of the methods below.

### Option A: Local Dev Server (Node.js)

```bash
npx serve .
```

Then open the printed URL (typically `http://localhost:3000`).

### Option B: Python Built-in Server

If you have Python installed:

```bash
# Python 3
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

> **CORS note:** The RootSys `/v1/quota` endpoint enforces a strict origin allowlist—it only returns `Access-Control-Allow-Origin` for `localhost` and its own domain. When hosted elsewhere (e.g. GitHub Pages), a direct browser request is blocked. To work around this, the app calls a small **Cloudflare Worker** proxy (see below) that performs the request server-to-server, where CORS does not apply.

---

## Cloudflare Worker Proxy

The Worker source lives in [`worker.js`](worker.js).

### Deploy

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages → Create application → Create Worker**.
2. Name it (e.g. `rootsys-proxy`) and deploy the default template.
3. Click **Edit code**, replace the contents with `worker.js`, and click **Deploy**.
4. Note the Worker URL, e.g. `https://rootsys-proxy.<your-subdomain>.workers.dev`.

### Configure

- Set `QUOTA_ENDPOINT` in `index.html` to your Worker URL.
- Edit `ALLOWED_ORIGINS` in `worker.js` to list the exact browser origins allowed to call the Worker. Only those origins receive CORS headers; all others get a `403` and no CORS headers, so the browser blocks them. Keep the `localhost` entries for local testing.

> The Worker is a transparent proxy: it forwards the caller's `Authorization` header and does not store or log the API key. Requests made by the Worker to the upstream API are not billed by Cloudflare.

---

## API Contract

The tool expects a `GET https://rootsys.cloud/v1/quota` request with a `Bearer` token in the `Authorization` header and a JSON response shaped roughly like:

```json
{
  "status": "active",
  "tokens_total": 2000000000,
  "tokens_used": 512000000,
  "tokens_remaining": 1488000000,
  "active": true,
  "days_remaining": 12,
  "seconds_remaining": 1036800,
  "expires_at": "2026-01-01T00:00:00Z",
  "snapshot_at": "2025-12-20T10:30:00Z"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `status` | string | Account state, e.g. `active`, `depleted`. |
| `tokens_total` | number | Total token allowance. |
| `tokens_used` | number | Tokens consumed so far. |
| `tokens_remaining` | number | Tokens still available. |
| `active` | boolean | Whether the key is currently active. |
| `days_remaining` | number | Whole days until expiry. |
| `seconds_remaining` | number | Seconds until expiry (used for runway). |
| `expires_at` | string (ISO 8601) | Key expiry timestamp. |
| `snapshot_at` | string (ISO 8601) | When the quota snapshot was taken. |

Fields are accessed defensively—missing values render as `--` rather than breaking the page.

---

## Options

- **Show API Key**: Reveals the masked input value.
- **Theme Toggle** (top-right): Switches between dark and light mode; the choice persists via `localStorage`.

---

## Tech Stack

- [Tailwind CSS](https://tailwindcss.com/) (loaded via the CDN for zero-build simplicity)
- Google Fonts — Inter
- Vanilla JavaScript (no framework, no build step)
- [Cloudflare Workers](https://workers.cloudflare.com/) (optional CORS proxy)

> The Tailwind CDN is intended for development/prototyping. For a production deployment, generate a compiled stylesheet via the Tailwind CLI.

---

## License

This project is provided as-is for personal use. Add a license of your choice (e.g., MIT) if you intend to distribute it.
