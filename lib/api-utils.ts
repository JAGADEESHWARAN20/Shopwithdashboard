import { NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://nwtailormadestudioadmin.vercel.app",
  "https://nwtailormadestudio.vercel.app",
];

export const getCorsHeaders = (origin: string | null) => {
  if (!origin) return defaultCors("*");

  if (allowedOrigins.includes(origin)) {
    return defaultCors(origin);
  }

  console.warn("Blocked CORS origin:", origin);
  return defaultCors(origin); // allow temporarily
};

const defaultCors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export const corsResponse = (data: any, origin: string | null, status = 200) => {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(origin),
  });
};

export const errorResponse = (message: string, origin: string | null, status = 500) => {
  return new NextResponse(message, {
    status,
    headers: getCorsHeaders(origin),
  });
};