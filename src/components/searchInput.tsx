import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface SearchInputProps extends React.ComponentProps<typeof Input> {
  /** Callback invoked when the user finishes typing (300ms debounce) */
  onSearch?: (value: string) => void;
  
  /** Whether results are currently loading */
  isLoading?: boolean;
  
  /** Custom placeholder text */
  placeholder?: string;
  
  /** Whether to show the clear button when input has value */
  clearable?: boolean;
  
  /** Callback invoked when the search is cleared */
  onClear?: () => void;
}

/**
 * Search input component with integrated icon, debounce, and clear button.
 *
 * Features:
 * - Integrated search icon
 * - Clear button (appears when typing)
 * - 300ms debounce to prevent excessive API calls
 * - Loading state with spinner
 * - Accessible (ARIA labels, keyboard navigation)
 * - Smooth transitions
 *
 * @component
 * @param props - Component props
 * @param props.onSearch - Callback invoked when the user finishes typing (debounced)
 * @param props.isLoading - Whether results are currently loading
 * @param props.placeholder - Custom placeholder text (default: "Search...")
 * @param props.clearable - Whether to show the clear button (default: true)
 * @param props.onClear - Callback invoked when the search is cleared
 * @param props.className - Additional CSS classes
 * @param props.value - Controlled input value
 * @param props.onChange - Callback for input value changes
 * @returns The rendered search input component
 *
 * @example
 * // Basic usage
 * <SearchInput
 *   onSearch={(value) => fetchResults(value)}
 *   placeholder="Search projects..."
 * />
 *
 * @example
 * // With loading state
 * <SearchInput
 *   isLoading={isLoading}
 *   onSearch={handleSearch}
 *   clearable={true}
 * />
 *
 * @example
 * // Controlled with external value
 * <SearchInput
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   onSearch={(value) => performSearch(value)}
 * />
 */
export const SearchInput = ({
  onSearch,
  isLoading = false,
  placeholder = 'Search...',
  clearable = true,
  onClear,
  className,
  value,
  onChange,
  ...props
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = useState(value as string || '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInternalValue((value as string) || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    onChange?.(e);
    
    if (onSearch) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        onSearch(newValue);
      }, 300);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onClear?.();
    
    if (onChange) {
      const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    
    onSearch?.('');
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const hasValue = internalValue.length > 0;

  return (
    <div className="relative w-full">
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors"
        aria-hidden="true"
      />
      
      <Input
        {...props}
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          'pl-9 pr-9 transition-all duration-200',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary',
          isLoading && 'opacity-70',
          className
        )}
        aria-label={placeholder}
        role="searchbox"
      />
      
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : clearable && hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-muted/50 transition-colors"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};