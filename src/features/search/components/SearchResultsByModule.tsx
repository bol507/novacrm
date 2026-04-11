import { DropdownMenuGroup, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge'; 
import type { 
  SearchModuleType, 
  SearchResultsByModule as SearchResultsByModuleType,
  SearchResultItem as SearchResultItemType 
} from '../types/search.types';
import { MODULE_CONFIG } from '../types/search.types';
import { SearchResultItemGeneric } from './SearchResultItemGeneric';

interface SearchResultsByModuleProps {
  results: SearchResultsByModuleType;
  onSelect: (item: SearchResultItemType) => void;
  isGeneric?: boolean;
}

/**
 * Maps result keys to their corresponding SearchModuleType values.
 */
const MODULE_KEYS: Record<keyof SearchResultsByModuleType, SearchModuleType> = {
  projects: 'project',
  clients: 'client',
  opportunities: 'opportunity',
  quotes: 'quote',
  tasks: 'task',
  contacts: 'contact',
};

/**
 * SearchResultsByModule component for displaying grouped search results by module type.
 *
 * Features:
 * - Groups search results by module (projects, clients, opportunities, etc.)
 * - Displays module header with icon, label, and result count
 * - Renders individual results using SearchResultItemGeneric
 * - Adapts to either desktop dropdown menu or mobile generic layout
 * - Separators between modules for visual clarity
 *
 * @component
 * @param props - Component props
 * @param props.results - Grouped search results by module type
 * @param props.onSelect - Callback invoked when a result item is selected
 * @param props.isGeneric - Whether to use generic wrapper (for mobile) or DropdownMenuGroup (for desktop)
 * @returns The rendered grouped search results component
 *
 * @example
 * // Desktop usage with DropdownMenuGroup
 * <SearchResultsByModule
 *   results={searchResults}
 *   onSelect={handleSelect}
 * />
 *
 * @example
 * // Mobile usage with generic wrapper
 * <SearchResultsByModule
 *   results={searchResults}
 *   onSelect={handleSelect}
 *   isGeneric={true}
 * />
 */
export const SearchResultsByModule = ({ 
  results, 
  onSelect,
  isGeneric = false 
}: SearchResultsByModuleProps) => {

  if (!results || typeof results !== 'object') {
    return null;
  }

  const resultKeys: (keyof SearchResultsByModuleType)[] = [
    'projects',
    'clients',
    'opportunities',
    'quotes',
    'tasks',
    'contacts',
  ];

  const Wrapper = isGeneric 
    ? ({ children }: { children: React.ReactNode }) => <>{children}</> 
    : DropdownMenuGroup;

  return (
    <Wrapper>
      {resultKeys.map((resultKey) => {
        const type = MODULE_KEYS[resultKey];
        const items = results[resultKey];
        const config = MODULE_CONFIG[type];

        if (items.length === 0) return null;

        return (
          <div key={resultKey}>
            <div className={`px-4 py-2 flex items-center gap-2 ${isGeneric ? 'bg-muted/30' : ''}`}>
              <span className="text-lg">{config.icon}</span>
              <span className="text-sm font-medium">{config.label}</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {items.length}
              </Badge>
            </div>

            <div className="py-1">
              {items.map((item: SearchResultItemType) => (
                <SearchResultItemGeneric
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onSelect={onSelect}
                  isGeneric={isGeneric}
                />
              ))}
            </div>

            {!isGeneric && <DropdownMenuSeparator className="my-1" />}
            {isGeneric && <div className="my-1 border-t" />}
          </div>
        );
      })}
    </Wrapper>
  );
};