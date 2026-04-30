/**
 * Project entity interface representing a project record in the Vtiger CRM system.
 * 
 * This interface maps to the database structure combining fields from:
 * - vtiger_project table (project-specific fields)
 * - vtiger_crmentity table (common entity metadata)
 * - Related tables via joins (account name, assigned user name)
 * 
 * @remarks
 * - All date fields use ISO 8601 string format (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
 * - Numeric fields that may be null in the database are represented as optional
 * - The progress field is stored as string percentage (e.g., "50" for 50%)
 * - assigned_user_id is required as every project must have an owner
 * - Computed fields (totalTasks, completedTasks, hits) are added by the repository layer
 */
export interface Project {
  /**
   * Unique identifier for the project (primary key).
   * Corresponds to vtiger_project.projectid.
   */
  projectid: number;

  /**
   * Human-readable project number/code for reference.
   * Typically auto-generated (e.g., "PROJ001").
   * Corresponds to vtiger_project.project_no.
   */
  project_no: string;

  /**
   * Display name of the project.
   * Corresponds to vtiger_project.projectname.
   */
  projectname: string;

  /**
   * Current workflow status of the project.
   * Common values: "in progress", "initiated", "completed", "on hold", "cancelled".
   * Corresponds to vtiger_project.projectstatus.
   */
  projectstatus: string;

  /**
   * Priority level assigned to the project.
   * Common values: "low", "normal", "high", "critical".
   * Corresponds to vtiger_project.projectpriority.
   */
  projectpriority: string;

  /**
   * Classification category for the project type.
   * Common values: "operative", "strategic", "other".
   * Corresponds to vtiger_project.projecttype.
   */
  projecttype?: string;

  /**
   * Planned or actual start date of the project.
   * Format: "YYYY-MM-DD".
   * Corresponds to vtiger_project.startdate.
   */
  startdate?: string;

  /**
   * Target completion date for project planning.
   * Format: "YYYY-MM-DD".
   * Corresponds to vtiger_project.targetenddate.
   */
  targetenddate?: string;

  /**
   * Actual completion date, populated when project is finished.
   * Format: "YYYY-MM-DD".
   * Corresponds to vtiger_project.actualenddate.
   */
  actualenddate?: string;

  /**
   * Estimated budget amount for the project.
   * Stored as string to preserve decimal precision.
   * Corresponds to vtiger_project.targetbudget.
   */
  targetbudget?: string;

  /**
   * External URL reference for project documentation or resources.
   * Corresponds to vtiger_project.projecturl.
   */
  projecturl?: string;

  /**
   * Completion percentage as a string value (e.g., "50" for 50%).
   * Calculated based on task completion or manually updated.
   * Corresponds to vtiger_project.progress.
   */
  progress: string;

  /**
   * Detailed description or notes about the project.
   * Stored in vtiger_crmentity.description.
   */
  description?: string;

  /**
   * Foreign key reference to the associated client/account.
   * Corresponds to vtiger_project.linktoaccountscontacts.
   */
  linktoaccountscontacts?: number;

  /**
   * Denormalized client/account name for display purposes.
   * Populated via JOIN with vtiger_account table.
   */
  account_name?: string;

  /**
   * User ID of the assigned project owner/responsible person.
   * Corresponds to vtiger_crmentity.smownerid.
   */
  assigned_user_id: number;

  /**
   * Denormalized assigned user name for display purposes.
   * Populated via JOIN with vtiger_users table.
   */
  assigned_user_name?: string;

  /**
   * View count or engagement metric for the project record.
   * Used for analytics or popularity tracking.
   */
  hits?: number;

  /**
   * Total number of tasks associated with the project.
   * Computed field aggregated from vtiger_projecttask table.
   */
  totalTasks?: number;

  /**
   * Number of completed tasks associated with the project.
   * Computed field aggregated from vtiger_projecttask table.
   */
  completedTasks?: number;

