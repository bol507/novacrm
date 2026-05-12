import type { Project } from '../../types/projects';

/**
 * Allowed column keys for sorting projects in the table view.
 * 
 * These keys correspond to database columns or computed fields that can be used
 * to order project results. The backend validates these values to prevent SQL injection.
 * 
 * @remarks
 * - 'projectname': Sort by project display name (alphabetical)
 * - 'account_name': Sort by associated client/account name (alphabetical)
 * - 'projectstatus': Sort by workflow status value (alphabetical)
 * - 'targetenddate': Sort by planned completion date (chronological)
 * - 'progress': Sort by completion percentage (numerical)
 * - 'targetbudget': Sort by estimated budget amount (numerical)
 * - 'createdtime': Sort by record creation timestamp (chronological)
 * - 'last_activity': Sort by most recent activity across comments, attachments, tasks (computed)
 * 
 * @example
 * // Using SortKey in a sort change handler
 * const handleSort = (key: SortKey) => {
 *   setSortBy(key);
 *   setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
 * };
 * 
 * @example
 * // Validating user input against allowed sort keys
 * const allowedKeys: SortKey[] = ['projectname', 'targetenddate', 'last_activity'];
 * if (allowedKeys.includes(userSelectedKey)) {
 *   applySorting(userSelectedKey, sortOrder);
 * }
 */
export type SortKey = 
  | 'projectname' 
  | 'account_name' 
  | 'projectstatus' 
  | 'targetenddate' 
  | 'progress' 
  | 'targetbudget'
  | 'createdtime'
  | 'last_activity';

/**
 * Sort direction options for ordering project lists.
 * 
 * @remarks
 * - 'asc': Ascending order (A-Z, 0-9, oldest-first for dates)
 * - 'desc': Descending order (Z-A, 9-0, newest-first for dates)
 * 
 * @example
 * // Toggle sort order in a handler
 * const toggleSortOrder = (current: SortOrder): SortOrder => {
 *   return current === 'asc' ? 'desc' : 'asc';
 * };
 * 
 * @example
 * // Apply sort order to API request
 * const queryParams = new URLSearchParams({
 *   sort_by: sortBy,
 *   sort_order: sortOrder // 'asc' | 'desc'
 * });
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Props interface for the ProjectsTable presentational component.
 * 
 * This interface defines the contract for rendering a sortable, filterable,
 * and actionable table view of project data. The component is purely presentational
 * and delegates all business logic (data fetching, state management, navigation)
 * to its parent container via callbacks and controlled props.
 * 
 * @remarks
 * - Follows the controlled component pattern: parent manages state, child renders UI
 * - Supports render props for customizing cell content without modifying the table component
 * - All callback props are optional; the component handles undefined gracefully
 * - UI configuration props allow adapting the table to different contexts (compact mode, column visibility)
 * 
 * @example
 * // Basic usage with required props only
 * <ProjectsTable
 *   projects={projects}
 *   isLoading={false}
 * />
 * 
 * @example
 * // Full usage with sorting, search, actions, and custom rendering
 * <ProjectsTable
 *   projects={projects}
 *   isLoading={isLoading}
 *   sortBy="last_activity"
 *   sortOrder="desc"
 *   onSortChange={handleSortChange}
 *   searchValue={searchTerm}
 *   onSearchChange={handleSearchChange}
 *   onView={handleViewProject}
 *   onEdit={handleEditProject}
 *   onDelete={handleDeleteProject}
 *   onRefresh={refetchProjects}
 *   renderProjectName={(project) => <strong>{project.projectname}</strong>}
 *   showProgress={true}
 *   showBudget={false}
 *   compact={true}
 * />
 * 
 * @see {@link Project} For the project data structure rendered in table rows
 * @see {@link SortKey} For allowed sorting column identifiers
 * @see {@link SortOrder} For sort direction values
 */
export interface ProjectsTableProps {
  /**
   * Array of project objects to display in the table.
   * 
   * Each project is rendered as a table row with cells mapped to project properties.
   * The array should be pre-sorted by the parent component or API; this component
   * does not perform client-side sorting.
   * 
   * @remarks
   * - Empty array triggers the empty state UI (customizable via renderEmptyState)
   * - Projects are rendered in the order provided; sorting is handled upstream
   * - Each project must have a unique projectid for React key optimization
   * 
   * @example
   * // Typical projects array from paginated API response
   * const projects: Project[] = [
   *   { projectid: 1, projectname: 'Kitchen Renovation', projectstatus: 'in progress', ... },
   *   { projectid: 2, projectname: 'Office Build-out', projectstatus: 'completed', ... },
   * ];
   */
  projects: Project[];

