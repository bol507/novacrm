import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: "primary" | "accent" | "warning" | "info";
  delay?: number;
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  delay = 0,
}: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow h-full"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-card-foreground">
            {value}
          </p>
          <div className="flex items-center gap-1.5">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-accent" : "text-destructive"
              )}
            >
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs mes anterior</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;