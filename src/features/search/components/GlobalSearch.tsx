import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import type { SearchResultItem as SearchResultItemType } from '../types/search.types';
import { useNavigate } from 'react-router-dom';
import { useRef, useCallback, useState } from 'react';
import { SearchResultsByModule } from './SearchResultsByModule';
import { GlobalSearchMobile } from './GlobalSearchMobile';

/**
 * GlobalSearch component for performing cross-module searches.
 *
 * Features:
 * - Desktop dropdown with search input and results
 * - Mobile dialog version for small screens
 * - Debounced search with minimum 3 character requirement
 * - Real-time results as user types
 * - Keyboard navigation (Enter to search, Escape to close)
 * - Clear button to reset search
 * - Loading state with spinner
 * - Empty state with helpful messages
 * - Result counts per category
 * - Navigation to result detail pages
 *
 * @component
 * @returns The rendered global search component
 *
 * @example
 * // Basic usage
 * <GlobalSearch />
 *
 * @example
 * // Used in navigation bar
 * <div className="relative w-full max-w-md">
 *   <GlobalSearch />
 * </div>
 */
export const GlobalSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const {
    inputValue,
    searchQuery,
    searchResults,
    isLoading,
    isOpen,
    getTotalCount,
    setInputValue,
    executeSearch,
    setIsOpen,
    clearSearch,
    closeSearch
  } = useGlobalSearch({ limit: 10 });

  /**
   * Handles selection of a search result item.
   * Navigates to the item's URL and closes the search dropdown.
   *
   * @param item - The selected search result item
   */
  const handleSelect = useCallback((item: SearchResultItemType) => {
    closeSearch();
    navigate(item.url);
  }, [navigate, closeSearch]);

  /**
   * Handles keyboard events on the search input.
   * - Enter: Executes the search
   * - Escape: Closes the search dropdown and blurs input
   *
   * @param e - Keyboard event
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
      inputRef.current?.blur();
    }
  }, [executeSearch, closeSearch]);

  /**
   * Updates the input value as the user types.
   *
   * @param e - Change event from input
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, [setInputValue]);

  /**
   * Handles dropdown open/close state changes.
   * Clears search when dropdown is closed to maintain consistency.
   *
   * @param open - Whether the dropdown should be open
   */
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      clearSearch();
    }
  }, [setIsOpen, clearSearch]);

  /**
   * Clears the search input and maintains focus.
   *
   * @param e - Mouse event
   */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearch();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [clearSearch]);

  /**
   * Executes the search when the search button is clicked.
   *
   * @param e - Mouse event
   */
  const handleSearchClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    executeSearch();
  }, [executeSearch]);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:block">
        <DropdownMenu
          open={isOpen}
          onOpenChange={handleOpenChange}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                placeholder="Search..."
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-24 w-full"
                onClick={(e) => e.stopPropagation()}
              />

              {isLoading && (
                <Loader2 className="absolute right-20 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}

              {inputValue.length >= 3 && !isLoading && (
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="absolute right-16 top-1/2 -translate-y-1/2 hover:text-foreground"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-primary" />
                </button>
              )}

              {inputValue && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}

              {!isLoading && !inputValue && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  Enter ↵
                </span>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[600px] max-h-[calc(100vh-200px)] p-0"
            align="start"
            side="bottom"
            sideOffset={8}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {searchResults && getTotalCount() > 0 && (
              <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    Results ({getTotalCount()})
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {searchQuery}
                  </Badge>
                </div>
              </div>
            )}

            <div className="max-h-[450px] overflow-y-auto">
              {isOpen && !searchQuery && !isLoading && (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Type and press Enter</p>
                  <p className="text-xs mt-1 text-muted-foreground">Minimum 3 characters</p>
                </div>
              )}

              {inputValue.length > 0 && inputValue.length < 3 && (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Enter at least 3 characters to search
                </div>
              )}

              {isLoading && (
                <div className="px-4 py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              )}

              {!isLoading && searchResults && getTotalCount() === 0 && searchQuery.length >= 3 && (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results found</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    for "{searchQuery}"
                  </p>
                </div>
              )}

              {!isLoading && searchResults && getTotalCount() > 0 && (
                <div className="py-2">
                  <SearchResultsByModule
                    results={searchResults.results}
                    onSelect={handleSelect}
                    isGeneric={false}
                  />
                </div>
              )}
            </div>

            {searchResults && getTotalCount() > 0 && (
              <div className="sticky bottom-0 bg-background border-t px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    clearSearch();
                  }}
                >
                  View all results ({getTotalCount()})
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="h-10 w-10"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <GlobalSearchMobile
        open={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      />
    </>
  );
};