import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProject } from "../hooks/useCreateProject";
import { toast } from "sonner";
import { FileText, Loader2, Plus, X } from "lucide-react";
import apiClient from "@/shared/lib/axios";
import { DatePicker } from "@/components/ui/date-picker";
import { ClientSearch } from "@/components/client-search";
import { UserSearch } from "@/components/user-search";

/**
 * Props for ProjectFormDialog component
 */
export interface ProjectFormDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback to change dialog visibility */
  onOpenChange: (open: boolean) => void;
  /** Optional quote ID to pre-fill project data from an existing quote */
  quoteId?: number;
  /** Optional callback fired when project is successfully created */
  onSuccess?: () => void;
}

/**
 * ProjectFormDialog Component
 * 
 * A dialog form for creating new projects, with optional pre-filling from an existing quote.
 * Supports client search, user assignment, date pickers, budget input, and rich text description.
 * 
 * @component
 * @param {ProjectFormDialogProps} props - Component props
 * @param {boolean} props.open - Dialog visibility state
 * @param {function} props.onOpenChange - Callback to toggle dialog visibility
 * @param {number} [props.quoteId] - Optional quote ID to pre-fill form data
 * @param {function} [props.onSuccess] - Optional callback on successful project creation
 * 
 * @returns {JSX.Element} Project creation form dialog
 * 
 * @example
 * // Basic usage - create new project
 * <ProjectFormDialog 
 *   open={isDialogOpen} 
 *   onOpenChange={setIsDialogOpen} 
 * />
 * 
 * @example
 * // Create project from existing quote
 * <ProjectFormDialog 
 *   open={isDialogOpen} 
 *   onOpenChange={setIsDialogOpen} 
 *   quoteId={123}
 *   onSuccess={() => refetchProjects()}
 * />
 * 
 * @remarks
 * - Form validates required fields: project name and client
 * - When quoteId is provided, fetches quote data to pre-fill form fields
 * - Client and user search components support autocomplete with API results
 * - Budget field accepts numeric input with USD currency formatting
 * - Date pickers use consistent locale formatting throughout the app
 * - On successful submission, calls onSuccess callback and resets form state
 * - Error handling displays user-friendly toast notifications
 * - Dialog closes on cancel, submit success, or external close action
 * 
 * @see {@link useCreateProject} for project creation mutation hook
 * @see {@link ClientSearch} for client autocomplete component
 * @see {@link UserSearch} for user assignment autocomplete component
 * @see {@link DatePicker} for consistent date input component
 */
