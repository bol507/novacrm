
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from "lucide-react";
import type { QuoteItem } from "../../types/quote";
import { ExpandableText } from "@/components/ExpandableText";

export const SortableQuoteCard = ({ item, formatCurrency, disabled }: { item: QuoteItem; formatCurrency: (v: number) => string; disabled: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.sequence_no.toString(),
    disabled,
  });

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`border-b last:border-b-0 p-4 ${isDragging ? 'bg-muted/80' : 'hover:bg-muted/50'}`}>
      <div className="flex items-center gap-3 mb-2">
        {!disabled && (
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded" aria-label="Drag to reorder">
            <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <div className="font-semibold text-lg">{item.description}</div>
      </div>
      {item.comment && (
        <div className="mt-2">
          <ExpandableText text={item.comment} maxLines={2} className="text-muted-foreground" expandedClassName="text-muted-foreground whitespace-pre-line" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div><div className="text-muted-foreground">Quantity</div><div className="font-medium">{item.quantity}</div></div>
        <div><div className="text-muted-foreground">Price</div><div className="font-medium">{formatCurrency(item.listprice)}</div></div>
        <div><div className="text-muted-foreground">Discount</div><div className="font-medium text-destructive">{item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}</div></div>
        <div><div className="text-muted-foreground">Total</div><div className="font-medium">{formatCurrency(item.total ?? 0)}</div></div>
      </div>
    </div>
  );
};

export default SortableQuoteCard;   