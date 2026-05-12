import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface ProjectsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

/**
 * ProjectsHeader component for the projects list page header.
 *
 * Displays the page title, description, search input, and create button.
 *
 * @component
 * @param props - Component props
 * @param props.searchTerm - Current search term value
 * @param props.onSearchChange - Callback when search input changes
 * @param props.onCreateClick - Callback when create button is clicked
 * @returns The rendered projects header
 *
 * @example
 * <ProjectsHeader
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onCreateClick={handleCreateProject}
 * />
 */
export const ProjectsHeader = ({ searchTerm, onSearchChange, onCreateClick }: ProjectsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="text-muted-foreground">
          View and manage all projects
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name or number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
};