"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fetchGraphData } from "@/actions/get-graph-action";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     Tooltip,
     CartesianGrid,
} from "recharts";
import { format, differenceInDays, parseISO, addDays } from "date-fns";

interface GraphDisplayProps {
     dateRange: DateRange | Date | undefined;
     storeId: string;
}

// Custom Bar Shape with Rounded Corners
const CustomBarShape = (props: any) => {
     const { x, y, width, height } = props;
     return <rect x={x} y={y} width={width} height={height} fill="#6C4AB6" rx="1" ry="1" />;
};

const GraphDisplay: React.FC<GraphDisplayProps> = ({ dateRange, storeId }) => {
     const [graphData, setGraphData] = useState<{ date: string; value: number }[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [graphHeight, setGraphHeight] = useState(300);
     const [isMonthlyView, setIsMonthlyView] = useState(false);

     // Adjust graph height for responsiveness
     useEffect(() => {
          const updateGraphHeight = () => {
               setGraphHeight(window.innerWidth < 640 ? 220 : window.innerWidth < 1024 ? 280 : 350);
          };
          updateGraphHeight();
          window.addEventListener("resize", updateGraphHeight);
          return () => window.removeEventListener("resize", updateGraphHeight);
     }, []);

     const processGraphData = useCallback(async () => {
          setLoading(true);
          setError(null);

          try {
               const rawData = await fetchGraphData(storeId, dateRange);

               const startDate = dateRange && "from" in dateRange ? new Date(dateRange.from ?? new Date()) : null;
               const endDate = dateRange && "to" in dateRange ? new Date(dateRange.to ?? new Date()) : null;
               if (!startDate || !endDate) {
                    setGraphData([]);
                    return;
               }

               const dateMap = new Map<string, number>();
               rawData.forEach((entry) => {
                    const entryDate = format(parseISO(entry.date), "dd MMM");
                    dateMap.set(entryDate, (dateMap.get(entryDate) || 0) + entry.value);
               });

               const tempData: { date: string; value: number }[] = [];
               let current = startDate;

               while (current <= endDate) {
                    const formattedDate = format(current, "dd MMM");
                    tempData.push({
                         date: formattedDate,
                         value: dateMap.get(formattedDate) || 0,
                    });
                    current = addDays(current, 1);
               }

               setGraphData(tempData);
          } catch (err) {
               setError("Error fetching graph data.");
               console.error(err);
          } finally {
               setLoading(false);
          }
     }, [dateRange, storeId]);

     useEffect(() => {
          processGraphData();
     }, [processGraphData]);

     return (
          <Card className="w-full p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 shadow-lg rounded-xl bg-white dark:bg-gray-900">
               <CardHeader className="text-center md:text-left">
                    <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                         {isMonthlyView ? "Monthly Sales Overview" : "Sales Over Time"}
                    </CardTitle>
               </CardHeader>
               <CardContent className="w-full overflow-hidden p-2 sm:p-3 md:p-4">
                    {loading && (
                         <div className="flex justify-center">
                              <Skeleton className="w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-300 dark:bg-gray-700" />
                         </div>
                    )}
                    {error && (
                         <Alert variant="destructive">
                              <AlertTitle>Error</AlertTitle>
                              <AlertDescription>{error}</AlertDescription>
                         </Alert>
                    )}
                    {!loading && !error && graphData.length > 0 && (
                         <div className="w-full">
                              <ResponsiveContainer width="100%" height={graphHeight}>
                                   <BarChart data={graphData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#374151",opacity:"50%" }} padding={{ left: 10, right: 10 }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#374151", opacity: "50%" }} width={40} />
                                        <Tooltip
                                             wrapperStyle={{ fontSize: "12px" }}
                                             contentStyle={{ backgroundColor: "#fff", borderRadius: "5px", padding: "8px" }}
                                             cursor={{ fill: "rgba(108, 74, 182, 0.1)" }}
                                        />
                                        <Bar dataKey="value" fill="#6C4AB6" barSize={30} shape={<CustomBarShape />} animationDuration={500} />
                                   </BarChart>
                              </ResponsiveContainer>
                         </div>
                    )}
                    {!loading && !error && graphData.length === 0 && (
                         <p className="text-center text-sm text-gray-500">No sales recorded in the selected date range.</p>
                    )}
               </CardContent>
          </Card>
     );
};

export default GraphDisplay;
