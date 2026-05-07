import { cn } from '@/shared/lib/utils';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectStatusBadge } from '../ProjectStatusBadge';
import { ProjectProgress } from '../ProjectProgress';
import type { Project } from '../../types/projects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Props interface for the ProjectsTableRow presentational component.
 * 
 * This interface defines the contract for rendering a single table row
 * representing a project with data cells and action controls. The component
 * is purely presentational and delegates all business logic to parent
 * components via callbacks and render props.
 * 
 * @remarks
 * - Follows controlled component pattern: parent manages project data and actions
 * - Supports render props for customizing cell content without modifying the row component
 * - All callback props are optional; the component handles undefined gracefully
 * - UI configuration props allow adapting the row to different contexts (compact mode, column visibility)
 * 
 * @example
 * // Basic usage with required props only
 * <ProjectsTableRow
 *   project={project}
 *   showProgress={true}
 *   showBudget={true}
 *   compact={false}
 * />
 * 
 * @example
 * // Full usage with actions and custom rendering
 * <ProjectsTableRow
 *   project={project}
 *   onView={handleViewProject}
 *   onEdit={handleEditProject}
 *   onDelete={handleDeleteProject}
 *   renderProjectName={(project) => <strong>{project.projectname}</strong>}
 *   showProgress={true}
 *   showBudget={false}
 *   compact={true}
 * />
 * 
 * @see {@link Project} For the project data structure rendered in the row
 */
export interface ProjectsTableRowProps {
    /**
     * Project object containing all data to display in the table row.
     * 
     * Each property of the project is mapped to a corresponding table cell.
     * The project object should be pre-processed by the parent component
     * to include any computed or denormalized fields needed for display.
     * 
     * @remarks
     * - All project fields are optional except required identifiers (projectid, projectname)
     * - Date fields should be ISO 8601 strings for consistent formatting
     * - Numeric fields may be strings to preserve decimal precision from API
     * 
     * @example
     * // Typical project object from API response
     * const project: Project = {
     *   projectid: 123,
     *   projectname: 'Kitchen Renovation',
     *   projectstatus: 'in progress',
     *   targetenddate: '2026-06-30',
     *   targetbudget: '25000.00',
     *   // ... other fields
     * };
     */
    project: Project;

    /**
     * Callback invoked when the "view details" action is triggered.
     * 
     * Fired when the user clicks the view icon in the actions menu or
     * clicks on the row itself (if row click navigation is enabled).
     * Parent component typically handles navigation to project details page.
     * 
     * @param project - The project object that was selected for viewing
     * @returns void
     * 
     * @remarks
     * - Row click navigation is enabled when onView is provided
     * - Action menu item also triggers this callback with stopPropagation
     * - Parent should handle routing via React Router or similar navigation library
     * 
     * @example
     * // Navigate to project details page
     * const handleViewProject = (project: Project) => {
     *   navigate(`/dashboard/projects/${project.projectid}`);
     * };
     */
    onView?: (project: Project) => void;

    /**
     * Callback invoked when the "edit" action is triggered.
     * 
     * Fired when the user clicks the edit icon in the actions dropdown menu.
     * Parent component typically handles navigation to project edit form.
     * 
     * @param project - The project object that was selected for editing
     * @returns void
     * 
     * @remarks
     * - Action is only available if onEdit prop is provided
     * - Edit form should pre-populate fields with existing project data
     * - Parent should handle form submission and success/error feedback
     * 
     * @example
     * // Navigate to project edit page
     * const handleEditProject = (project: Project) => {
     *   navigate(`/dashboard/projects/${project.projectid}/edit`);
     * };
     */
    onEdit?: (project: Project) => void;

