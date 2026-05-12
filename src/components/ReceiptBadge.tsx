// src/shared/components/ReceiptBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface ReceiptBadgeProps {
  received: number;
  total: number;
  className?: string;
}

export const ReceiptBadge = ({ received, total, className }: ReceiptBadgeProps) => {
  const isComplete = received >= total;
  const pending = total - received;
  
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Badge
        variant={isComplete ? 'default' : pending > 0 ? 'outline' : 'secondary'}
        className={cn(
          "text-xs",
          isComplete && "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
        )}
      >
        {received}/{total}
      </Badge>
      {pending > 0 && (
        <span className="text-[10px] text-muted-foreground">
          Pendiente: {pending}
        </span>
      )}
    </div>
  );
};