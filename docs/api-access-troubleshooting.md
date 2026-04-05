# API Access Troubleshooting (Storefront → Admin API)

## Symptom

If browser requests from the storefront domain to the admin domain API return:

- `401 Unauthorized`
- `content-type: text/html`
- `set-cookie: _vercel_sso_nonce=...`

then the request is being blocked by **Vercel Deployment Protection** before your Next.js API route code runs.

## Why this happens

This project exposes API routes under `/api/*`. Those routes are public at the app level (see `middleware.ts` where `/api/(.*)` is treated as a public route), but Vercel protection can still block cross-site requests at the platform edge.

## How to fix in Vercel

For the deployment serving this API (for example `nwtailormadestudioadmin.vercel.app`):

1. Open **Vercel Dashboard → Project → Settings → Deployment Protection**.
2. Disable protection for the environment that serves public API traffic (usually **Production**), or create a dedicated unprotected API project/domain.
3. Keep the admin UI protected by separating admin frontend from public API endpoints if needed.

## Verification checklist

After changing Vercel settings, verify:

- `GET https://<api-domain>/api/<storeId>/design-collections` returns `200` JSON (not HTML).
- Response no longer includes `_vercel_sso_nonce` for normal public API calls.
- CORS origin includes your storefront domain.

## Notes

- This is **not** a Clerk authentication issue for `/api/*` in this repo.
- This is **not** a route handler bug when the response is Vercel HTML with SSO nonce.
- Browser clients cannot safely use Vercel protection bypass secrets.
