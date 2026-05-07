import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Package, Paperclip, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

const MODULES = [
  { id: 'overview', label: 'Overview', icon: null, primary: true },
  { id: 'attachments', label: 'Attachments', icon: Paperclip, primary: true },
  { id: 'procurement', label: 'Procurement', icon: Package, primary: true },
 // { id: 'quotation RFQ', label: 'RFQ', icon: null , primary: true },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart, primary: false },
  { id: 'production', label: 'Production', icon: null, primary: false },
  { id: 'reports', label: 'Reports', icon: null, primary: false },
  { id: 'settings', label: 'Settings', icon: null, primary: false },
] as const;

const MOBILE_PRIMARY_LIMIT = 2;
export type ModuleId = typeof MODULES[number]['id'];

interface Props {
  /** Callback to notify module change (without navigation) */
  onModuleChange?: (moduleId: ModuleId) => void;
  /** Currently active module */
  currentModule: ModuleId;
  /** Optional callback to control visibility by permissions */
  isModuleVisible?: (moduleId: ModuleId) => boolean;
}

/**
 * ProjectModuleNav component for navigating between project modules.
 *
 * Features:
 * - Primary modules displayed as tabs
 * - Extended modules accessible via "More" dropdown
 * - Responsive design with condensed mobile view
 * - Permission-based visibility for modules
 *
 * @component
 * @param props - Component props
 * @param props.onModuleChange - Callback to notify module change
 * @param props.currentModule - Currently active module
 * @param props.isModuleVisible - Optional callback to control module visibility
 * @returns The rendered project module navigation component
 */
export const ProjectModuleNav = ({ 
  onModuleChange, 
  currentModule, 
  isModuleVisible = () => true 
}: Props) => {
  
  const visiblePrimaryModules = MODULES.filter(m => m.primary && isModuleVisible(m.id));
  const extendedModules = MODULES.filter(m => !m.primary && isModuleVisible(m.id));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabsToShow = isMobile 
    ? visiblePrimaryModules.slice(0, MOBILE_PRIMARY_LIMIT) 
    : visiblePrimaryModules;
  
  const dropdownModules = isMobile
    ? [...visiblePrimaryModules.slice(MOBILE_PRIMARY_LIMIT), ...extendedModules]
    : extendedModules;

  const handleTabClick = (moduleId: ModuleId) => {
    onModuleChange?.(moduleId);
  };

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-px -mx-4 px-4 sm:-mx-0 sm:px-0 sm:overflow-visible">
        
        {tabsToShow.map((mod) => {
          const isActive = currentModule === mod.id;
          return (
            <Button
              key={mod.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`
                rounded-t-lg border-b-2 whitespace-nowrap flex-shrink-0
                ${isActive 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
                h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium
              `}
              onClick={() => handleTabClick(mod.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              {mod.icon && (
                <mod.icon className={`mr-1.5 sm:mr-2 h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className="truncate">{mod.label}</span>
            </Button>
          );
        })}

        {dropdownModules.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`
                  rounded-t-lg border-b-2 border-transparent whitespace-nowrap flex-shrink-0
                  h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium
                  text-muted-foreground hover:text-foreground
                  ${currentModule && dropdownModules.some(m => m.id === currentModule) ? 'text-primary font-medium' : ''}
                `}
                aria-label="More modules"
              >
                <span className="hidden sm:inline">More</span>
                <span className="sm:hidden">⋯</span>
                <ChevronDown className="ml-1 h-3.5 w-3.5 sm:ml-2" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              sideOffset={3}
              className="w-48 sm:w-56 max-w-[90vw] sm:max-w-none"
            >
              {dropdownModules.map((mod) => {
                const isActive = currentModule === mod.id;
                return (
                  <DropdownMenuItem
                    key={mod.id}
                    onClick={() => handleTabClick(mod.id)}
                    className={`
                      flex items-center gap-2 py-2.5 px-3 text-sm
                      ${isActive ? 'bg-accent text-accent-foreground font-medium' : ''}
                      cursor-pointer
                    `}
                  >
                    {mod.icon && <mod.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                    <span className="truncate flex-1">{mod.label}</span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-primary ml-auto flex-shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="sm:hidden h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};