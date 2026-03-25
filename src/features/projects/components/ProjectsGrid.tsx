import { Link } from "react-router-dom";
import type { Project } from "../types/projects";
import { ProjectCard } from "./ProjectCard";

/**
 * Props for the ProjectsGrid component.
 * 
 * This interface defines the contract for rendering a grid of project cards.
 * The component is purely presentational and receives all data via props.
 */
export interface ProjectsGridProps {
  /**
   * Array of project objects to display in the grid.
   * 
   * Each project is rendered as a clickable card that navigates to
   * the project details page when selected.
   * 
   * @remarks
   * - Empty array triggers the empty state UI with helpful messaging
   * - Projects are rendered in the order provided; sorting should be handled upstream
   * - Each project must have a unique projectid for React key optimization
   * 
   * @example
   * // Typical projects array from API response
   * const projects = [
   *   { projectid: 1, projectname: 'Kitchen Renovation', projectstatus: 'in progress', ... },
   *   { projectid: 2, projectname: 'Office Build-out', projectstatus: 'completed', ... },
   * ];
   */
  projects: Project[];
}

/**
 * ProjectsGrid Component
 * 
 * A presentational component that renders a responsive grid of project cards.
 * 
 * This component handles:
 * - Empty state display when no projects are available
 * - Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
 * - Navigation wrapping for each project card via React Router Link
 * - Consistent spacing and visual hierarchy via CSS grid and gap utilities
 * 
 * The component delegates all project data rendering to the ProjectCard
 * presentational component, following the composition pattern for maintainability.
 * 
 * @component
 * @param {ProjectsGridProps} props - Component configuration props
 * @param {Project[]} props.projects - Array of projects to render in the grid
 * @returns {JSX.Element} The rendered grid of project cards or empty state message
 * 
 * @example
 * // Basic usage with projects array
 * <ProjectsGrid projects={projects} />
 * 
 * @example
 * // Usage with empty state (no projects)
 * <ProjectsGrid projects={[]} />
 * // Renders: "No se encontraron proyectos" message with helpful guidance
 * 
 * @remarks
 * - Uses React Router Link for client-side navigation without page reload
 * - Each card is wrapped in a Link with className="block" for full-area clickability
 * - Grid uses CSS grid with responsive breakpoints via Tailwind utility classes
 * - Empty state includes dashed border and muted background for visual distinction
 * - Component assumes projects have unique projectid values for React key prop
 * - Navigation target is hardcoded to `/dashboard/projects/:projectId`
 * - Consider making navigation path configurable via prop for future flexibility
 * 
 * @accessibility
 * - Link elements provide semantic navigation for screen readers
 * - ProjectCard should include proper aria-labels for interactive elements
 * - Empty state text is readable by assistive technologies
 * 
 * @performance
 * - Uses project.projectid as React key for optimal re-rendering
 * - Grid layout uses CSS grid for efficient browser rendering
 * - Consider virtualization for large project lists (>100 items)
 * 
 * @see {@link ProjectCard} For the individual project card rendering component
 * @see {@link Project} For the project data structure interface
 * @see {@link https://reactrouter.com/docs/en/v6/components/link} For React Router Link documentation
 * @see {@link https://tailwindcss.com/docs/grid-template-columns} For Tailwind grid utilities
 */
export const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  /**
   * Renders the empty state UI when no projects are available.
   * 
   * Displays a centered message with helpful guidance for the user.
   * Uses dashed border and muted background to visually distinguish
   * from the populated grid state.
   * 
   * @returns {JSX.Element} Empty state container with instructional text
   * 
   * @remarks
   * - Message is in Spanish; consider i18n for multi-language support
   * - Suggests two user actions: adjust filters or create new project
   * - Parent component should provide filter controls and create button nearby
   */
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No projects found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new project
        </p>
      </div>
    );
  }

  /**
   * Renders the grid of project cards with navigation links.
   * 
   * Maps over the projects array to render a ProjectCard for each item,
   * wrapped in a React Router Link for navigation to project details.
   * 
   * @returns {JSX.Element} Grid container with mapped project card links
   * 
   * @remarks
   * - Grid uses responsive column counts: 1 (mobile), 2 (sm), 3 (lg)
   * - Gap utilities provide consistent spacing between grid items
   * - Link className="block" ensures the entire card area is clickable
   * - ProjectCard receives the full project object for rendering
   * 
   * @example
   * // Rendered HTML structure (simplified)
   * <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
   *   <a href="/dashboard/projects/123" class="block">
   *     <div class="card">...</div>
   *   </a>
   *   <!-- More project cards -->
   * </div>
   */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link 
          to={`/dashboard/projects/${project.projectid}`} 
          key={project.projectid}
          className="block"
          /**
           * Navigates to the project details page when card is clicked.
           * 
           * @remarks
           * - Uses React Router client-side navigation for smooth transitions
           * - Path pattern matches route configuration in App.tsx
           * - Consider adding state prop for passing context if needed
           */
        >
          <ProjectCard project={project} />
        </Link>
      ))}
    </div>
  );
};

export default ProjectsGrid;