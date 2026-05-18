import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { QuoteSortConfig, QuoteSortField } from "../types/quote";
import { DEFAULT_QUOTE_SORT } from "../types/quote";

interface QuoteSortControlProps {
  sortConfig: QuoteSortConfig;
  onSortChange: (config: QuoteSortConfig) => void;
  className?: string;
}

/**
 * QuoteSortControl Component
 *
 * Displays controls for sorting quotes by field and direction.
 *
 * @component
 * @param props - Component props
 * @param props.sortConfig - Current sort configuration (field and direction)
 * @param props.onSortChange - Callback when sort configuration changes
 * @param props.className - Additional CSS classes
 * @returns The rendered sort control component
 *
 * @example
 * // Basic usage
 * <QuoteSortControl
 *   sortConfig={sortConfig}
 *   onSortChange={setSortConfig}
 * />
 *
 * @example
 * // With custom className
 * <QuoteSortControl
 *   sortConfig={sortConfig}
 *   onSortChange={setSortConfig}
 *   className="mb-4"
 * />
 */
export const QuoteSortControl = ({ 
  sortConfig, 
  onSortChange,
  className = '' 
}: QuoteSortControlProps) => {
  
  const handleFieldChange = (field: QuoteSortField) => {
    onSortChange({ field, direction: sortConfig.direction });
  };
  
  const toggleDirection = () => {
    onSortChange({ 
      field: sortConfig.field, 
      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
    });
  };
  
  const handleReset = () => {
    onSortChange(DEFAULT_QUOTE_SORT);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select 
        value={sortConfig.field} 
        onValueChange={handleFieldChange}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdtime">🕐 Creation Date</SelectItem>
          <SelectItem value="validtill">📅 Expiration Date</SelectItem>
          <SelectItem value="subject">📝 Title</SelectItem>
          <SelectItem value="quoteno">🔢 Number</SelectItem>
          <SelectItem value="account_name">🏢 Client</SelectItem>
          <SelectItem value="total">💰 Total Amount</SelectItem>
          <SelectItem value="subtotal">💵 Subtotal</SelectItem>
          <SelectItem value="quote_stage">📊 Status</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={toggleDirection}
        title={sortConfig.direction === 'asc' ? 'Ascending order' : 'Descending order'}
      >
        {sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
      
      {(sortConfig.field !== DEFAULT_QUOTE_SORT.field || 
        sortConfig.direction !== DEFAULT_QUOTE_SORT.direction) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-xs"
          onClick={handleReset}
          title="Reset to default sort"
        >
          <ArrowUpDown className="h-3 w-3 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};