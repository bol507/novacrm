import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const bgColor = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    yellow: "bg-yellow-50"
  }[color];

  const iconColor = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600"
  }[color];

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${bgColor} ${iconColor} p-2 rounded-lg`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuoteStatsProps {
  pending: number;
  accepted: number;
  totalValue: number;
  acceptedValue: number;
}
export const QuoteStats = ({ 
  pending, 
  accepted, 
  totalValue, 
  acceptedValue 
}: QuoteStatsProps) => {
    const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-xl font-bold">{pending}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aceptadas</p>
                <p className="text-xl font-bold">{accepted}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Val. Aceptado</p>
                <p className="text-xl font-bold">{formatCurrency(acceptedValue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};