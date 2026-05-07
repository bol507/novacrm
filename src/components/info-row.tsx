import type { ReactNode } from 'react';

interface InfoRowProps {
  label: string;
  value: string | number | ReactNode;
  valueClass?: string;
}

export const InfoRow = ({ label, value, valueClass = '' }: InfoRowProps) => {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground leading-none">
        {label}
      </p>
      <p className={`text-lg sm:text-xl font-bold leading-tight break-words ${valueClass}`}>
        {value}
      </p>
    </div>
  );
};