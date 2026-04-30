import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Folder, FileText } from 'lucide-react';

/**
 * Props for ProjectTabsNavigation component
 */
export interface ProjectTabsNavigationProps {
  /** Currently active tab value */
  activeTab: string;
  /** Callback when tab value changes */
  onTabChange: (value: string) => void;
}

/**
 * ProjectTabsNavigation Component
 * 
 * Displays tab navigation triggers for Overview, Attachments, and Comments.
 * 
 * @component
 * @param {ProjectTabsNavigationProps} props - Component props
 * @param {string} props.activeTab - Current active tab value
 * @param {function} props.onTabChange - Tab change callback
 * 
 * @returns {JSX.Element} Tab navigation component
 */
export const ProjectTabsNavigation = () => {
  return (
    <TabsList className="grid w-full  grid-cols-2">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <Folder className="h-4 w-4" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="attachments" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Attachments
      </TabsTrigger>

       <TabsTrigger value="purchases">Purchases</TabsTrigger>
      
    </TabsList>
  );
};