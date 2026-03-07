import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface ProjectsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export const ProjectsHeader = ({ searchTerm, onSearchChange, onCreateClick }: ProjectsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona todos los proyectos
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o número de proyecto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>
    </div>
  );
};