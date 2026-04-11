import { Search, X, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { SearchResultsByModule } from './SearchResultsByModule';
import type { SearchResultItem as SearchResultItemType } from '../types/search.types';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useCallback } from 'react';

interface GlobalSearchMobileProps {
  /** Whether the mobile search dialog is open */
  open: boolean;
  /** Callback invoked when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * GlobalSearchMobile component - Mobile version of the global search.
 *
 * Features:
 * - Full-screen dialog for mobile devices
 * - Auto-focus and text selection when opened
 * - Search input with character counter
 * - Real-time results as user types
 * - Loading state with spinner
 * - Clear button to reset search
 * - Empty state with helpful messages
 * - Results grouped by module
 * - Navigation to result detail pages
 * - View all results button
 *
 * @component
 * @param props - Component props
 * @param props.open - Whether the mobile search dialog is open
 * @param props.onOpenChange - Callback invoked when the dialog open state changes
 * @returns The rendered mobile search dialog component
 *
 * @example
 * // Basic usage
 * <GlobalSearchMobile
 *   open={isMobileSearchOpen}
 *   onOpenChange={setIsMobileSearchOpen}
 * />
 *
 * @example
 * // Used in GlobalSearch component
 * <GlobalSearchMobile
 *   open={isMobileOpen}
 *   onOpenChange={setIsMobileOpen}
 * />
 */
export const GlobalSearchMobile = ({ open, onOpenChange }: GlobalSearchMobileProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    inputValue,
    searchQuery,
    searchResults,
    isLoading,
    getTotalCount,
    setInputValue,
    executeSearch,
    clearSearch
  } = useGlobalSearch({
    limit: 10,
  });

  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /**
   * Closes the search dialog and clears the search state.
   */
  const handleClose = useCallback(() => {
    onOpenChange(false);
    clearSearch();
  }, [onOpenChange, clearSearch]);

  /**
   * Handles selection of a search result item.
   * Navigates to the item's URL and closes the dialog.
   *
   * @param item - The selected search result item
   */
  const handleSelect = useCallback((item: SearchResultItemType) => {
    handleClose();
    setTimeout(() => {
      navigate(item.url);
    }, 50);
  }, [navigate, handleClose]);

  /**
   * Handles keyboard events on the search input.
   * - Enter: Executes the search
   * - Escape: Closes the dialog
   *
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [executeSearch, handleClose]);

  /**
   * Updates the input value as the user types.
   *
   * @param e - Change event from input
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, [setInputValue]);

  /**
   * Executes the search when the search button is clicked.
   */
  const handleSearchClick = useCallback(() => {
    executeSearch();
  }, [executeSearch]);

  /**
   * Clears the search input and maintains focus.
   */
  const handleClear = useCallback(() => {
    clearSearch();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [clearSearch]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[95vw] w-[95vw] max-h-[90vh] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-base flex-1">
              Search
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search clients, projects, tasks..."
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-24"
              autoFocus
            />
            
            {isLoading && (
              <Loader2 className="absolute right-24 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-16 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleSearchClick}
              disabled={inputValue.length < 3 || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!searchQuery && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Type and press Search</p>
              <p className="text-xs mt-1">Minimum 3 characters</p>
            </div>
          )}

          {inputValue.length > 0 && inputValue.length < 3 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              Enter at least 3 characters
            </div>
          )}

          {!isLoading && searchResults && getTotalCount() === 0 && searchQuery.length >= 3 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No results found
            </div>
          )}

          {!isLoading && searchResults && getTotalCount() > 0 && (
            <>
              <div className="sticky top-0 bg-background px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getTotalCount()} result{getTotalCount() !== 1 ? 's' : ''}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {searchQuery}
                </Badge>
              </div>

              <SearchResultsByModule
                results={searchResults}
                onSelect={handleSelect}
                isGeneric={true}
              />

              <div className="sticky bottom-0 bg-background border-t px-4 py-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    handleClose();
                  }}
                >
                  View all results
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};