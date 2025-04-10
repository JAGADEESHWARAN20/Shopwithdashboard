import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://ecommercestore-online.vercel.app",
  "https://kajol-ecommercestore-online.vercel.app",
  "https://your-backend-url.com",
];

export function corsMiddleware(req: NextRequest): NextResponse | undefined {
  const origin = req.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res;
  }

  return NextResponse.json({ message: "Origin not allowed" }, { status: 403 });
}
