import { NextRequest, NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/actions/get-dashboard-analytics";
import { brandTheme } from "@/lib/brand-theme";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.storeId || typeof body.storeId !== "string") {
      return new NextResponse("Missing storeId.", { status: 400 });
    }

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    if (
      (startDate && Number.isNaN(startDate.getTime())) ||
      (endDate && Number.isNaN(endDate.getTime()))
    ) {
      return new NextResponse("Invalid date range.", { status: 400 });
    }

    if (startDate && endDate) {
      const rangeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000);

      if (rangeDays < 0) {
        return new NextResponse("Start date must be before end date.", { status: 400 });
      }

      if (rangeDays > brandTheme.dashboard.maxRangeDays) {
        return new NextResponse("Date range is too large.", { status: 400 });
      }
    }

    const analytics = await getDashboardAnalytics(body.storeId, startDate, endDate);

    return NextResponse.json(analytics, {
      headers: {
        "Cache-Control": "private, max-age=20, stale-while-revalidate=40",
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return new NextResponse("Unable to load dashboard analytics.", { status: 500 });
  }
}