  /**
   * Timestamp when the project record was created.
   * Format: "YYYY-MM-DD HH:MM:SS".
   * Stored in vtiger_crmentity.createdtime.
   */
  createdtime?: string;

  /**
   * Timestamp when the project record was last modified.
   * Format: "YYYY-MM-DD HH:MM:SS".
   * Stored in vtiger_crmentity.modifiedtime.
   */
  modifiedtime?: string;

  /**
   * User ID of the record creator.
   * Corresponds to vtiger_crmentity.smcreatorid.
   */
  smcreatorid?: number;

  /**
   * Duplicate reference to assigned user ID (legacy field).
   * Corresponds to vtiger_crmentity.smownerid.
   * @deprecated Prefer assigned_user_id for consistency
   */
  smownerid?: number;
}

/**
 * Filter parameters for querying projects from the API.
 * 
 * Used to construct query parameters for pagination, search, and filtering.
 * All filter fields are optional except pagination controls.
 * 
 * @example
 * // Filter for active projects with search term
 * const filters: ProjectFilters = {
 *   page: 1,
 *   limit: 20,
 *   search: "kitchen",
 *   status: "active",
 *   sortBy: "targetenddate",
 *   sortOrder: "ASC"
 * };
 * 
 * @example
 * // Filter projects by date range and client
 * const filters: ProjectFilters = {
 *   page: 1,
 *   limit: 10,
 *   clientId: 123,
 *   startDate: "2026-01-01",
 *   endDate: "2026-12-31"
 * };
 */
export interface ProjectFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  startDate?: string;
  endDate?: string;
  clientId?: number;

  /**
   * Column name to sort results by.
   * Must be one of the allowed sortable fields.
   * 
   * @default "last_activity"
   */
  sortBy?: 'createdtime' | 'projectname' | 'targetenddate' | 'progress' | 'last_activity';

  /**
   * Sort direction for ordered results.
   * 
   * @default "DESC"
   */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Data structure for creating a new project via the API.
 * 
 * Represents the required and optional fields for project creation.
 * Used as the request body for POST /projects endpoint.
 * 
 * @remarks
 * - projectname is the only strictly required field for creation
 * - accountid links the project to an existing client/account
 * - assigned_user_id can be null for unassigned projects
 * - Date fields should use "YYYY-MM-DD" format
 * - Monetary fields (targetbudget) should be numeric strings or numbers
 * 
 * @example
 * // Minimal project creation data
 * const createData: CreateProjectData = {
 *   projectname: "Kitchen Renovation",
 *   accountid: 456,
 *   assigned_user_id: 2
 * };
 * 
 * @example
 * // Full project creation with all optional fields
 * const createData: CreateProjectData = {
 *   projectname: "Office Build-out Phase 2",
 *   accountid: 789,
 *   assigned_user_id: 5,
 *   projectstatus: "initiated",
 *   projectpriority: "high",
 *   projecttype: "strategic",
 *   startdate: "2026-04-01",
 *   targetenddate: "2026-09-30",
 *   targetbudget: "75000.00",
 *   projecturl: "https://internal.company.com/projects/789",
 *   description: "Complete office renovation including electrical and plumbing",
 *   potentialid: 101,
 *   quoteid: 202
 * };
 */
export interface CreateProjectData {
  /**
   * Name of the project to create (required).
   * Must be non-empty and unique within the account context.
   */
  projectname: string;

  /**
   * ID of the client/account to associate with the project (required).
   * Must reference an existing record in vtiger_account.
   */
  accountid: number;

  /**
   * ID of the user to assign as project owner.
   * Can be null to create an unassigned project.
   */
  assigned_user_id: number | null;

  /**
   * Initial status for the new project.
   * @default "in progress"
   */
  projectstatus?: string;

  /**
   * Initial priority level for the new project.
   * @default "normal"
   */
  projectpriority?: string;

  /**
   * Initial type classification for the new project.
   * @default "operative"
   */
  projecttype?: string;

