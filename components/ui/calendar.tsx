"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Define the CalendarProps type based on DayPicker props
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "flex flex-col sm:flex-row gap-4",
    month: "w-full",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell:
      "text-muted-foreground rounded-md w-9 h-9 p-0 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "relative focus-within:relative text-sm p-0 focus-within:z-20",
    day: "h-9 w-9 group rounded-full focus-within:bg-accent text-center focus:z-10 focus:outline-none",
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "text-muted-foreground opacity-50",
    day_disabled: "text-muted-foreground opacity-50 line-through",
    day_range_start: "rounded-l-full",
    day_range_end: "rounded-r-full",
    day_hidden: "invisible",
  };

  const mergedClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
          defaultClassNames[key as keyof typeof defaultClassNames],
          classNames[key as keyof typeof classNames]
        )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as Record<string, string>
  );

  const defaultComponents = {
    ChevronLeftButton: (props: any) => (
      <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden="true" />
    ),
    ChevronRightButton: (props: any) => (
      <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden="true" />
    ),
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
