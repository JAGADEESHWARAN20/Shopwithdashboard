"use client";

import { brandTheme } from "@/lib/brand-theme";
import { DashboardAnalytics } from "@/types/dashboard";
import { create } from "zustand";

type DateInput = Date | string | null | undefined;

type DashboardAnalyticsCacheEntry = {
  data?: DashboardAnalytics;
  error?: string;
  fetchedAt: number;
  loading: boolean;
};

type FetchAnalyticsInput = {
  storeId: string;
  startDate?: DateInput;
  endDate?: DateInput;
  force?: boolean;
};

type DashboardAnalyticsState = {
  activeKey: string | null;
  cache: Record<string, DashboardAnalyticsCacheEntry>;
  fetchAnalytics: (input: FetchAnalyticsInput) => Promise<DashboardAnalytics | undefined>;
  resetAnalytics: () => void;
};

const inFlightRequests = new Map<string, Promise<DashboardAnalytics>>();

const serializeDate = (value: DateInput) => {
  if (!value) {
    return "auto";
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "auto" : date.toISOString().slice(0, 10);
};

export const getDashboardAnalyticsCacheKey = ({
  storeId,
  startDate,
  endDate,
}: Omit<FetchAnalyticsInput, "force">) =>
  [storeId, serializeDate(startDate), serializeDate(endDate)].join(":");

export const useDashboardAnalyticsStore = create<DashboardAnalyticsState>((set, get) => ({
  activeKey: null,
  cache: {},
  fetchAnalytics: async ({ storeId, startDate, endDate, force = false }) => {
    const key = getDashboardAnalyticsCacheKey({ storeId, startDate, endDate });
    const current = get().cache[key];
    const isFresh =
      current?.data && Date.now() - current.fetchedAt < brandTheme.dashboard.requestTtlMs;

    if (!force && isFresh) {
      set({ activeKey: key });
      return current.data;
    }

    set((state) => ({
      activeKey: key,
      cache: {
        ...state.cache,
        [key]: {
          ...state.cache[key],
          error: undefined,
          fetchedAt: state.cache[key]?.fetchedAt ?? 0,
          loading: true,
        },
      },
    }));

    let request = inFlightRequests.get(key);

    if (!request) {
      request = fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          storeId,
          startDate: startDate ?? null,
          endDate: endDate ?? null,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Unable to load dashboard analytics.");
        }

        return (await response.json()) as DashboardAnalytics;
      });

      inFlightRequests.set(key, request);
    }

    try {
      const data = await request;

      set((state) => ({
        activeKey: key,
        cache: {
          ...state.cache,
          [key]: {
            data,
            error: undefined,
            fetchedAt: Date.now(),
            loading: false,
          },
        },
      }));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard analytics.";

      set((state) => ({
        cache: {
          ...state.cache,
          [key]: {
            ...state.cache[key],
            error: message,
            fetchedAt: state.cache[key]?.fetchedAt ?? 0,
            loading: false,
          },
        },
      }));

      return undefined;
    } finally {
      if (inFlightRequests.get(key) === request) {
        inFlightRequests.delete(key);
      }
    }
  },
  resetAnalytics: () => set({ activeKey: null, cache: {} }),
}));