  /**
   * Planned start date for the project.
   * Format: "YYYY-MM-DD".
   */
  startdate?: string;

  /**
   * Target completion date for project planning.
   * Format: "YYYY-MM-DD".
   */
  targetenddate?: string;

  /**
   * Estimated budget amount for the project.
   * Should be a numeric string or number.
   */
  targetbudget?: string;

  /**
   * External URL reference for project documentation.
   * Should be a valid HTTP/HTTPS URL.
   */
  projecturl?: string;

  /**
   * Detailed description or scope notes for the project.
   * Supports multi-line text content.
   */
  description?: string;
  progress?: string; 

  /**
   * ID of related sales opportunity (potential).
   * Links project to upstream sales process.
   */
  potentialid?: number | null;

  /**
   * ID of related quote/estimate document.
   * Links project to upstream quoting process.
   */
  quoteid?: number | null;
}

/**
 * API response structure for project list endpoints.
 * 
 * Follows Laravel paginator response format with metadata and hypermedia links.
 * Used for GET /projects endpoint responses.
 * 
 * @example
 * // Typical API response structure
 * {
 *   "data": [/* array of Project objects *\/],
 *   "meta": {
 *     "current_page": 1,
 *     "last_page": 5,
 *     "per_page": 20,
 *     "total": 87
 *   },
 *   "links": {
 *     "first": "https://api.example.com/projects?page=1",
 *     "last": "https://api.example.com/projects?page=5",
 *     "prev": null,
 *     "next": "https://api.example.com/projects?page=2"
 *   }
 * }
 */
export interface ProjectResponse {
  /**
   * Array of project objects for the current page.
   * Empty array if no results match the query criteria.
   */
  data: Project[];

  /**
   * Pagination metadata for navigating result sets.
   */
  meta: {
    /**
     * Current page number (1-based index).
     */
    current_page: number;

    /**
     * Total number of pages available for the query.
     * Calculated as ceil(total / per_page).
     */
    last_page: number;

    /**
     * Number of items returned per page.
     * Matches the limit parameter from the request.
     */
    per_page: number;

    /**
     * Total number of items matching the query across all pages.
     * Used for calculating total pages and displaying result counts.
     */
    total: number;
  };

  /**
   * Hypermedia links for pagination navigation.
   * Follows Laravel paginator link structure.
   */
  links: {
    /**
     * URL for the first page of results.
     */
    first: string;

    /**
     * URL for the last page of results.
     */
    last: string;

    /**
     * URL for the previous page, or null if on first page.
     */
    prev?: string;

    /**
     * URL for the next page, or null if on last page.
     */
    next?: string;
  };
}

/**
 * View mode options for project list display.
 * 
 * Controls the layout presentation of project lists in the UI.
 * 
 * @remarks
 * - "cards": Grid layout with visual project cards, better for visual scanning
 * - "table": Tabular layout with sortable columns, better for data comparison
 * - User preference is persisted to localStorage for consistent experience
 * 
 * @example
 * // Toggle view mode in component state
 * const [viewMode, setViewMode] = useState<ProjectViewMode>("cards");
 * 
 * // Conditional rendering based on view mode
 * {viewMode === "cards" ? <ProjectsGrid /> : <ProjectsTable />}
 */
export type ProjectViewMode = "cards" | "table";

/**
 * Data structure for updating an existing project via the API.
 * 
 * Represents the optional fields that can be modified for a project.
 * Used as the request body for PUT /projects/:id endpoint.
 * 
 * @remarks
 * - All fields are optional; only provided fields are updated (partial update)
 * - Unspecified fields retain their existing values in the database
 * - Date fields should use "YYYY-MM-DD" format
 * - Monetary fields should be numeric strings or numbers
 * - assigned_user_id can be set to null to unassign a project
 * 
 * @example
 * // Update only project status
 * const updateData: ProjectUpdateData = {
 *   projectstatus: "completed"
 * };
 * 
 * @example
 * // Update multiple fields including dates and budget
 * const updateData: ProjectUpdateData = {
 *   projectstatus: "in progress",
 *   targetenddate: "2026-08-15",
 *   targetbudget: "50000.00",
 *   assigned_user_id: 3
 * };
 */
