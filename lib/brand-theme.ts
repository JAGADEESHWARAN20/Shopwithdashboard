export const brandTheme = {
  colors: {
    primary: "#F29F67",
    ink: "#1E1E2C",
    blue: "#3B8FF3",
    teal: "#34B1AA",
    gold: "#E0B50F",
  },
  dashboard: {
    requestTtlMs: 60_000,
    maxRangeDays: 370,
  },
} as const;

export type BrandTheme = typeof brandTheme;