    /**
     * Callback invoked when the "delete" action is confirmed.
     * 
     * Fired when the user confirms deletion in the confirmation dialog.
     * Parent component should handle API call, error handling, and list refetch.
     * 
     * @param project - The project object that was selected for deletion
     * @returns void | Promise<void> - Optional promise for async deletion handling
     * 
     * @remarks
     * - Deletion is protected by confirmation dialog in parent component
     * - Parent should display success/error feedback via toast notifications
     * - After successful deletion, parent should refetch the project list
     * 
     * @example
     * // Handle project deletion with API and feedback
     * const handleDeleteProject = async (project: Project) => {
     *   try {
     *     await deleteProjectMutation.mutateAsync(project.projectid);
     *     toast.success('Project deleted successfully');
     *     refetchProjects();
     *   } catch (error) {
     *     toast.error('Failed to delete project');
     *   }
     * };
     */
    onDelete?: (project: Project) => void;

    /**
     * Optional render function for customizing project name cell content.
     * 
     * Allows parent components to inject custom UI for the project name column,
     * such as badges, icons, formatted text, or interactive elements.
     * 
     * @param project - The project object being rendered
     * @returns React.ReactNode - Custom JSX to display as the project name
     * 
     * @remarks
     * - Default rendering shows projectname with truncation and tooltip
     * - Custom render function receives the full project object for flexibility
     * - Parent should handle accessibility (tooltips, aria-labels) if customizing
     * 
     * @example
     * // Add a badge for high-priority projects
     * const renderProjectName = (project: Project) => (
     *   <div className="flex items-center gap-2">
     *     <span>{project.projectname}</span>
     *     {project.projectpriority === 'high' && (
     *       <Badge variant="destructive" className="text-xs">High</Badge>
     *     )}
     *   </div>
     * );
     */
    renderProjectName?: (project: Project) => React.ReactNode;

    /**
     * Optional render function for customizing client name cell content.
     * 
     * Allows parent components to inject custom UI for the client/account column,
     * such as avatars, status indicators, formatted links, or conditional rendering.
     * 
     * @param project - The project object being rendered
     * @returns React.ReactNode - Custom JSX to display as the client name
     * 
     * @remarks
     * - Default rendering shows account_name with truncation and tooltip
     * - Custom render function can handle null/undefined account_name gracefully
     * - Parent should maintain consistent styling with table design system
     * 
     * @example
     * // Add a link to client details page
     * const renderClient = (project: Project) => (
     *   project.account_name ? (
     *     <Link to={`/clients/${project.linktoaccountscontacts}`} className="hover:underline">
     *       {project.account_name}
     *     </Link>
     *   ) : (
     *     <span className="text-muted-foreground italic">No client</span>
     *   )
     * );
     */
    renderClient?: (project: Project) => React.ReactNode;

    /**
     * Optional render function for customizing the actions cell content.
     * 
     * Allows parent components to completely override the actions dropdown menu
     * with custom buttons, menus, or interaction patterns specific to their use case.
     * 
     * @param project - The project object being rendered
     * @returns React.ReactNode - Custom JSX to display as action controls
     * 
     * @remarks
     * - Default rendering shows dropdown with View, Edit, Delete actions
     * - Custom render function should handle stopPropagation to prevent row click conflicts
     * - Parent should maintain accessibility standards for custom action controls
     * 
     * @example
     * // Custom actions with additional export option
     * const renderActions = (project: Project) => (
     *   <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
     *     <Button variant="ghost" size="icon" onClick={() => onView(project)}>
     *       <Eye className="h-4 w-4" />
     *     </Button>
     *     <Button variant="ghost" size="icon" onClick={() => onExport(project)}>
     *       <Download className="h-4 w-4" />
     *     </Button>
     *   </div>
     * );
     */
    renderActions?: (project: Project) => React.ReactNode;

    /**
     * Flag to control visibility of the progress column cell.
     * 
     * When false, the progress column (with progress bar and task counts) is not rendered.
     * Must match the visibility state configured for the table header and other rows.
     * 
     * @default true
     * 
     * @remarks
     * - Hiding columns should be consistent across header and all body rows
     * - Useful for contexts where progress tracking is not relevant to the user
     * - Parent should persist column preferences if allowing user customization
     * 
     * @example
     * // Hide progress column for executive summary view
     * <ProjectsTableRow project={project} showProgress={false} showBudget={true} compact={false} />
     */
    showProgress: boolean;

