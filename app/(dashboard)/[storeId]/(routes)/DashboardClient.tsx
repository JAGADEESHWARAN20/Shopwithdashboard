"use client";

import { CreditCard, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Heading } from "../../../../components/ui/heading";
import { formatter } from "../../../../lib/utils";
import React, { useEffect, useState } from "react";
import { Separator } from "../../../../components/ui/separator";
import { Component, DateRangeType } from "../../../../components/DateRange";
import GraphDisplay from "../../../../components/GraphArea";

interface DashboardClientProps {
  storeId: string; // ✅ clean prop
}

const DashboardPage: React.FC<DashboardClientProps> = ({ storeId }) => {
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalStocks, setTotalStocks] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1024);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = dateRange?.from || null;
      const endDate = dateRange?.to || null;

      try {
        const res = await fetch("/api/dashboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId, // ✅ FIXED
            startDate,
            endDate,
          }),
        });

        const data = await res.json();

        setTotalRevenue(data.revenue || 0);
        setTotalSales(data.sales || 0);
        setTotalStocks(data.stocks || 0);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchData();
  }, [dateRange, storeId]); // ✅ FIXED

  useEffect(() => {
    setViewportWidth(window.innerWidth);

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col">
      <div
        className={`p-${
          viewportWidth < 340 ? "4" : viewportWidth < 1024 ? "3" : "8"
        } sm:flex sm:flex-col sm:gap-2 pt-6 pb-2`}
      >
        <div className="flex flex-row justify-between items-center gap-4">
          <Heading title="Dashboard" description="Overview of your store" />
          <Component onDateChange={setDateRange} />
        </div>

        <Separator className="mt-2 mb-2" />

        <div className="grid gap-4 pb-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">+{totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Product in stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{totalStocks}</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mt-2 mb-2" />

        <GraphDisplay
          dateRange={dateRange}
          storeId={storeId} // ✅ FIXED
        />
      </div>
    </div>
  );
};

export default DashboardPage;