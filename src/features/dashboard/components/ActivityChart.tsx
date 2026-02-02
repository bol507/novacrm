import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

const data = [
  { name: "Ene", ventas: 4000, leads: 2400, oportunidades: 1800 },
  { name: "Feb", ventas: 3000, leads: 1398, oportunidades: 2200 },
  { name: "Mar", ventas: 2000, leads: 9800, oportunidades: 2900 },
  { name: "Abr", ventas: 2780, leads: 3908, oportunidades: 2500 },
  { name: "May", ventas: 1890, leads: 4800, oportunidades: 2100 },
  { name: "Jun", ventas: 2390, leads: 3800, oportunidades: 2800 },
  { name: "Jul", ventas: 3490, leads: 4300, oportunidades: 3200 },
  { name: "Ago", ventas: 4200, leads: 5100, oportunidades: 3800 },
  { name: "Sep", ventas: 5100, leads: 4800, oportunidades: 4100 },
  { name: "Oct", ventas: 4800, leads: 5200, oportunidades: 4500 },
  { name: "Nov", ventas: 5500, leads: 5800, oportunidades: 4800 },
  { name: "Dic", ventas: 6200, leads: 6100, oportunidades: 5200 },
];

const periods = ["7 días", "30 días", "90 días", "12 meses"];

const ActivityChart = () => {
  const [activePeriod, setActivePeriod] = useState("12 meses");

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Resumen de Actividad
        </CardTitle>
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {periods.map((period) => (
            <Button
              key={period}
              variant="ghost"
              size="sm"
              onClick={() => setActivePeriod(period)}
              className={cn(
                "text-xs px-3 h-7",
                activePeriod === period &&
                  "bg-background shadow-sm text-foreground"
              )}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVentas)"
                name="Ventas"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
                name="Leads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Ventas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Leads</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
