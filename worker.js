/**
 * RootSys Quota CORS Proxy — Cloudflare Worker
 *
 * RootSys's /v1/quota endpoint runs a strict origin allowlist (it only echoes
 * Access-Control-Allow-Origin for localhost and its own domain), so the browser
 * page cannot call it cross-origin. This Worker performs the request
 * server-to-server — where CORS does not apply — and returns the JSON with the
 * correct CORS headers for the allowed browser origins only.
 *
 * Deploy: paste this into the Worker editor at Cloudflare and click Deploy.
 * Then set QUOTA_ENDPOINT in index.html to this Worker's URL.
 *
 * NOTE: This Worker is a transparent proxy. It forwards the Authorization
 * header supplied by the caller; it does not store or log API keys.
 */

// Origin lock-down: only these browser origins may call this Worker.
// Adjust to match your deployment. Keep localhost entries for local testing.
const ALLOWED_ORIGINS = [
  'https://techdirectt.github.io',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000',
];

const UPSTREAM_URL = 'https://rootsys.cloud/v1/quota';

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  // Only advertise the origin if it is explicitly allowed.
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
    const allowed = !origin || ALLOWED_ORIGINS.includes(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      // Reject disallowed origins outright; no CORS headers means the browser
      // will block the response.
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'GET') {
      return json({ message: 'Method not allowed' }, 405, origin);
    }

    // Block disallowed browser origins before touching the upstream API.
    if (!allowed) {
      return json({ message: 'Origin not allowed' }, 403, origin);
    }

    const auth = request.headers.get('Authorization');
    if (!auth) {
      return json({ message: 'Missing Authorization header' }, 401, origin);
    }

    let upstream;
    try {
      upstream = await fetch(UPSTREAM_URL, {
        method: 'GET',
        headers: { 'Authorization': auth, 'Accept': 'application/json' },
      });
    } catch (err) {
      return json({ message: 'Upstream request failed' }, 502, origin);
    }

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
