"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange as DayPickerDateRange } from "react-day-picker"

// Exportar la interfaz DateRange para que esté disponible para otros componentes
export interface DateRange {
  from: Date;
  to?: Date;
}

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange
  setDate: (date: DateRange) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d LLL, y", { locale: es })} -{" "}
                  {format(date.to, "d LLL, y", { locale: es })}
                </>
              ) : (
                format(date.from, "d LLL, y", { locale: es })
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date as DayPickerDateRange}
            onSelect={(selected: DayPickerDateRange | undefined) => {
              if (selected?.from) {
                setDate({
                  from: selected.from,
                  to: selected.to
                });
              }
            }}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}