import { cn } from "@/shared/lib/utils";
import {
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_COLORS,
  type PurchaseStatus,
} from "../types/purchase";

interface PurchaseStatusBadgeProps {
  status: PurchaseStatus;
  className?: string;
}

export const PurchaseStatusBadge = ({
  status,
  className,
}: PurchaseStatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        PURCHASE_STATUS_COLORS[status],
        className
      )}
    >
      {PURCHASE_STATUS_LABELS[status]}
    </span>
  );
};