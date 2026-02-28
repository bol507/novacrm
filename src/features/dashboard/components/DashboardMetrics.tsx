import { Users, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { Loader2 } from 'lucide-react';
import MetricCard from './MetricCard';

const DashboardMetrics = () => {
  const { data, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 sm:p-6 h-full animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
              <div className="h-12 w-12 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="col-span-4 text-center py-4 text-muted-foreground">
          Error al cargar métricas del dashboard
        </div>
      </div>
    );
  }

  // Calcular cambios porcentuales (simulados - en producción vendrían de la API)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: '+0%', trend: 'up' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      trend: change >= 0 ? 'up' as const : 'down' as const,
    };
  };

  // Datos simulados del mes anterior (reemplazar con datos reales de la API)
  const previousMonth = {
    clients: Math.floor((data?.activeClients || 0) * 0.9),
    sales: (data?.monthlySales || 0) * 0.92,
    quotes: Math.floor((data?.totalQuotes || 0) * 0.85),
    conversion: (data?.conversionRate || 0) * 1.1,
  };

  const stats = [
    {
      title: "Clientes Activos",
      value: data?.activeClients.toLocaleString('es-PA') || '0',
      change: calculateChange(data?.activeClients || 0, previousMonth.clients).value,
      trend: calculateChange(data?.activeClients || 0, previousMonth.clients).trend,
      icon: Users,
      color: "primary" as const,
    },
    {
      title: "Ventas del Mes",
      value: `$${(data?.monthlySales || 0).toLocaleString('es-PA', { minimumFractionDigits: 0 })}`,
      change: calculateChange(data?.monthlySales || 0, previousMonth.sales).value,
      trend: calculateChange(data?.monthlySales || 0, previousMonth.sales).trend,
      icon: DollarSign,
      color: "accent" as const,
    },
    {
      title: "Cotizaciones",
      value: data?.totalQuotes.toLocaleString('es-PA') || '0',
      change: calculateChange(data?.totalQuotes || 0, previousMonth.quotes).value,
      trend: calculateChange(data?.totalQuotes || 0, previousMonth.quotes).trend,
      icon: FileText,
      color: "info" as const,
    },
    {
      title: "Tasa de Conversión",
      value: `${(data?.conversionRate || 0).toFixed(1)}%`,
      change: calculateChange(data?.conversionRate || 0, previousMonth.conversion).value,
      trend: calculateChange(data?.conversionRate || 0, previousMonth.conversion).trend,
      icon: TrendingUp,
      color: "warning" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {stats.map((stat, index) => (
        <MetricCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
};

export default DashboardMetrics;