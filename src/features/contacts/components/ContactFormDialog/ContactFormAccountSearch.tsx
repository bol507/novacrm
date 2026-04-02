import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { ContactFormValues } from "../../types/contact";
import { cn } from "@/shared/lib/utils";

/**
 * Account search result type - uses accountid from client service
 */
export interface AccountSearchResult {
  accountid: number;
  accountname: string;
  [key: string]: any;
}

/**
 * Props for ContactFormAccountSearch component
 */
export interface ContactFormAccountSearchProps {
  /** React Hook Form control instance */
  control: Control<ContactFormValues>;
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (value: string) => void;
  /** Callback when an account is selected */
  onSelect: (account: AccountSearchResult) => void;
  /** Search results from API */
  results: AccountSearchResult[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Whether a valid account is selected */
  isValid: boolean;
  /** Original account ID (for edit mode - optional) */
  originalAccountId?: number | null;
}

/**
 * ContactFormAccountSearch Component
 *
 * Displays a searchable input for selecting an account (client) with autocomplete dropdown.
 * Shows validation feedback if no account is selected.
 *
 * Features:
 * - Search input with icon
 * - Autocomplete dropdown with search results
 * - Visual feedback for valid selection (green border)
 * - Visual feedback for validation error (red border)
 * - Clear error when user starts typing
 * - Loading state indicator
 *
 * @component
 * @param props - Component props
 * @param props.control - React Hook Form control instance
 * @param props.onSearchChange - Callback when search term changes
 * @param props.onSelect - Callback when an account is selected
 * @param props.results - Search results from API
 * @param props.isLoading - Loading state
 * @param props.isValid - Whether a valid account is selected
 * @returns The rendered account search component
 *
 * @example
 * // Basic usage
 * <ContactFormAccountSearch
 *   control={form.control}
 *   searchTerm={accountSearchTerm}
 *   onSearchChange={setAccountSearchTerm}
 *   onSelect={handleSelectAccount}
 *   results={accountResults}
 *   isLoading={accountsLoading}
 *   isValid={isAccountValid}
 * />
 */
export const ContactFormAccountSearch = ({
  control,
  onSearchChange,
  onSelect,
  results,
  isLoading,
  isValid,
  originalAccountId,
}: ContactFormAccountSearchProps) => {
  const form = useFormContext<ContactFormValues>();
  const hasAccountError = !isValid && form?.formState.isSubmitted;
  const showError = hasAccountError && (originalAccountId === undefined || originalAccountId === null);

  return (
    <FormField
      control={control}
      name="account_search"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Client
            </div>
          </FormLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input
                placeholder="Search client by name..."
                className={cn(
                  "pl-10 transition-all",
                  isValid && !hasAccountError 
                    ? 'border-green-500 focus-visible:ring-green-500' 
                    : '',
                  hasAccountError && 'border-destructive focus-visible:ring-destructive'
                )}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onSearchChange(e.target.value);
                  if (hasAccountError && form) {
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
                results?.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                    onClick={() => onSelect(account)}
                  >
                    <span>{account.accountname}</span>
                    <span className="text-xs text-muted-foreground">ID: {account.id}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Validation Message */}
          {showError && (
            <p className="text-sm text-destructive mt-1">
              You must select a client from the list
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};