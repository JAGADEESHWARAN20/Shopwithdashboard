"use client";

import { create } from "zustand";

type RouteLoaderState = {
  isLoading: boolean;
  start: () => void;
  stop: () => void;
};

export const useRouteLoader = create<RouteLoaderState>((set) => ({
  isLoading: false,
  start: () => set({ isLoading: true }),
  stop: () => set({ isLoading: false }),
}));
