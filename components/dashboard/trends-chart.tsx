"use client";

import { DashboardTrendPoint } from "@/types/dashboard";
import { useBrandTheme } from "@/Providers/brand-provider";
import { format, parseISO } from "date-fns";
import { formatter } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendsChartProps {
  data: DashboardTrendPoint[];
}

const TrendsTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string; value?: number; color?: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length || !label) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-slate-900">{format(parseISO(label), "dd MMM yyyy")}</p>
      <div className="space-y-1 text-slate-600">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);
          const labelText =
            entry.dataKey === "revenue"
              ? formatter.format(value)
              : `${value} ${entry.dataKey === "orders" ? "orders" : "bookings"}`;

          return (
            <p key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color ?? "var(--brand-ink)" }}
              />
              <span className="capitalize">{entry.dataKey}</span>
              <span className="ml-auto font-medium text-slate-900">{labelText}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
};

export function TrendsChart({ data }: TrendsChartProps) {
  const { colors } = useBrandTheme();

  return (
    <Card className="border-[#F29F67]/20 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-[var(--brand-ink)]">Revenue, orders and bookings</CardTitle>
        <p className="text-sm text-slate-500">
          A combined view of money collected, orders created, and booking requests over time.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Alert>
            <AlertTitle>No data yet</AlertTitle>
            <AlertDescription>New orders and bookings will appear here once activity starts.</AlertDescription>
          </Alert>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.blue} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={colors.blue} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.teal} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={colors.teal} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3d5bd" />
                <XAxis
                  axisLine={false}
                  dataKey="date"
                  tickFormatter={(value) => format(parseISO(value), "dd MMM")}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip content={<TrendsTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={colors.primary}
                  fill="url(#revenueGradient)"
                  strokeWidth={2.5}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke={colors.blue}
                  fill="url(#ordersGradient)"
                  strokeWidth={2.5}
                  name="Orders"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke={colors.teal}
                  fill="url(#bookingsGradient)"
                  strokeWidth={2.5}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
