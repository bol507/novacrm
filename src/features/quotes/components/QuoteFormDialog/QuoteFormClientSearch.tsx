import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/shared/lib/utils"; 
import type { Control } from "react-hook-form";
import type { QuoteFormValues } from "../../types/quote";

/**
 * Client search result type
 */
export interface ClientSearchResult {
  id: number;
  accountname: string;
  [key: string]: any;
}

/**
 * Props for QuoteFormClientSearch component
 */
export interface QuoteFormClientSearchProps {
  /** React Hook Form control instance */
  control: Control<QuoteFormValues>;
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (value: string) => void;
  /** Callback when a client is selected */
  onSelect: (client: ClientSearchResult) => void;
  /** Search results from API */
  results: ClientSearchResult[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Whether a valid client is selected */
  isValid: boolean;
}

/**
 * QuoteFormClientSearch Component
 * 
 * Displays a searchable input for selecting a client with autocomplete dropdown.
 * Shows validation feedback if no client is selected.
 */
export const QuoteFormClientSearch = ({
  control,
  onSearchChange,
  onSelect,
  results,
  isLoading,
  isValid,
}: QuoteFormClientSearchProps) => {
  const form = useFormContext<QuoteFormValues>();
  
  const hasClientError = !isValid && form?.formState.isSubmitted;

  return (
    <FormField
      control={control}
      name="account_search"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Client *
            </div>
          </FormLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input
                placeholder="Search client by name..."
                className={cn(
                  "pl-10 transition-all",
                  
                  isValid && !hasClientError 
                    ? 'border-green-500 focus-visible:ring-green-500' 
                    : '',
                  
                  hasClientError && 'border-destructive focus-visible:ring-destructive'
                )}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onSearchChange(e.target.value);
                  
                  if (hasClientError && form) {
                    form.clearErrors('accountid'); 
                  }
                }}
              />
            </FormControl>
          </div>

          {/* Search Results Dropdown */}
          {(results?.length || isLoading) && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border z-10">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : (
                results?.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                    onClick={() => onSelect(client)}
                  >
                    <span>{client.accountname}</span>
                    <span className="text-xs text-muted-foreground">ID: {client.id}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Validation Message */}
          {hasClientError && (
            <p className="text-sm text-destructive mt-1">
              Please select a client from the list
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};