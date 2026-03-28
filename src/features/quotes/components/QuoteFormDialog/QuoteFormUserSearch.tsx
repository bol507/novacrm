import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useFormContext } from "react-hook-form"; 
import { cn } from "@/shared/lib/utils";
import type { Control } from "react-hook-form";
import type { QuoteFormValues } from "../../types/quote";

/**
 * User search result type
 */
export interface UserSearchResult {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  user_name: string;
  [key: string]: any;
}

/**
 * Props for QuoteFormUserSearch component
 */
export interface QuoteFormUserSearchProps {
  /** React Hook Form control instance */
  control: Control<QuoteFormValues>;
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (value: string) => void;
  /** Callback when a user is selected */
  onSelect: (user: UserSearchResult) => void;
  /** Search results from API */
  results: UserSearchResult[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Whether a valid user is selected */
  isValid: boolean;
}

/**
 * QuoteFormUserSearch Component
 * 
 * Displays a searchable input for selecting an assigned user with autocomplete dropdown.
 * Shows validation feedback if no user is selected.
 */
export const QuoteFormUserSearch = ({
  control,
  onSearchChange,
  onSelect,
  results,
  isLoading,
  isValid,
}: QuoteFormUserSearchProps) => {
  
  const form = useFormContext<QuoteFormValues>();
  
  
  const hasUserError = !isValid && form?.formState.isSubmitted;

  return (
    <FormField
      control={control}
      name="assigned_user_search"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Assigned to *
            </div>
          </FormLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input
                placeholder="Search user by name..."
                className={cn(
                  "pl-10 transition-all",
                 
                  isValid && !hasUserError 
                    ? 'border-green-500 focus-visible:ring-green-500' 
                    : '',
                 
                  hasUserError && 'border-destructive focus-visible:ring-destructive'
                )}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onSearchChange(e.target.value);
                  
                  if (hasUserError && form) {
                    form.clearErrors('assigned_user_id');
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
                results?.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                    onClick={() => onSelect(user)}
                  >
                    <span>{user.first_name} {user.last_name}</span>
                    <span className="text-xs text-muted-foreground">@{user.user_name}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Validation Message */}
          {hasUserError && (
            <p className="text-sm text-destructive mt-1">
              Please select a user from the list
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};