  /**
   * Loading state indicator for asynchronous data fetching.
   * 
   * When true, the component displays a skeleton loading UI instead of project data.
   * This provides visual feedback while data is being fetched from the API.
   * 
   * @remarks
   * - Skeleton UI matches the table structure for consistent layout during loading
   * - Parent should manage this state via React Query or similar data-fetching library
   * - Loading state does not affect the display of search or action controls
   * 
   * @example
   * // Connect loading state to React Query
   * const {  projects, isLoading } = useProjects();
   * <ProjectsTable projects={projects} isLoading={isLoading} />
   */
  isLoading: boolean;

  /**
   * Current sort column key for ordering projects.
   * 
   * Controls which column is used as the primary sort criterion.
   * This prop is controlled by the parent; changes trigger onSortChange callback.
   * 
   * @remarks
   * - Must be one of the allowed SortKey values for backend validation
   * - Default sort behavior is handled by the parent component
   * - Visual indicator (sort icon) is shown in the table header for the active sort column
   * 
   * @default undefined (no explicit sort indicator shown)
   * 
   * @example
   * // Default to sorting by last activity
   * <ProjectsTable sortBy="last_activity" sortOrder="desc" />
   */
  sortBy?: SortKey;

  /**
   * Current sort direction for ordered results.
   * 
   * Controls whether results are sorted ascending or descending.
   * This prop is controlled by the parent; changes trigger onSortChange callback.
   * 
   * @remarks
   * - Works in conjunction with sortBy prop to define complete sort criteria
   * - Visual indicator shows arrow direction for the active sort column
   * - Default sort behavior is handled by the parent component
   * 
   * @default undefined (no explicit sort indicator shown)
   * 
   * @example
   * // Sort by target date, newest first
   * <ProjectsTable sortBy="targetenddate" sortOrder="desc" />
   */
  sortOrder?: SortOrder;

  /**
   * Callback invoked when the user changes sort preferences.
   * 
   * Fired when a table header column is clicked to request sorting.
   * Parent component should update sortBy/sortOrder state and refetch data.
   * 
   * @param sortBy - The column key that was clicked for sorting
   * @param sortOrder - The new sort direction (toggled from current)
   * @returns void
   * 
   * @remarks
   * - Clicking the same column toggles sort order (asc ↔ desc)
   * - Clicking a different column sets that column as primary sort with default direction
   * - Parent is responsible for persisting sort preferences and API integration
   * 
   * @example
   * // Parent handler for sort changes
   * const handleSortChange = (newSortBy: SortKey, newSortOrder: SortOrder) => {
   *   setSortBy(newSortBy);
   *   setSortOrder(newSortOrder);
   *   setPage(1); // Reset to first page when sort changes
   * };
   */
  onSortChange?: (sortBy: SortKey, sortOrder: SortOrder) => void;

  /**
   * Current search term for filtering projects client-side.
   * 
   * Used to filter the displayed projects array by name, number, or client.
   * This filtering is performed client-side for responsive UX; server-side search
   * should be handled via the API with the search parameter.
   * 
   * @remarks
   * - Filtering is case-insensitive and matches partial strings
   * - Empty string or undefined shows all projects (no filtering)
   * - Parent should debounce search input for performance with large datasets
   * 
   * @default undefined (no client-side filtering applied)
   * 
   * @example
   * // Connect search input to table filtering
   * const [searchTerm, setSearchTerm] = useState('');
   * <ProjectsTable searchValue={searchTerm} onSearchChange={setSearchTerm} />
   */
  searchValue?: string;

  /**
   * Callback invoked when the search input value changes.
   * 
   * Fired on each keystroke in the search input field.
   * Parent component should update search state and optionally refetch data.
   * 
   * @param value - The new search term entered by the user
   * @returns void
   * 
   * @remarks
   * - Parent should implement debouncing to avoid excessive API calls
   * - Search changes typically reset pagination to page 1
   * - Empty value clears the filter and shows all projects
   * 
   * @example
   * // Debounced search handler with pagination reset
   * const handleSearchChange = useCallback((value: string) => {
   *   setSearchTerm(value);
   *   setPage(1); // Reset to first page when search changes
   * }, [setSearchTerm, setPage]);
   */
  onSearchChange?: (value: string) => void;

  /**
   * Callback invoked when the "view details" action is triggered for a project.
   * 
   * Fired when the user clicks the view/eye icon or clicks on a project row.
   * Parent component typically handles navigation to project details page.
   * 
   * @param project - The project object that was selected for viewing
   * @returns void
   * 
   * @remarks
   * - Action is available for each project row via icon button or row click
   * - Parent should handle routing via React Router or similar navigation library
   * - Consider passing navigation state for context preservation (e.g., return to list)
   * 
   * @example
   * // Navigate to project details page
   * const handleViewProject = (project: Project) => {
   *   navigate(`/dashboard/projects/${project.projectid}`, {
   *     state: { from: 'projects-list' }
   *   });
   * };
   */
  onView?: (project: Project) => void;

