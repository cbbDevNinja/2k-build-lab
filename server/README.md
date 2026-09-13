# Server-side Protection Setup

This API is the first step to protecting valuable logic by keeping it off the client.

## Why this helps

Browser code can always be downloaded and reverse-engineered. Server logic cannot be directly extracted by page visitors.

## Start

1. Copy env template:

   cp server/.env.example server/.env

2. Install dependencies:

   npm install

3. Run API:

   npm run api:dev

4. Health check:

   curl http://localhost:8787/health

## Endpoint

`POST /api/solver/evaluate`

Example:

curl -X POST http://localhost:8787/api/solver/evaluate \
  -H "content-type: application/json" \
   -d '{"attributes":[85,80,87,60,55,82,86,70,84,86,83,72,85,86,68,60,72,84,82,74,80],"finalAttributes":[85,80,87,60,55,82,86,70,84,86,83,72,85,86,68,60,72,84,82,74,80],"bodyHb":15,"bodyCaps":[99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99]}'

If `REQUIRE_AUTH=true`, pass a Supabase access token:

- Header: `Authorization: Bearer <access_token>`

## Migration plan for real protection

1. Move crown-jewel functions from client files into `server/src/protected/`.
2. Expose only minimal result contracts from API routes.
3. Keep validation/rate limits on every route.
4. Keep server internals private (no source maps, no stack traces in prod).
5. Leave client with UI and request orchestration only.

## Deploy (single service)

This repo can run as one service: static app + API from the same Node server.

1. Set environment variables:

- `NODE_ENV=production`
- `REQUIRE_AUTH=true`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `ALLOWED_ORIGINS=https://your-domain.com`

2. Build/start commands:

- Build: `npm install`
- Start: `npm run api:start`

3. Verify online:

- `GET /` returns the app HTML
- `GET /health` returns `{ ok: true, ... }`
- `POST /api/solver/evaluate` returns `ok: true`

If API and frontend are hosted on different domains, set `API_BASE_URL` in `js/goated-build-lab.web-config.js`.

## Friends-only mode (no app sign-in)

If you do not want app sign-in, but also do not want public access, use a single shared site password.

1. In `server/.env` set:

- `REQUIRE_AUTH=false`
- `REQUIRE_SITE_PASSWORD=true`
- `SITE_USER=<your username>`
- `SITE_PASSWORD=<strong password>`

2. Redeploy/restart server.

3. Visiting `/` will prompt for username/password, and API calls are protected by the same gate.

## 7-day invite codes (recommended)

Use signed invite links that auto-expire in 7 days.

1. In `server/.env` set:

- `REQUIRE_AUTH=false`
- `REQUIRE_INVITE_CODE=true`
- `INVITE_CODE_SECRET=<long random secret>`
- `INVITE_CODE_TTL_DAYS=7`
- `REQUIRE_SITE_PASSWORD=false`

2. Generate a code for a friend:

- `npm run invite:make -- alex 7`

3. Share this link (replace domain and code):

- `https://your-domain.com/unlock?code=<generated-code>`

4. Friend opens link once, gets a cookie, and can use the app until code expiry.

5. To revoke all existing invite sessions immediately, rotate `INVITE_CODE_SECRET` and redeploy.