export interface ProjectUpdateData {
  /**
   * Updated project name.
   * Must be non-empty if provided.
   */
  projectname?: string;

  /**
   * Updated client/account association.
   * Must reference an existing account record.
   */
  accountid?: number;

  /**
   * Updated assigned user ID.
   * Can be set to null to unassign the project.
   */
  assigned_user_id?: number | null;

  /**
   * Updated project status value.
   */
  projectstatus?: string;

  /**
   * Updated project priority level.
   */
  projectpriority?: string;

  /**
   * Updated project type classification.
   */
  projecttype?: string;

  /**
   * Updated project start date.
   * Format: "YYYY-MM-DD".
   */
  startdate?: string;
  actualenddate?: string; 

  /**
   * Updated target completion date.
   * Format: "YYYY-MM-DD".
   */
  targetenddate?: string;

  /**
   * Updated estimated budget amount.
   */
  targetbudget?: string;

  /**
   * Updated external URL reference.
   */
  projecturl?: string;

  /**
   * Updated project description.
   */
  description?: string;
  progress?: string; 

  /**
   * Updated related opportunity (potential) ID.
   */
  potentialid?: number | null;

  /**
   * Updated related quote/estimate ID.
   */
  quoteid?: number | null;
}

/**
 * Form data structure for project creation and editing forms.
 * 
 * Represents the controlled component state for the ProjectForm.
 * Used internally by form components before submission to API.
 * 
 * @remarks
 * - Differs from CreateProjectData/ProjectUpdateData by having required status/priority/type
 * - Provides default values for select fields to ensure form validity
 * - targetbudget is stored as string for number input compatibility
 * - Used for both create and edit modes with different initialization logic
 * 
 * @example
 * // Initial form state for create mode
 * const initialFormData: FormData = {
 *   projectname: "",
 *   projectstatus: "in progress",
 *   projectpriority: "normal",
 *   projecttype: "operative",
 *   // ... other fields
 * };
 * 
 * @example
 * // Form state populated from existing project (edit mode)
 * const editFormData: FormData = {
 *   projectname: project.projectname,
 *   accountid: project.linktoaccountscontacts,
 *   projectstatus: project.projectstatus || "in progress",
 *   // ... other fields with fallbacks
 * };
 */
export interface FormData {
  /**
   * Project name input value (required field).
   * Validated for non-empty string before submission.
   */
  projectname: string;

  /**
   * Client/account ID input value.
   * Optional; can be undefined for unlinked projects.
   */
  accountid?: number;

  /**
   * Assigned user ID input value.
   * Optional; can be null for unassigned projects.
   */
  assigned_user_id?: number | null;

  /**
   * Project status select value (required for form validity).
   * Must be one of the allowed status options.
   * @default "in progress"
   */
  projectstatus: string;

  /**
   * Project priority select value (required for form validity).
   * Must be one of the allowed priority options.
   * @default "normal"
   */
  projectpriority: string;

  /**
   * Project type select value (required for form validity).
   * Must be one of the allowed type options.
   * @default "operative"
   */
  projecttype: string;

  /**
   * Start date input value.
   * Format: "YYYY-MM-DD" from date input element.
   */
  startdate?: string;
  actualenddate?: string; 

  /**
   * Target end date input value.
   * Format: "YYYY-MM-DD" from date input element.
   */
  targetenddate?: string;

  /**
   * Budget input value as string.
   * Stored as string for compatibility with number input type.
   */
  targetbudget?: string;

  /**
   * Project URL input value.
   * Should be a valid URL format if provided.
   */
  projecturl?: string;

  /**
   * Description textarea value.
   * Supports multi-line text content.
   */
  description?: string;
  progress?: string; 
}