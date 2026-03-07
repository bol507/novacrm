import { Link } from "react-router-dom";
import type { Project } from "../types/projects";
import { ProjectCard } from "./ProjectCard";

interface ProjectsGridProps {
  projects: Project[];
}

export const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No se encontraron proyectos</p>
        <p className="text-sm text-muted-foreground mt-1">
          Intenta ajustar los filtros o crea un nuevo proyecto
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link 
          to={`/dashboard/projects/${project.projectid}`} 
          key={project.projectid}
          className="block"
        >
          <ProjectCard project={project} />
        </Link>
      ))}
    </div>
  );
};