  /**
   * Callback invoked when the "edit" action is triggered for a project.
   * 
   * Fired when the user clicks the edit/pencil icon in the actions menu.
   * Parent component typically handles navigation to project edit form.
   * 
   * @param project - The project object that was selected for editing
   * @returns void
   * 
   * @remarks
   * - Action is available via dropdown menu in the actions column
   * - Parent should handle routing to edit form with project ID
   * - Edit form should pre-populate fields with existing project data
   * 
   * @example
   * // Navigate to project edit page
   * const handleEditProject = (project: Project) => {
   *   navigate(`/dashboard/projects/${project.projectid}/edit`);
   * };
   */
  onEdit?: (project: Project) => void;

  /**
   * Callback invoked when the "delete" action is confirmed for a project.
   * 
   * Fired when the user confirms deletion in the confirmation dialog.
   * Parent component should handle API call and list refetch.
   * 
   * @param project - The project object that was selected for deletion
   * @returns void | Promise<void> - Optional promise for async deletion handling
   * 
   * @remarks
   * - Deletion is protected by a confirmation dialog to prevent accidental data loss
   * - Parent should handle API mutation and error display via toast notifications
   * - After successful deletion, parent should refetch the project list
   * 
   * @example
   * // Handle project deletion with API and feedback
   * const handleDeleteProject = async (project: Project) => {
   *   try {
   *     await deleteProjectMutation.mutateAsync(project.projectid);
   *     toast.success('Project deleted successfully');
   *     refetchProjects(); // Refresh list to reflect deletion
   *   } catch (error) {
   *     toast.error('Failed to delete project');
   *   }
   * };
   */
  onDelete?: (project: Project) => void;

  /**
   * Callback invoked when the refresh action is triggered.
   * 
   * Fired when the user clicks the refresh button to reload project data.
   * Parent component should trigger a refetch of the projects query.
   * 
   * @returns void
   * 
   * @remarks
   * - Provides manual data refresh capability for users
   * - Parent should handle React Query refetch or equivalent data reloading
   * - Button shows loading spinner during refresh operation
   * 
   * @example
   * // Refresh projects via React Query
   * const { refetch } = useProjects();
   * <ProjectsTable onRefresh={refetch} />
   */
  onRefresh?: () => void;

  /**
   * Optional render function for customizing the empty state UI.
   * 
   * Allows parent components to provide custom content when no projects match
   * the current filters or search criteria.
   * 
   * @returns React.ReactNode - Custom JSX to display when projects array is empty
   * 
   * @remarks
   * - Default empty state shows a generic "no projects found" message
   * - Custom render function can include actionable content (create button, filter tips)
   * - Render function is called only when projects.length === 0 and not loading
   * 
   * @example
   * // Custom empty state with call-to-action
   * const renderEmptyState = () => (
   *   <div className="text-center py-8">
   *     <p className="text-muted-foreground">No projects match your filters</p>
   *     <Button onClick={onCreateClick} className="mt-4">
   *       Create your first project
   *     </Button>
   *   </div>
   * );
   * <ProjectsTable renderEmptyState={renderEmptyState} />
   */
  renderEmptyState?: () => React.ReactNode;

  /**
   * Optional render function for customizing project name cell content.
   * 
   * Allows parent components to inject custom UI for the project name column,
   * such as badges, icons, or formatted text.
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
   * such as avatars, status indicators, or formatted links.
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
   * with custom buttons, menus, or interaction patterns.
   * 
   * @param project - The project object being rendered
   * @returns React.ReactNode - Custom JSX to display as action controls
   * 
   * @remarks
   * - Default rendering shows a dropdown with View, Edit, Delete actions
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
   * Flag to control visibility of the progress column.
   * 
   * When false, the progress column (with progress bar and task counts) is hidden.
   * Useful for contexts where progress tracking is not relevant.
   * 
   * @default true
   * 
   * @remarks
   * - Hiding columns can improve table readability on smaller screens
   * - Column visibility should be consistent with user expectations for the view
   * - Parent should persist column preferences if allowing user customization
   * 
   * @example
   * // Hide progress column for executive summary view
   * <ProjectsTable projects={projects} showProgress={false} />
   */
  showProgress?: boolean;

  /**
   * Flag to control visibility of the budget column.
   * 
   * When false, the budget column (with formatted currency values) is hidden.
   * Useful for contexts where financial information should not be displayed.
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
   * <ProjectsTable projects={projects} showBudget={canViewBudget} />
   */
  showBudget?: boolean;

  
  /**
   * Additional CSS class names to apply to the table root container.
   * 
   * Allows parent components to customize spacing, borders, or other styles
   * without modifying the component's internal styles.
   * 
   * @default ""
   * 
   * @remarks
   * - Classes are appended to the component's default className
   * - Use Tailwind utility classes or BEM-style custom classes as needed
   * - Avoid overriding critical layout classes that may break responsive behavior
   * 
   * @example
   * // Add custom margin and border styling
   * <ProjectsTable 
   *   projects={projects} 
   *   className="mt-4 border rounded-lg shadow-sm" 
   * />
   */
  className?: string;
}