"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
};

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  );

  const days = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDate = (day: Date) => {
    if (disabled?.(day)) return;
    onSelect?.(day);
  };

  return (
    <div className={cn("w-full p-3", className)}>
      <div className="flex items-center justify-between space-x-2 pb-4">
        <h3 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="space-x-1">
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDisabled = disabled?.(day);

          return (
            <Button
              key={day.toString()}
              variant="ghost"
              className={cn(
                "h-9 w-full p-0 font-normal",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isDisabled && "pointer-events-none opacity-50"
              )}
              disabled={isDisabled}
              onClick={() => handleSelectDate(day)}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>
                {format(day, "d")}
              </time>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
