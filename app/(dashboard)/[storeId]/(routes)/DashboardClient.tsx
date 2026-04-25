"use client";

import { useBrandTheme } from "@/Providers/brand-provider";
import { BookingRegionsChart } from "@/components/dashboard/booking-regions-chart";
import { TrendsChart } from "@/components/dashboard/trends-chart";
import { Component, DateRangeType } from "@/components/DateRange";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardAnalyticsCacheKey,
  useDashboardAnalyticsStore,
} from "@/hooks/use-dashboard-analytics-store";
import { formatter } from "@/lib/utils";
import { DashboardAnalytics } from "@/types/dashboard";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarRange, ClipboardList, MapPin, RefreshCw, Wallet } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface DashboardClientProps {
  storeId: string;
}

const EMPTY_ANALYTICS: DashboardAnalytics = {
  revenue: 0,
  orders: 0,
  bookings: 0,
  trends: [],
  bookingRegions: [],
};

const panelVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const DashboardPage: React.FC<DashboardClientProps> = ({ storeId }) => {
  const { colors } = useBrandTheme();
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>();
  const fetchAnalytics = useDashboardAnalyticsStore((state) => state.fetchAnalytics);
  const requestKey = useMemo(
    () =>
      getDashboardAnalyticsCacheKey({
        storeId,
        startDate: dateRange?.from ?? null,
        endDate: dateRange?.to ?? null,
      }),
    [dateRange?.from, dateRange?.to, storeId],
  );
  const analyticsEntry = useDashboardAnalyticsStore((state) => state.cache[requestKey]);

  useEffect(() => {
    void fetchAnalytics({
      storeId,
      startDate: dateRange?.from ?? null,
      endDate: dateRange?.to ?? null,
    });
  }, [dateRange?.from, dateRange?.to, fetchAnalytics, storeId]);

  const analytics = analyticsEntry?.data ?? EMPTY_ANALYTICS;
  const loading = analyticsEntry?.loading ?? true;
  const error = analyticsEntry?.error;
  const topRegion = analytics.bookingRegions[0];

  const statCards = [
    {
      label: "Revenue",
      value: formatter.format(analytics.revenue),
      icon: Wallet,
      accent: colors.primary,
      note: "Collected value",
    },
    {
      label: "Orders",
      value: analytics.orders.toString(),
      icon: ClipboardList,
      accent: colors.blue,
      note: "Placed orders",
    },
    {
      label: "Bookings",
      value: analytics.bookings.toString(),
      icon: CalendarRange,
      accent: colors.teal,
      note: "Tailoring requests",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,#fff8f1_0%,#fff_38%,#f7fbff_100%)]">
      <motion.div
        animate="show"
        className="space-y-5 p-4 pb-8 pt-5 md:p-6 xl:p-8"
        initial="hidden"
        transition={{ duration: 0.35, ease: "easeOut", staggerChildren: 0.06 }}
        variants={{
          hidden: {},
          show: {},
        }}
      >
        <motion.div
          className="overflow-hidden rounded-lg border border-[#F29F67]/30 bg-white shadow-sm"
          variants={panelVariants}
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_18rem]">
            <div className="space-y-5 p-5 md:p-6">
              <Badge className="w-fit border-0 bg-black/70 text-black hover:bg-black/70 hover:text-black">
                Tailor command
              </Badge>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <Heading
                  title="Dashboard"
                  description="Track revenue, orders, booking demand, and regional customer movement."
                />
                <div className="shrink-0">
                  <Component onDateChange={setDateRange} />
                </div>
              </div>
              {error ? (
                <Alert className="border-destructive/30 bg-destructive/5">
                  <AlertTitle>Dashboard sync failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </div>
            <div className="flex min-h-44 flex-col justify-between bg-black/70 p-5 text-black md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-black/70">Focus region</span>
                <MapPin className="h-5 w-5 text-[var(--brand-primary)]" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-10 w-36 bg-white/20" />
                ) : (
                  <p className="truncate text-3xl font-semibold tracking-tight">
                    {topRegion?.region ?? "No bookings yet"}
                  </p>
                )}
                <p className="mt-2 text-sm text-black/70">
                  {topRegion
                    ? `${topRegion.bookings} bookings from ${topRegion.customers} customers`
                    : "Regional demand appears once customers book appointments."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" variants={panelVariants}>
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.label}
                className="overflow-hidden border-[#F29F67]/20 bg-white shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {card.label}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
                    </div>
                    <div
                      className="rounded-md p-2 text-black shadow-sm"
                      style={{ backgroundColor: card.accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-9 w-28" />
                  ) : (
                    <div className="flex items-end justify-between gap-3">
                      <div className="text-3xl font-semibold tracking-tight text-[var(--brand-ink)]">
                        {card.value}
                      </div>
                      <ArrowUpRight className="mb-1 h-5 w-5 text-[var(--brand-teal)]" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]" variants={panelVariants}>
          {loading ? (
            <Card className="border-[#F29F67]/20 bg-white shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-[360px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <TrendsChart data={analytics.trends} />
          )}

          {loading ? (
            <Card className="border-[#F29F67]/20 bg-white shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-[360px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <BookingRegionsChart data={analytics.bookingRegions} />
          )}
        </motion.div>

        <motion.div className="grid gap-4 lg:grid-cols-3" variants={panelVariants}>
          <Card className="border-[#F29F67]/20 bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[var(--brand-ink)]">
                <RefreshCw className="h-5 w-5 text-[var(--brand-blue)]" />
                Operations pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                ["Cache TTL", "60 sec"],
                ["Date window", "370 days"],
                ["Data path", "Parallel"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold text-[var(--brand-ink)]">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-0 bg-[var(--brand-gold)] text-[var(--brand-ink)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {formatter.format(topRegion?.revenue ?? 0)}
              </p>
              <p className="mt-2 text-sm text-[#1E1E2C]/75">
                {topRegion?.region ?? "Awaiting region data"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
