import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";
import type { TimePeriod } from "../types/dashboard";
import { useActivityData } from "../hooks/useActivityData";

const periods: { label: string; value: TimePeriod }[] = [
  { label: "7 días", value: "7days" },
  { label: "30 días", value: "30days" },
  { label: "90 días", value: "90days" },
  { label: "12 meses", value: "12months" },
];

const ActivityChart = () => {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>("12months");
  const { data, isLoading, error, isFetching } = useActivityData(activePeriod);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resumen de Actividad</CardTitle>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {periods.map((p) => (
              <Button key={p.value} variant="ghost" size="sm" disabled className="text-xs px-3 h-7">
                {p.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground text-center">
            Error al cargar datos del gráfico<br />
            <Button variant="link" className="p-0 h-auto" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.data || [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Resumen de Actividad
        </CardTitle>
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant="ghost"
              size="sm"
              onClick={() => setActivePeriod(period.value)}
              className={cn(
                "text-xs px-3 h-7",
                activePeriod === period.value &&
                  "bg-background shadow-sm text-foreground"
              )}
              disabled={isFetching}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={(value) => 
                  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number, name: string) => [
                  name === 'ventas' 
                    ? `$${value.toLocaleString('es-PA')}` 
                    : value.toLocaleString('es-PA'),
                  name === 'ventas' ? 'Ventas' : 'Leads'
                ]}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground ml-4">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVentas)"
                name="Ventas"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
                name="Leads"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary totals */}
        {data?.summary && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Ventas</p>
              <p className="text-2xl font-bold text-primary">
                ${data.summary.totalSales.toLocaleString('es-PA')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-accent">
                {data.summary.totalLeads.toLocaleString('es-PA')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityChart;