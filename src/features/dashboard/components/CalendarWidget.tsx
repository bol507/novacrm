import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const events = [
  {
    id: 1,
    title: "Reunión con cliente ABC",
    time: "10:00 - 11:00",
    type: "meeting",
    location: "Sala Virtual",
  },
  {
    id: 2,
    title: "Presentación de propuesta",
    time: "14:00 - 15:30",
    type: "presentation",
    location: "Oficina Central",
  },
  {
    id: 3,
    title: "Seguimiento de ventas",
    time: "16:00 - 16:30",
    type: "call",
    location: "Llamada",
  },
];

const eventColors = {
  meeting: "border-l-primary bg-primary/5",
  presentation: "border-l-accent bg-accent/5",
  call: "border-l-info bg-info/5",
};

const CalendarWidget = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthYear = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold capitalize">
            {monthYear}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Calendar */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              disabled={!day}
              className={cn(
                "aspect-square text-sm rounded-md flex items-center justify-center transition-colors",
                !day && "invisible",
                day && "hover:bg-muted",
                isToday(day) && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Today's Events */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground mb-3">Eventos de hoy</h4>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "p-3 rounded-lg border-l-4",
                  eventColors[event.type as keyof typeof eventColors]
                )}
              >
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