    /**
     * Flag to control visibility of the budget column cell.
     * 
     * When false, the budget column (with formatted currency values) is not rendered.
     * Must match the visibility state configured for the table header and other rows.
     * 
     * @default true
     * 
     * @remarks
     * - Budget visibility may be controlled by user permissions or role-based access
     * - Hiding financial columns can simplify the table for non-financial stakeholders
     * - Parent should handle permission checks before rendering budget data
     * 
     * @example
     * // Hide budget for users without financial permissions
     * const canViewBudget = user.roles.includes('finance');
     * <ProjectsTableRow project={project} showProgress={true} showBudget={canViewBudget} compact={false} />
     */
    showBudget: boolean;

    /**
     * Flag to enable compact display mode for denser information layout.
     * 
     * When true, reduces or omits secondary content (like description text) to fit
     * more rows in the viewport. Useful for power users or large datasets.
     * 
     * @default false
     * 
     * @remarks
     * - Compact mode affects which secondary content is rendered, not just styling
     * - Should be paired with appropriate row height and font sizing in parent table
     * - User preference for compact mode can be persisted to localStorage
     * 
     * @example
     * // Enable compact mode based on user preference
     * const [compact, setCompact] = useState(() => 
     *   localStorage.getItem('tableCompact') === 'true'
     * );
     * <ProjectsTableRow project={project} compact={compact} />
     */
    compact: boolean;
}

/**
 * ProjectsTableRow Component
 * 
 * A presentational component that renders a single table row for a project.
 * 
 * This component handles:
 * - Rendering project data in structured table cells (ID, name, client, status, etc.)
 * - Conditional rendering based on column visibility and compact mode props
 * - Row-level click navigation when onView callback is provided
 * - Action dropdown menu with View, Edit, Delete options
 * - Custom cell rendering via render props for flexible content injection
 * - Date and currency formatting with locale-aware utilities
 * - Visual feedback for overdue dates and interactive states
 * 
 * The component is purely presentational and delegates all business logic
 * (data fetching, state management, navigation, API calls) to parent
 * components via callbacks and controlled props.
 * 
 * @component
 * @param {ProjectsTableRowProps} props - Component configuration props
 * @param {Project} props.project - Project data to render in the row
 * @param {function} [props.onView] - Callback for view details action
 * @param {function} [props.onEdit] - Callback for edit action
 * @param {function} [props.onDelete] - Callback for delete action
 * @param {function} [props.renderProjectName] - Custom renderer for project name cell
 * @param {function} [props.renderClient] - Custom renderer for client name cell
 * @param {function} [props.renderActions] - Custom renderer for actions cell
 * @param {boolean} props.showProgress - Flag to show/hide progress column
 * @param {boolean} props.showBudget - Flag to show/hide budget column
 * @param {boolean} props.compact - Flag to enable compact display mode
 * @returns {JSX.Element} The rendered table row (tr) with project data cells
 * 
 * @example
 * // Basic usage with required props
 * <ProjectsTableRow
 *   project={project}
 *   showProgress={true}
 *   showBudget={true}
 *   compact={false}
 * />
 * 
 * @example
 * // Usage with actions and custom rendering
 * <ProjectsTableRow
 *   project={project}
 *   onView={handleViewProject}
 *   onEdit={handleEditProject}
 *   onDelete={handleDeleteProject}
 *   renderProjectName={(p) => <strong>{p.projectname}</strong>}
 *   showProgress={false}
 *   showBudget={true}
 *   compact={true}
 * />
 * 
 * @remarks
 * - Row is clickable (navigates to details) when onView prop is provided
 * - Click events on action buttons use stopPropagation to prevent row navigation
 * - Date formatting uses Panama locale (es-PA) for consistent regional display
 * - Currency formatting uses USD with Panama locale for thousands separators
 * - Overdue dates are highlighted with orange text for visual urgency
 * - Text truncation with tooltips prevents layout overflow from long values
 * - Component uses cn() utility for conditional class name composition
 * - All interactive elements have appropriate hover and focus states
 * 
 * @accessibility
 * - Row has cursor-pointer style and click handler when navigable
 * - Action buttons have aria-labels via tooltip titles
 * - Truncated text has title attribute for full value on hover
 * - Consider adding keyboard navigation support for row selection in future versions
 * 
 * @performance
 * - Formatting functions (formatCurrency, formatDate) are defined inside component
 *   but are lightweight and do not cause significant re-render overhead
 * - Consider memoizing formatting functions if row re-renders frequently
 * - Conditional rendering (showProgress, showBudget, compact) prevents
 *   unnecessary DOM nodes for hidden content
 * 
 * @see {@link ProjectStatusBadge} For status badge rendering component
 * @see {@link ProjectProgress} For progress bar rendering component
 * @see {@link format} From date-fns for date formatting utilities
 * @see {@link cn} For class name composition utility
 */
