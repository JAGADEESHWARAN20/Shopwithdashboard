"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
     endOfMonth,
     endOfYear,
     startOfMonth,
     startOfYear,
     subDays,
     subMonths,
     subYears,
} from "date-fns";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";

// Define your DateRange type
export type DateRangeType = DateRange | undefined;

interface ComponentProps {
     onDateChange: (dateRange: DateRangeType) => void;
}

function Component({ onDateChange }: ComponentProps) {
     const today = new Date();
     const yesterday = { from: subDays(today, 1), to: subDays(today, 1) };
     const last7Days = { from: subDays(today, 6), to: today };
     const last30Days = { from: subDays(today, 29), to: today };
     const monthToDate = { from: startOfMonth(today), to: today };
     const lastMonth = {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
     };
     const yearToDate = { from: startOfYear(today), to: today };
     const lastYear = {
          from: startOfYear(subYears(today, 1)),
          to: endOfYear(subYears(today, 1)),
     };

     const [month, setMonth] = useState(today);
     const [date, setDate] = useState<DateRange | undefined>(last7Days);
     const [isSingleDateMode, setIsSingleDateMode] = useState(false);
     const [displayedValue, setDisplayedValue] = useState(0); // For displaying calculated value

     // Function to calculate the value based on the selected date range or single date
     // Define the types for the parameter
     const calculateValue = (dateRangeOrSingleDate: DateRange | Date) => {
          let value = 0;

          if ("from" in dateRangeOrSingleDate && "to" in dateRangeOrSingleDate) {
               // Ensure dateRange.to is defined
               const dateRange = dateRangeOrSingleDate as DateRange;
               const validFrom = dateRange.from ?? today; // fallback to today if `from` is undefined
               const validTo = dateRange.to ?? today; // fallback to today if `to` is undefined

               // Only loop if dateRange.to is defined
               for (let day = new Date(validFrom); day <= validTo; day.setDate(day.getDate() + 1)) {
                    value += getSalesForDate(new Date(day));
               }
          } else if (dateRangeOrSingleDate instanceof Date) {
               value = getSalesForDate(dateRangeOrSingleDate);
          }

          setDisplayedValue(value); // Update the displayed value
     };

     // Ensure date is defined before passing to functions
     useEffect(() => {
          if (date) {
               calculateValue(date); // Only call if date is defined
          }
     }, [date]);

     // Placeholder function to get sales for a date (replace with your data)
     const getSalesForDate = (date: Date) => {
          // Replace with your data fetching logic, currently returning random numbers
          return Math.floor(Math.random() * 20); // Random sales example
     };

     useEffect(() => {
          if (date) {
               calculateValue(date); // Recalculate when date changes
               onDateChange(date); // Notify parent of the date change
          }
     }, [date, onDateChange]);

     // Handle preset date selection
     const handlePresetClick = (newDate: DateRange) => {
          setDate(newDate);
          if (newDate.to) {
               setMonth(newDate.to);
          }
          calculateValue(newDate); // Recalculate the value for the new date range
     };

     return (
          <div>
               <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="outline">
                              {date?.from && date?.to
                                   ? `${new Intl.DateTimeFormat("en-GB").format(date.from)} - ${new Intl.DateTimeFormat("en-GB").format(date.to)}`
                                   : "Pick a date range"}
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mr-4 mt-2">
                         <div className="rounded-lg border border-border">
                              <div className="flex max-sm:flex-col">
                                   <div className="relative border-border py-4 max-sm:order-1 max-sm:border-t sm:w-32">
                                        <div className="h-full border-border sm:border-e">
                                             <div className="flex flex-col px-2">
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick({ from: today, to: today })}
                                                  >
                                                       Today
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(yesterday)}
                                                  >
                                                       Yesterday
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(last7Days)}
                                                  >
                                                       Last 7 days
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(last30Days)}
                                                  >
                                                       Last 30 days
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(monthToDate)}
                                                  >
                                                       Month to date
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(lastMonth)}
                                                  >
                                                       Last month
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(yearToDate)}
                                                  >
                                                       Year to date
                                                  </Button>
                                                  <Button
                                                       variant="ghost"
                                                       size="sm"
                                                       className="w-full justify-start"
                                                       onClick={() => handlePresetClick(lastYear)}
                                                  >
                                                       Last year
                                                  </Button>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="flex flex-col items-end px-3 py-2">
                                        <Switch
                                             checked={isSingleDateMode}
                                             onCheckedChange={() => setIsSingleDateMode(!isSingleDateMode)}
                                        />
                                        {isSingleDateMode ? (
                                             <Calendar
                                                  mode="single"
                                                  selected={date?.from ?? today} // fallback to today if undefined
                                                  onSelect={(selectedDate) => {
                                                       if (selectedDate) {
                                                            setDate({ from: selectedDate, to: selectedDate });
                                                            setMonth(selectedDate);
                                                            calculateValue(selectedDate); // Recalculate for single date
                                                       }
                                                  }}
                                                  month={month}
                                                  onMonthChange={setMonth}
                                                  className="p-2 bg-background"
                                                  disabled={[{ after: today }]}
                                             />
                                        ) : (
                                             <Calendar
                                                  mode="range"
                                                  selected={date}
                                                  onSelect={(newDate: DateRange | undefined) => {
                                                       if (newDate) {
                                                            if (newDate.to) {
                                                                 setMonth(newDate.to);
                                                            }
                                                            setDate(newDate);
                                                            calculateValue(newDate); // Recalculate for range
                                                       } else {
                                                            const fallbackDate = { from: today, to: today };
                                                            setDate(fallbackDate);
                                                            calculateValue(fallbackDate);
                                                       }
                                                  }}
                                                  month={month}
                                                  onMonthChange={setMonth}
                                                  className="p-2 bg-background"
                                                  disabled={[{ after: today }]}
                                             />
                                        )}
                                   </div>
                              </div>
                         </div>
                    </PopoverContent>
               </Popover>
          </div>
     );
}

export { Component };
