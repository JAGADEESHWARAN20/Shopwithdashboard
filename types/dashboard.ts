export interface DashboardTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  bookings: number;
}

export interface BookingRegionPoint {
  region: string;
  bookings: number;
  customers: number;
  revenue: number;
}

export interface DashboardAnalytics {
  revenue: number;
  orders: number;
  bookings: number;
  trends: DashboardTrendPoint[];
  bookingRegions: BookingRegionPoint[];
}
