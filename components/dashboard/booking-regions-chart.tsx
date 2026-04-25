"use client";

import { BookingRegionPoint } from "@/types/dashboard";
import { useBrandTheme } from "@/Providers/brand-provider";
import { formatter } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BookingRegionsChartProps {
  data: BookingRegionPoint[];
}

const RegionsTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BookingRegionPoint }[];
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0].payload;

  return (
    <div className="rounded-xl border bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-slate-900">{entry.region}</p>
      <p className="mt-1 text-slate-600">Bookings: {entry.bookings}</p>
      <p className="text-slate-600">Customers: {entry.customers}</p>
      <p className="text-slate-600">Pipeline: {formatter.format(entry.revenue)}</p>
    </div>
  );
};

export function BookingRegionsChart({ data }: BookingRegionsChartProps) {
  const { colors } = useBrandTheme();
  const topRegion = data[0];
  const barColors = [colors.primary, colors.blue, colors.teal, colors.gold, colors.ink];

  return (
    <Card className="border-[#F29F67]/20 bg-white shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl text-[var(--brand-ink)]">Top booking regions</CardTitle>
          {topRegion ? (
            <Badge className="max-w-full truncate bg-black/70 text-black hover:bg-black/70 hover:text-black">
              Top region: {topRegion.region}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-slate-500">
          Ranked by booking demand so you can see where tailoring interest is strongest.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Alert>
            <AlertTitle>No booking regions yet</AlertTitle>
            <AlertDescription>Once customers start placing bookings, their regions will show up here.</AlertDescription>
          </Alert>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#f3d5bd" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="region"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip content={<RegionsTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="bookings" radius={[0, 12, 12, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={entry.region} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