export const ProjectFormDialog = ({ 
  open, 
  onOpenChange, 
  quoteId, 
  onSuccess 
}: ProjectFormDialogProps) => {
  /**
   * Form state containing all project field values
   * 
   * Initialized with empty/default values, updated via user input
   * or pre-filled from quote data when quoteId is provided
   */
  const [formData, setFormData] = useState({
    projectname: "",
    accountid: 0,
    assigned_user_id: 0,
    projectstatus: "Draft",
    projectpriority: "Medium",
    projecttype: "",
    startdate: "",
    targetenddate: "",
    targetbudget: "",
    projecturl: "",
    description: "",
    potentialid: null as number | null,
    quoteid: quoteId || null,
  });

  /**
   * Mutation hook for creating new project via API
   */
  const createProjectMutation = useCreateProject();
  
  /**
   * Loading state for quote data fetching
   */
  const [loadingQuote, setLoadingQuote] = useState(false);
  
  /**
   * Cached quote data for display in dialog
   */
  const [quoteData, setQuoteData] = useState<any>(null);
  
  /**
   * Flag to track if initial client data has been loaded from quote
   * Prevents overwriting user selections after initial pre-fill
   */
  const [initialClientLoaded, setInitialClientLoaded] = useState(false);
  
  /**
   * Flag to track if initial user data has been loaded from quote
   * Prevents overwriting user selections after initial pre-fill
   */
  const [initialUserLoaded, setInitialUserLoaded] = useState(false);

  /**
   * Effect to load quote data when dialog opens with quoteId
   * 
   * Fetches quote details and pre-fills form fields with relevant data.
   * Resets loading states when dialog closes or quoteId changes.
   * 
   * @remarks
   * - Only runs when quoteId is provided AND dialog is open
   * - Resets form-related flags when dialog closes to prevent stale data
   * - Handles errors gracefully with user feedback via toast
   */
  useEffect(() => {
    if (quoteId && open) {
      loadQuoteData();
    } else {
      // Reset states when dialog closes or quoteId is removed
      setInitialClientLoaded(false);
      setInitialUserLoaded(false);
      setQuoteData(null);
    }
  }, [quoteId, open]);

  /**
   * Fetches quote data from API and pre-fills form fields
   * 
   * Maps quote fields to corresponding project form fields:
   * - subject → projectname
   * - accountid → accountid (client)
   * - assigned_user_id → assigned_user_id
   * - total → targetbudget
   * - description → description
   * - potentialid → potentialid
   * 
   * @async
   * @throws Displays error toast if API call fails
   */
  const loadQuoteData = async () => {
    try {
      setLoadingQuote(true);
      const response = await apiClient.get(`/quotes/${quoteId}`);
      const quote = response.data;
      setQuoteData(quote);

      // Pre-select client and assigned user from quote
      setFormData(prev => ({
        ...prev,
        projectname: quote.subject || quote.quotename || "",
        accountid: quote.accountid || 0,
        assigned_user_id: quote.assigned_user_id || 0,
        projectstatus: "Draft",
        projectpriority: "Medium",
        projecttype: "",
        startdate: "",
        targetenddate: "",
        targetbudget: quote.total?.toString() || quote.total || "",
        projecturl: "",
        description: quote.description || "",
        potentialid: quote.potentialid || null,
        quoteid: quoteId || null,
      }));

      // Mark initial data as loaded to prevent overwriting user edits
      setInitialClientLoaded(true);
      setInitialUserLoaded(true);
    } catch (error) {
      console.error("Error loading quote data:", error);
      toast.error("Error loading quote data");
    } finally {
      setLoadingQuote(false);
    }
  };

  /**
   * Handles form submission with validation and API call
   * 
   * @param e - Form submit event
   * 
   * @remarks
   * Validation rules:
   * - projectname is required and must not be empty
   * - accountid (client) is required and must be a valid ID
   * 
   * Submission flow:
   * 1. Prevent default form submission
   * 2. Validate required fields
   * 3. Transform null values to undefined for API compatibility
   * 4. Call createProject mutation
   * 5. Show success toast, close dialog, call onSuccess callback
   * 6. Handle errors with user-friendly messages
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.projectname.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (!formData.accountid || formData.accountid === 0) {
      toast.error("Client is required");
      return;
    }

    try {
      // Transform null to undefined for API type compatibility
      const payload = {
        ...formData,
        assigned_user_id: formData.assigned_user_id || 2, // Default to "All users" if not set
        potentialid: formData.potentialid ?? undefined,
        quoteid: formData.quoteid ?? undefined,
      };

      await createProjectMutation.mutateAsync(payload);
      toast.success("Project created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.error || "Error creating project. Please try again.");
    }
  };

  /**
   * Handles dialog close with form reset
   * 
   * Resets all form state to initial values and calls parent onOpenChange.
   * Ensures clean state for next dialog open.
   */
  const handleClose = () => {
    setFormData({
      projectname: "",
      accountid: 0,
      assigned_user_id: 0,
      projectstatus: "Draft",
      projectpriority: "Medium",
      projecttype: "",
      startdate: "",
      targetenddate: "",
      targetbudget: "",
      projecturl: "",
      description: "",
      potentialid: null,
      quoteid: quoteId || null,
    });
    setQuoteData(null);
    setInitialClientLoaded(false);
    setInitialUserLoaded(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quoteId ? "Create Project from Quote" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        {/* Loading state for quote data fetch */}
        {loadingQuote ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading quote data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name Field */}
            <div className="space-y-2">
              <Label htmlFor="projectname">Project Name *</Label>
              <Input
                id="projectname"
                value={formData.projectname}
                onChange={(e) => setFormData({ ...formData, projectname: e.target.value })}
                placeholder="E.g., MM Interiors Project"
                required
              />
            </div>

            {/* Client Search Field */}
            <div className="space-y-2">
              <ClientSearch
                value={initialClientLoaded ? formData.accountid || null : null}
                onChange={(id) => {
                  setFormData(prev => ({ ...prev, accountid: id || 0 }));
                }}
                label="Client"
                placeholder="Search client by name..."
                required
              />
            </div>

            {/* Assigned User Search Field */}
            <div className="space-y-2">
              <UserSearch
                value={initialUserLoaded ? formData.assigned_user_id || null : null}
                onChange={(id) => {
                  setFormData(prev => ({ ...prev, assigned_user_id: id || 0 }));
                }}
                label="Assigned to"
                placeholder="Search user by name..."
                showAllOption={true}
              />
            </div>

            {/* Project Status Field */}
            <div className="space-y-2">
              <Label htmlFor="projectstatus">Status</Label>
              <Select
                value={formData.projectstatus}
                onValueChange={(value) => setFormData({ ...formData, projectstatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="projectpriority">Priority</Label>
              <Select
                value={formData.projectpriority}
                onValueChange={(value) => setFormData({ ...formData, projectpriority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Type Field */}
            <div className="space-y-2">
              <Label htmlFor="projecttype">Project Type</Label>
              <Input
                id="projecttype"
                value={formData.projecttype}
                onChange={(e) => setFormData({ ...formData, projecttype: e.target.value })}
                placeholder="E.g., Furniture, Installation, etc."
              />
            </div>

            {/* Date Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startdate">Start Date</Label>
                <DatePicker
                  value={formData.startdate || null}
                  onChange={(date) => setFormData({ ...formData, startdate: date || "" })}
                  placeholder="Select start date"
                />
              </div>
              {/* Target End Date */}
              <div className="space-y-2">
                <Label htmlFor="targetenddate">Target End Date</Label>
                <DatePicker
                  value={formData.targetenddate || null}
                  onChange={(date) => setFormData({ ...formData, targetenddate: date || "" })}
                  placeholder="Select target end date"
                />
              </div>
            </div>

            {/* Budget Field */}
            <div className="space-y-2">
              <Label htmlFor="targetbudget">Target Budget (USD)</Label>
              <Input
                id="targetbudget"
                type="number"
                value={formData.targetbudget}
                onChange={(e) => setFormData({ ...formData, targetbudget: e.target.value })}
                placeholder="E.g., 10000"
                min="0"
                step="0.01"
              />
            </div>

            {/* Project URL Field */}
            <div className="space-y-2">
              <Label htmlFor="projecturl">Project URL</Label>
              <Input
                id="projecturl"
                type="url"
                value={formData.projecturl}
                onChange={(e) => setFormData({ ...formData, projecturl: e.target.value })}
                placeholder="https://example.com/project"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed project description"
                rows={4}
              />
            </div>

            {/* Associated Quote Information (conditional) */}
            {quoteId && quoteData && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <Label className="font-semibold">Associated Quote</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Number:</strong> {quoteData.quoteno || quoteData.quote_no}<br />
                  <strong>Client:</strong> {quoteData.account_name || 'No client'}<br />
                  <strong>Total:</strong> ${quoteData.total?.toLocaleString('es-PA') || '0'}
                </p>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createProjectMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending || !formData.accountid}
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};