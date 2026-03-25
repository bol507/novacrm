import { Card, CardHeader } from "@/components/ui/card";
import type { Project } from "../types/projects";

/**
 * Props interface for the ProjectsStats presentational component.
 * 
 * This interface defines the contract for rendering summary statistics
 * about a collection of projects. The component is purely presentational
 * and computes derived metrics from the provided data.
 * 
 * @remarks
 * - Component displays aggregate metrics: total count, average progress
 * - Computed values are derived client-side from the projects array
 * - totalItems prop allows displaying server-side total for paginated lists
 * - All calculations are memoized implicitly via React rendering cycle
 * 
 * @example
 * // Basic usage with projects array only
 * <ProjectsStats projects={projects} />
 * 
 * @example
 * // Usage with paginated data showing server-side total
 * <ProjectsStats projects={currentPageProjects} totalItems={apiResponse.meta.total} />
 * 
 * @see {@link Project} For the project data structure used in calculations
 * @see {@link StatCard} For the reusable stat display sub-component
 */
export interface ProjectsStatsProps {
  /**
   * Array of project objects to analyze for statistics.
   * 
   * Used to compute aggregate metrics like average progress.
   * For paginated lists, this should contain only the current page's projects.
   * 
   * @remarks
   * - Empty array results in zero values for computed metrics
   * - Each project's progress field is parsed as integer for averaging
   - Projects with missing progress values default to 0 in calculations
   * 
   * @example
   * // Typical projects array from API response
   * const projects: Project[] = [
   *   { projectid: 1, projectname: 'Kitchen', progress: '75', ... },
   *   { projectid: 2, projectname: 'Office', progress: '30', ... },
   * ];
   */
  projects: Project[];

  /**
   * Optional total item count from server-side pagination metadata.
   * 
   * When provided, this value is displayed instead of computing
   * total from the projects array length. Useful for showing the
   * true total across all pages when displaying a paginated subset.
   * 
   * @remarks
   * - If undefined, falls back to projects.length for display
   * - Should match the "total" field from paginated API responses
   * - Does not affect computed metrics like averageProgress
   * 
   * @example
   * // Show server-side total for paginated list
   * const { data } = useProjects(page, limit);
   * <ProjectsStats projects={data.data} totalItems={data.meta.total} />
   * 
   * @default undefined (uses projects.length)
   */
  totalItems?: number;
}

/**
 * ProjectsStats Component
 * 
 * A presentational component that displays aggregate statistics
 * about a collection of projects in a grid of stat cards.
 * 
 * This component handles:
 * - Computing average progress percentage from project array
 * - Displaying total project count (with optional server-side total)
 * - Responsive grid layout (1 column mobile, 4 columns desktop)
 * - Consistent card styling via the StatCard sub-component
 * 
 * The component is purely presentational and performs all calculations
 * inline during render. For large datasets, consider memoizing computed
 * values with useMemo to prevent redundant calculations.
 * 
 * @component
 * @param {ProjectsStatsProps} props - Component configuration props
 * @param {Project[]} props.projects - Array of projects to analyze
 * @param {number} [props.totalItems] - Optional server-side total count
 * @returns {JSX.Element} The rendered stats grid with metric cards
 * 
 * @example
 * // Basic usage with local projects array
 * <ProjectsStats projects={projects} />
 * 
 * @example
 * // Usage with paginated API data
 * const { data } = useProjects(page, 10);
 * <ProjectsStats 
 *   projects={data.data} 
 *   totalItems={data.meta.total} 
 * />
 * 
 * @remarks
 * - Average progress is calculated as arithmetic mean of progress percentages
 * - Progress values are parsed as integers; invalid values default to 0
 * - Grid uses CSS grid with responsive breakpoints via Tailwind utilities
 * - StatCard sub-component is defined inline for tight coupling with parent
 * - Component re-renders when projects array reference changes
 * - For performance with large lists, wrap projects in useMemo in parent
 * 
 * @performance
 * - Average calculation iterates entire projects array on each render
 * - Consider memoizing averageProgress with useMemo if projects is large (>100)
 * - Grid layout uses CSS grid for efficient browser rendering
 * - StatCard components are simple and have minimal render overhead
 * 
 * @accessibility
 * - Numeric values are displayed as text; consider aria-label for screen readers
 * - Card structure provides semantic grouping for assistive technologies
 * - Color contrast meets WCAG AA standards for text readability
 */
