
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from "lucide-react";
import type { QuoteItem } from "../../types/quote";
import { ExpandableText } from "@/components/ExpandableText";

export const SortableQuoteRow = ({ item, formatCurrency, disabled }: { item: QuoteItem; formatCurrency: (v: number) => string; disabled: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.sequence_no.toString(),
    disabled,
  });

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <tr ref={setNodeRef} style={style} className={`border-b last:border-b-0 ${isDragging ? 'bg-muted/80' : 'hover:bg-muted/50'}`}>
      <td className="py-5 pr-4">
        <div className="flex items-center gap-3">
          {!disabled && (
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded" aria-label="Drag to reorder">
              <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{item.description}</div>
            {item.comment && (
              <div className="mt-2">
                <ExpandableText text={item.comment} maxLines={2} className="text-muted-foreground" expandedClassName="text-muted-foreground whitespace-pre-line" />
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="py-5 min-w-[60px] text-right text-lg font-medium">{item.quantity}</td>
      <td className="py-5 min-w-[100px] text-right text-lg font-medium">{formatCurrency(item.listprice)}</td>
      <td className="py-5 min-w-[100px] text-right text-lg font-medium text-destructive">{item.discount_percent > 0 ? `-${item.discount_percent}%` : '-'}</td>
      <td className="py-5 min-w-[120px] text-right text-lg font-medium">{formatCurrency(item.total ?? 0)}</td>
    </tr>
  );
};

export default SortableQuoteRow;