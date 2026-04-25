"use client";

import { brandTheme, type BrandTheme } from "@/lib/brand-theme";
import { createContext, ReactNode, useContext, useMemo } from "react";

const BrandThemeContext = createContext<BrandTheme>(brandTheme);

export function BrandProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => brandTheme, []);

  return <BrandThemeContext.Provider value={value}>{children}</BrandThemeContext.Provider>;
}

export function useBrandTheme() {
  return useContext(BrandThemeContext);
}
