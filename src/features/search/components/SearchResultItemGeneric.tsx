import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { SearchResultItem as SearchResultItemType } from '../types/search.types';
import { MODULE_CONFIG } from '../types/search.types';

interface SearchResultItemGenericProps {
  /** The search result item to display */
  item: SearchResultItemType;
  /** Callback invoked when the item is selected */
  onSelect: (item: SearchResultItemType) => void;
  /**
   * Whether to use a generic clickable element (for Dialog/mobile)
   * When false, uses DropdownMenuItem (for desktop dropdown)
   * @default false
   */
  isGeneric?: boolean;
}

/**
 * SearchResultItemGeneric component for displaying a single search result item.
 *
 * Features:
 * - Displays module icon, title, number, client, and due date
 * - Shows status badge and amount/total badge when available
 * - Adapts to either generic clickable div or DropdownMenuItem based on context
 * - Keyboard accessible (Enter and Space keys)
 * - Consistent styling across both desktop and mobile contexts
 *
 * @component
 * @param props - Component props
 * @param props.item - The search result item to display
 * @param props.onSelect - Callback invoked when the item is selected
 * @param props.isGeneric - Whether to use generic clickable element (for mobile) or DropdownMenuItem (for desktop)
 * @returns The rendered search result item
 *
 * @example
 * // Desktop usage with DropdownMenuItem
 * <SearchResultItemGeneric
 *   item={result}
 *   onSelect={handleSelect}
 * />
 *
 * @example
 * // Mobile usage with generic clickable div
 * <SearchResultItemGeneric
 *   item={result}
 *   onSelect={handleSelect}
 *   isGeneric={true}
 * />
 */
export const SearchResultItemGeneric = ({ 
  item, 
  onSelect, 
  isGeneric = false 
}: SearchResultItemGenericProps) => {
  const config = MODULE_CONFIG[item.type];

  const ItemContent = () => (
    <>
      <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center text-white shrink-0`}>
        <span className="text-base">{config.icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {item.title}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {item.number && <span className="font-mono">{item.number}</span>}
          {item.client && <span className="truncate">• {item.client}</span>}
          {item.due_date && <span className="text-orange-600 truncate">• {item.due_date}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {item.status && (
          <Badge variant="outline" className="text-xs">
            {item.status}
          </Badge>
        )}
        {(item.amount || item.total) && (
          <Badge variant="secondary" className="text-xs font-mono">
            ${(item.amount || item.total)}
          </Badge>
        )}
      </div>
    </>
  );

  if (isGeneric) {
    return (
      <div
        onClick={() => onSelect(item)}
        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(item);
          }
        }}
      >
        <ItemContent />
      </div>
    );
  }

  return (
    <DropdownMenuItem
      onClick={() => onSelect(item)}
      className="flex items-center gap-3 p-3 cursor-pointer"
      onSelect={(e) => e.preventDefault()}
    >
      <ItemContent />
    </DropdownMenuItem>
  );
};