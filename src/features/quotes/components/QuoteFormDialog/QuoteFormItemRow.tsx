import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVerticalIcon, Trash2 } from "lucide-react";
import type { QuoteFormData } from "../../types/quote";
import { cn } from "@/shared/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useEffect } from "react";

export interface QuoteFormItemRowProps {
  item: QuoteFormData['items'][0];
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  isDraggable?: boolean;
  sortableId?: string;
  formatCurrency?: (value: number) => string;
}

export const QuoteFormItemRow = ({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
  isDraggable = false,
  sortableId,
  formatCurrency = (v: number) => `$${v.toFixed(2)}`,
}: QuoteFormItemRowProps) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId ?? `item-${index}`,
    disabled: !isDraggable,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //  Cálculos en tiempo real
  const netPrice = item.listprice * (1 - (item.discount_percent || 0) / 100);
  const lineTotal = netPrice * (item.quantity || 0);
  const hasErrors = !item.productname?.trim() || item.quantity <= 0 || item.listprice <= 0;

  //  Auto-expand del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [item.description]);

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:border-primary/50 hover:shadow-sm",
        isDragging && "border-primary shadow-lg ring-2 ring-primary/20 scale-[1.01]",
        hasErrors && "border-destructive/50 bg-destructive/5",
        !isDraggable && "cursor-default"
      )}
    >
      {/* Header: Drag Handle + Remove + Badge Secuencia */}
      <div className="flex items-center justify-between mb-3">
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            type="button"
            aria-label="Drag to reorder"
          >
            <GripVerticalIcon className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
            #{item.sequence_no}
          </span>

          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(index)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/*  SECCIÓN 1: Product & Description (Vertical, Full Width) */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            Product Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Enter product or service name..."
            value={item.productname}
            onChange={(e) => onUpdate(index, 'productname', e.target.value)}
            className={cn(
              "font-medium text-base",
              hasErrors && !item.productname?.trim() && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        {/* Description - Auto-expand Textarea con diseño mejorado */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              Description <span className="font-normal text-muted-foreground/70">(optional)</span>
            </label>

            {/* ✅ Contador de caracteres */}
            {item.description && item.description.length > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded">
                {item.description.length} chars
              </span>
            )}
          </div>

          <div className="relative group">
            <Textarea
              ref={textareaRef}
              placeholder="Add specifications, notes, or details..."
              value={item.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              rows={3}
              className={cn(
                // Base styles
                "w-full resize-y",
                "min-h-[80px] max-h-[300px]",
                "p-3 text-sm leading-relaxed",
                //"font-mono", // Para descripciones técnicas más legibles

                // Focus states
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50",

                // Hover effect
                "hover:border-primary/30 transition-colors duration-200",

                // Dark theme scrollbar styles (inline for better support)
                "scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent",
                "hover:scrollbar-thumb-muted-foreground/50",

                // Custom scrollbar for Webkit
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar]:h-2",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
                "[&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-200",
              )}
            />

            {/* ✅ Indicador visual de resize en la esquina */}
            <div className="absolute bottom-1.5 right-1.5 pointer-events-none opacity-40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3 text-muted-foreground"
              >
                <polyline points="22 6 12 16 6 10 6 10" />
                <polyline points="16 6 22 6 22 12" />
              </svg>
            </div>
          </div>

          {/* ✅ Helper text o preview */}
          {item.description && item.description.length > 100 && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground/50">
              <div className="h-px flex-1 bg-muted-foreground/20" />
              <span>Tip: Use line breaks for readability</span>
              <div className="h-px flex-1 bg-muted-foreground/20" />
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 my-4" />

      {/* ✅ SECCIÓN 2: Numeric Fields (Horizontal Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">

        {/* Quantity */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            Qty <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdate(index, 'quantity', Math.max(1, Number(e.target.value)))}
            className="text-right font-mono"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            Price <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={item.listprice}
            onChange={(e) => onUpdate(index, 'listprice', Math.max(0, Number(e.target.value)))}
            className="text-right font-mono"
          />
        </div>

        {/*  Discount con Tooltip/Badge de Net Price */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Discount %
            </label>
            {/*  Tooltip estático: aparece solo si hay descuento */}
            {item.discount_percent > 0 && (
              <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                Net: {formatCurrency(netPrice)}
              </span>
            )}
          </div>
          <Input
            type="number"
            min="0"
            max="100"
            value={item.discount_percent}
            onChange={(e) => onUpdate(index, 'discount_percent', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="text-right font-mono"
          />
        </div>

        {/* Line Total */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block text-right sm:text-left">
            Line Total
          </label>
          <div className={cn(
            "text-lg font-bold font-mono text-right p-2.5 rounded-lg border",
            lineTotal > 0
              ? "bg-primary/5 border-primary/20 text-primary"
              : "bg-muted/30 border-border text-muted-foreground"
          )}>
            {formatCurrency(lineTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};