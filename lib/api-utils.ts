// lib/cors.ts

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const DEFAULT_PROD_ORIGINS = [
  "https://nwtailormadestudio.vercel.app",
  "https://nwtailormadestudioadmin.vercel.app",
];

const isProd = process.env.NODE_ENV === "production";

// 🔹 Parse env
function parseOrigins(env?: string) {
  if (!env) return [];
  if (env.trim() === "*") return ["*"]; // ⭐ support wildcard
  return env.split(",").map((o) => o.trim()).filter(Boolean);
}

const ENV_ORIGINS = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);

// 🔹 Detect allow-all
const ENV_ALLOW_ALL = ENV_ORIGINS.includes("*");

// 🔹 Final origins
const ALLOWED_ORIGINS =
  ENV_ALLOW_ALL
    ? ["*"]
    : ENV_ORIGINS.length
    ? ENV_ORIGINS
    : isProd
    ? DEFAULT_PROD_ORIGINS
    : DEFAULT_DEV_ORIGINS;

// 🔹 Check origin
function isOriginAllowed(origin: string | null) {
  if (!origin) return false;

  if (ENV_ALLOW_ALL) return true;

  return ALLOWED_ORIGINS.includes(origin);
}

// =====================================================
// 🔥 MAIN HEADERS
// =====================================================

export function getCorsHeaders(
  origin: string | null,
  methods = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
) {
  const allowAll = ENV_ALLOW_ALL;
  const allowed = isOriginAllowed(origin);

  let finalOrigin = "null";

  if (allowAll) {
    // ⚠️ If credentials = true → cannot use "*"
    finalOrigin = origin || "*";
  } else if (allowed) {
    finalOrigin = origin!;
  }

  return {
    "Access-Control-Allow-Origin": finalOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}



export function optionsResponse(origin: string | null) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function corsResponse(
  data: unknown,
  origin: string | null,
  status = 200
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin),
    },
  });
}

export function errorResponse(
  message: string,
  origin: string | null,
  status = 500
) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin),
    },
  });
}