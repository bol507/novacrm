import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PurchaseBudgetAlertProps {
  projectBudget: number | null;
  projectSpent: number;
  percentageUsed: number;
}

export const PurchaseBudgetAlert = ({
  projectBudget,
  projectSpent,
  percentageUsed,
}: PurchaseBudgetAlertProps) => {
  if (!projectBudget) return null;

  const isOverBudget = percentageUsed > 100;
  const isNearBudget = percentageUsed > 80 && percentageUsed <= 100;

  return (
    <div className={cn(
      "p-4 rounded-lg border flex items-start gap-3",
      isOverBudget && "bg-destructive/10 border-destructive/20",
      isNearBudget && "bg-warning/10 border-warning/20",
      !isOverBudget && !isNearBudget && "bg-emerald-500/10 border-emerald-500/20"
    )}>
      {isOverBudget ? (
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
      ) : isNearBudget ? (
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
      ) : (
        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
      )}
      
      <div className="flex-1">
        <div className="font-medium text-sm">
          {isOverBudget ? 'Presupuesto excedido' : isNearBudget ? 'Presupuesto casi agotado' : 'Presupuesto dentro de límite'}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Gastado: ${projectSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} de ${projectBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({percentageUsed.toFixed(1)}%)
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              isOverBudget && "bg-destructive",
              isNearBudget && "bg-warning",
              !isOverBudget && !isNearBudget && "bg-emerald-600"
            )}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};