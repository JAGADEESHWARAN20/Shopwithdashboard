const DEFAULT_ALLOWED_ORIGINS = [
  "https://nwtailormadestudio.vercel.app",
  "https://nwtailormadestudioadmin.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const parsedAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = parsedAllowedOrigins.length
  ? parsedAllowedOrigins
  : DEFAULT_ALLOWED_ORIGINS;

const ALLOW_ALL_ORIGINS =
  (process.env.CORS_ALLOW_ALL_ORIGINS || "true").toLowerCase() === "true";

export function getCorsHeaders(
  origin: string | null,
  methods = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
) {
  const safeOrigin = origin?.trim() || null;
  const shouldAllowOrigin =
    ALLOW_ALL_ORIGINS || (safeOrigin ? ALLOWED_ORIGINS.includes(safeOrigin) : false);

  return {
    "Access-Control-Allow-Origin": shouldAllowOrigin
      ? safeOrigin || "*"
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Vary": "Origin",
  };
}

export function optionsResponse(origin: string | null) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function corsResponse(data: unknown, origin: string | null, status = 200) {
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
