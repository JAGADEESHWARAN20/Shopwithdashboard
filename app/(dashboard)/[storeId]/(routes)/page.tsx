"use client"; // Ensure it's a client component

import { CreditCard, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Heading } from "../../../../components/ui/heading";
import { formatter } from "../../../../lib/utils";
import React, { useEffect, useState } from "react";
import { Separator } from "../../../../components/ui/separator";
import { getTotalRevenue } from "../../../../actions/get-total-revenue"; // Server function
import { getSalesCount } from "../../../../actions/get-sales-count";
import { getStockCount } from "../../../../actions/get-stock-count";
import { Component, DateRangeType } from "../../../../components/DateRange";
import GraphDisplay from "../../../../components/GraphArea";


interface DashboardPageProps {
    params: { storeId: string };
}

const DashboardPage: React.FC<DashboardPageProps> = ({ params }) => {
    const [dateRange, setDateRange] = useState<DateRangeType | undefined>(undefined);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalStocks, setTotalStocks] = useState(0);
    const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);

    useEffect(() => {
        const fetchData = async () => {
            if (typeof window === "undefined") return; // Prevent execution on the server

            let startDate: Date | null = dateRange?.from || null;
            let endDate: Date | null = dateRange?.to || null;

            console.log("Date Range:", dateRange);

            const revenue = await getTotalRevenue(params.storeId, startDate, endDate);
            const sales = await getSalesCount(params.storeId, startDate, endDate);
            const stocks = await getStockCount(params.storeId);

            console.log("Total Revenue:", revenue);
            console.log("Total Sales:", sales);
            console.log("Total Stocks:", stocks);

            setTotalRevenue(revenue);
            setTotalSales(sales);
            setTotalStocks(stocks);
        };

        fetchData();
    }, [dateRange, params.storeId]);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-col">
            <div className={`p-${viewportWidth < 340 ? "4" : viewportWidth < 1024 ? "3" : "8"} sm:flex sm:flex-col sm:gap-2 pt-6 pb-2`}>
                <div className="flex flex-row sm:flex-row justify-between items-center  gap-4">
                    <Heading title="Dashboard" description="Overview of your store" />
                    <Component onDateChange={setDateRange} />
                </div>
                <Separator className="mt-2 mb-2" />
                <div className="grid gap-4 pb-2 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{formatter.format(totalRevenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sales</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">+{totalSales}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Product in stock</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{totalStocks}</div>
                        </CardContent>
                    </Card>
                </div>
                <Separator className="mt-2 mb-2" />
                <GraphDisplay dateRange={dateRange} storeId={params.storeId} />
            </div>
        </div>
    );
};

export default DashboardPage;