export const ProjectsTableRow = ({
    project,
    onView,
    onEdit,
    onDelete,
    renderProjectName,
    renderClient,
    renderActions,
    showProgress,
    showBudget,
    compact,
}: ProjectsTableRowProps) => {
    /**
     * Formats a numeric or string value as USD currency.
     * 
     * Uses Intl.NumberFormat with Panama locale for consistent thousands
     * separators and decimal formatting. Handles undefined, null, and
     * empty values by returning a default "$0" display.
     * 
     * @param {string | number | undefined} value - The value to format as currency
     * @returns {string} Formatted currency string (e.g., "$25,000")
     * 
     * @remarks
     * - Returns "$0" for falsy values (null, undefined, empty string)
     * - Parses string values to float before formatting for numeric accuracy
     * - Uses minimumFractionDigits: 0 to omit unnecessary decimal places
     * - Locale 'es-PA' provides Spanish formatting with USD currency symbol
     * 
     * @example
     * formatCurrency(25000) // Returns "$25,000"
     * formatCurrency("1500.50") // Returns "$1,501" (rounded, no decimals)
     * formatCurrency(null) // Returns "$0"
     */
    const formatCurrency = (value: string | number | undefined): string => {
        if (!value) return '$0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2 ,
        }).format(num);
    };

    /**
     * Formats a date string for display in the table.
     * 
     * Uses date-fns format function with Panama Spanish locale for
     * consistent regional date formatting. Handles invalid or missing
     * dates by returning a dash placeholder.
     * 
     * @param {string | null | undefined} dateString - The ISO date string to format
     * @returns {string} Formatted date string (e.g., "15 Mar 2026") or "-" for invalid
     * 
     * @remarks
     * - Returns "-" for falsy values (null, undefined, empty string)
     * - Wraps date parsing in try-catch to handle malformed date strings gracefully
     * - Format pattern 'dd MMM yyyy' produces concise, readable dates
     * - Locale 'es' provides Spanish month names (Mar, Jun, Sep, etc.)
     * 
     * @example
     * formatDate("2026-03-15") // Returns "15 Mar 2026"
     * formatDate(null) // Returns "-"
     * formatDate("invalid-date") // Returns "-" (caught by try-catch)
     */
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
        } catch {
            return '-';
        }
    };

    /**
     * Determines if the project's target end date is in the past.
     * 
     * Used to apply visual styling (orange text) to overdue dates
     * for immediate visual recognition of delayed projects.
     * 
     * @remarks
     * - Comparison uses JavaScript Date objects for accurate temporal evaluation
     * - Returns false if targetenddate is missing or invalid
     * - Visual indicator helps users quickly identify projects needing attention
     * 
     * @example
     * // Project with end date yesterday
     * const isOverdue = new Date("2026-03-13") < new Date("2026-03-14"); // true
     * 
     * // Project with end date tomorrow
     * const isOverdue = new Date("2026-03-15") < new Date("2026-03-14"); // false
     */
    const isOverdue = project.targetenddate && new Date(project.targetenddate) < new Date();

    return (
        <tr
            className={cn(
                'border-t hover:bg-muted/30 transition-colors',
                onView && 'cursor-pointer'
            )}
            /**
             * Row click handler for navigation to project details.
             * 
             * @remarks
             * - Only enabled when onView callback is provided
             * - Clicking the row triggers the same action as the View menu item
             * - Action button clicks use stopPropagation to prevent row navigation
             */
            onClick={() => onView?.(project)}
            // Optional: Add aria-sort attribute for accessibility when column is sorted
            // aria-sort={sortBy ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
        >
            {/* Project Number Cell: Displays human-readable project code */}
            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {project.project_no}
            </td>

            {/* Project Name Cell: Displays name with optional description */}
            <td className="px-4 py-3">
                {renderProjectName ? (
                    /**
                     * Custom render prop for project name content.
                     * Allows parent to inject custom UI for this cell.
                     */
                    renderProjectName(project)
                ) : (
                    /**
                     * Default rendering: project name with truncation and tooltip,
                     * plus optional description text in non-compact mode.
                     * 
                     * @remarks
                     * - Truncation prevents layout overflow from long project names
                     * - Title attribute shows full name on hover for accessibility
                     * - Description is hidden in compact mode to save vertical space
                     * - Description also has truncation and tooltip for long values
                     */
                    
                        <div className="font-medium truncate max-w-xs" title={project.projectname}>
                            {project.projectname}
                        </div>
                        
                )}
            </td>

            {/* Client Name Cell: Displays associated account name */}
            <td className="px-4 py-3">
                {renderClient ? (
                    /**
                     * Custom render prop for client name content.
                     * Allows parent to inject custom UI for this cell.
                     */
                    renderClient(project)
                ) : (
                    /**
                     * Default rendering: client name with truncation and tooltip,
                     * plus fallback text when no client is associated.
                     * 
                     * @remarks
                     * - Truncation prevents layout overflow from long client names
                     * - Title attribute shows full name on hover for accessibility
                     * - Fallback "Sin cliente" indicates unlinked projects
                     */
                    <div className="truncate max-w-32" title={project.account_name}>
                        {project.account_name || 'Sin cliente'}
                    </div>
                )}
            </td>

            {/* Status Cell: Displays workflow status badge */}
            <td className="px-4 py-3">
                <ProjectStatusBadge status={project.projectstatus || 'en curso'} />
            </td>

            {/* Progress Cell: Conditionally rendered based on showProgress prop */}
            {showProgress && (
                <td className="px-4 py-3 w-32">
                    <ProjectProgress
                        progress={project.progress || '0'}
                        totalTasks={project.totalTasks || 0}
                        completedTasks={project.completedTasks || 0}
                        compact
                    />
                </td>
            )}

            {/* End Date Cell: Displays formatted target date with overdue styling */}
            <td className="px-4 py-3">
                <span className={cn(isOverdue && 'text-orange-600 font-medium')}>
                    {formatDate(project.targetenddate)}
                </span>
            </td>

            {/* Budget Cell: Conditionally rendered based on showBudget prop */}
            {showBudget && (
                <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(project.targetbudget)}
                </td>
            )}

            {/* Actions Cell: Dropdown menu with View/Edit/Delete options */}
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                {renderActions ? (
                    /**
                     * Custom render prop for actions content.
                     * Allows parent to inject custom action controls.
                     * 
                     * @remarks
                     * - Parent should handle stopPropagation to prevent row click conflicts
                     */
                    renderActions(project)
                ) : (
                    /**
                     * Default rendering: Dropdown menu with standard actions.
                     * 
                     * @remarks
                     * - View action triggers onView callback with stopPropagation
                     * - Edit action is conditionally rendered if onEdit is provided
                     * - Delete action is conditionally rendered if onDelete is provided
                     * - Delete action has destructive styling for visual warning
                     * - Menu aligns to end of cell for consistent positioning
                     */
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView?.(project);
                                }}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View details
                            </DropdownMenuItem>
                            {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(project)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete?.(project)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </td>
        </tr>
    );
};