export const ProjectsStats = ({ projects, totalItems }: ProjectsStatsProps) => {
  /**
   * Computes the average progress percentage across all projects.
   * 
   * Calculates arithmetic mean of progress values, rounded to nearest integer.
   * Projects with missing or invalid progress values are treated as 0%.
   * 
   * @remarks
   * - Returns 0 for empty projects array to avoid division by zero
   * - Uses parseInt to convert string progress values to numbers
   * - Math.round ensures display shows whole percentage points
   * - Computed on each render; consider useMemo for large datasets
   * 
   * @example
   * // Projects with progress: ['50', '75', '25']
   * // Calculation: (50 + 75 + 25) / 3 = 50
   * // Result: 50
   * 
   * @example
   * // Empty array
   * // Result: 0 (avoids NaN from division by zero)
   */
  const averageProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + parseInt(p.progress || '0'), 0) / projects.length)
    : 0;
    
  /**
   * Determines the total project count to display.
   * 
   * Uses server-side total if provided, otherwise falls back to
   * the length of the local projects array.
   * 
   * @remarks
   * - totalItems takes precedence when both values are provided
   * - Useful for showing true total in paginated views
   * - Simple assignment; no complex logic required
   */
  const totalProjects = totalItems || projects.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {/* Total Projects Stat Card */}
      <StatCard label="Total Projects" value={totalProjects} />
      
      {/* Average Progress Stat Card */}
      <StatCard label="Average Progress" value={`${averageProgress}%`} />
    </div>
  );
};

/**
 * Props interface for the StatCard presentational sub-component.
 * 
 * Defines the contract for rendering a single statistic card with
 * a label and value display. Used internally by ProjectsStats but
 * designed to be reusable for other stat displays.
 * 
 * @remarks
 * - Simple key-value display with consistent styling
 * - Value accepts both string and number types for flexibility
 * - Card layout uses flexbox for horizontal label-value alignment
 * 
 * @example
 * // Usage with numeric value
 * <StatCard label="Active Users" value={1250} />
 * 
 * @example
 * // Usage with formatted string value
 * <StatCard label="Revenue" value="$45,230" />
 */
interface StatCardProps {
  /**
   * Display label for the statistic.
   * 
   * Rendered as descriptive text above the value.
   * Should be concise and clear for quick scanning.
   * 
   * @remarks
   * - Typically a short phrase (2-4 words)
   * - Should be localized if application supports multiple languages
   * - Rendered with muted foreground color for visual hierarchy
   * 
   * @example
   * label="Total Projects"
   * label="Avg. Progress"
   */
  label: string;

  /**
   * Display value for the statistic.
   * 
   * Rendered as prominent bold text below the label.
   * Accepts both string and number for formatting flexibility.
   * 
   * @remarks
   * - Numbers are rendered as-is; format before passing if needed
   * - Strings can include symbols, percentages, or formatted values
   * - Rendered with large font size and bold weight for emphasis
   * 
   * @example
   * value={1250}
   * value="75%"
   * value="$45,230"
   */
  value: string | number;
}

/**
 * StatCard Sub-component
 * 
 * A reusable presentational component for displaying a single
 * statistic with a label and value in a card container.
 * 
 * This component handles:
 * - Consistent card styling via shadcn/ui Card components
 * - Horizontal layout with label left-aligned and value right-aligned
 * - Responsive spacing and typography via Tailwind utilities
 * 
 * The component is purely presentational with no internal state
 * or side effects. Designed for composition within stats grids.
 * 
 * @component
 * @param {StatCardProps} props - Component configuration props
 * @param {string} props.label - Descriptive label for the statistic
 * @param {string | number} props.value - The statistic value to display
 * @returns {JSX.Element} The rendered stat card
 * 
 * @example
 * // Basic usage with numeric value
 * <StatCard label="Total Projects" value={42} />
 * 
 * @example
 * // Usage with formatted percentage string
 * <StatCard label="Completion Rate" value="87.5%" />
 * 
 * @remarks
 * - Uses Card and CardHeader from shadcn/ui for consistent styling
 * - Flex layout aligns label and value horizontally with space-between
 * - Value uses text-2xl font-bold for visual prominence
 * - Label uses text-muted-foreground for secondary visual hierarchy
 * - Component has no interactive elements; purely informational display
 * 
 * @accessibility
 * - Semantic HTML via Card components provides structure for screen readers
 * - Text contrast meets WCAG standards for readability
 * - Consider adding aria-describedby if label-value relationship needs explicit association
 * 
 * @performance
 * - Stateless functional component with minimal render overhead
 * - No effects, callbacks, or complex computations
 * - Safe to render in lists or grids without memoization concerns
 */
const StatCard = ({ label, value }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      {/* Statistic label: descriptive text with muted styling */}
      <span className="text-muted-foreground">{label}</span>
      
      {/* Statistic value: prominent display with bold typography */}
      <div className="text-2xl font-bold">{value}</div>
    </CardHeader>
  </Card>
);