"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { es } from "date-fns/locale"

interface DatePickerProps {
  value?: string | null
  onChange?: (date: string | null) => void
  placeholder?: string
}


export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  
  const dateValue = value ? new Date(value) : undefined

  
  const handleDateSelect = (date?: Date) => {
    if (date) {
      const isoDate = date.toISOString().split('T')[0]
      onChange?.(isoDate)
    } else {
      onChange?.(null)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(new Date(value), "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}