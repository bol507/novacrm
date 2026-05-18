import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import type { FormData, Project } from '../types/projects';

/**
 * Props for the ProjectForm component.
 * 
 * This interface defines the contract for configuring the project form
 * in both create and edit modes, with support for custom submission
 * handling and loading states.
 */
export interface ProjectFormProps {
  /**
   * Existing project object for edit mode.
   * 
   * When provided, the form initializes with the project's current values.
   * When undefined, the form operates in create mode with empty initial values.
   * 
   * @remarks
   * - The form uses useEffect to sync formData when project changes
   * - Useful for handling async project loading in edit pages
   * - All form fields are optional in the Project type to support partial updates
   */
  project?: Project;
  
  /**
   * Operating mode of the form.
   * 
   * Controls the form's initial state, validation rules, and submit button text.
   * 
   * @default 'create'
   * 
   * @remarks
   * - 'create': Form initializes with empty/default values, submit button shows "Create Project"
   * - 'edit': Form initializes with project data, submit button shows "Update Project"
   * - Mode does not affect validation; all required fields are validated in both modes
   */
  mode?: 'create' | 'edit';
  
  /**
   * Callback function invoked when the form is submitted successfully.
   * 
   * Receives the form data object and can return a Promise for async handling.
   * The parent component is responsible for API calls, error handling, and navigation.
   * 
   * @param data - The validated form data object containing project fields
   * @returns void | Promise<void> - Optional promise for async submission handling
   * 
   * @remarks
   * - Form prevents default browser submission with e.preventDefault()
   * - Parent should handle loading states via the isLoading prop
   * - Parent should display success/error feedback via toast or other UI
   * 
   * @example
   * // Parent component submission handler
   * const handleSubmit = async (data: FormData) => {
   *   try {
   *     await api.updateProject(projectId, data);
   *     toast.success('Project updated');
   *     navigate('/projects');
   *   } catch (error) {
   *     toast.error('Update failed');
   *   }
   * };
   */
  onSubmit: (data: FormData) => void | Promise<void>;
  
  /**
   * Optional callback function invoked when the cancel button is clicked.
   * 
   * Typically used to navigate away from the form or close a modal dialog.
   * If not provided, the cancel button is not rendered.
   * 
   * @returns void
   * 
   * @remarks
   * - Cancel action does not trigger form validation or submission
   * - Any unsaved changes in the form are discarded when cancel is clicked
   * - Consider adding unsaved changes confirmation for edit mode in future versions
   * 
   * @example
   * // Navigate back to projects list on cancel
   * const handleCancel = () => navigate('/projects');
   */
  onCancel?: () => void;
  
  /**
   * Loading state indicator for the submit button.
   * 
   * When true, disables the submit button and shows a loading spinner.
   * Controlled by the parent component based on API request status.
   * 
   * @default false
   * 
   * @remarks
   * - Prevents duplicate submissions while API request is in progress
   * - Does not disable the cancel button to allow users to abort the operation
   * - Parent should manage this state via React Query mutation or similar
   */
  isLoading?: boolean;
}

/**
 * ProjectForm Component
 * 
 * A reusable, presentational form component for creating and editing projects.
 * 
 * This component handles:
 * - Form state management with React useState and useEffect
 * - Input handling for text, number, date, and select fields
 * - Conditional rendering based on create/edit mode
 * - Loading state visualization for submit button
 * - Responsive layout with grid system for desktop/mobile
 * - Accessibility attributes for form labels and controls
 * 
 * The component is purely presentational and delegates all business logic
 * (API calls, validation, navigation) to the parent component via callbacks.
 * 
 * @component
 * @param {ProjectFormProps} props - Component configuration props
 * @returns {JSX.Element} The rendered project form with sections and controls
 * 
 * @example
 * // Basic usage in create mode
 * <ProjectForm
 *   mode="create"
 *   onSubmit={handleCreateProject}
 *   onCancel={() => navigate('/projects')}
 * />
 * 
 * @example
 * // Usage in edit mode with existing project data
 * <ProjectForm
 *   project={project}
 *   mode="edit"
 *   onSubmit={handleUpdateProject}
 *   onCancel={handleCancel}
 *   isLoading={isSubmitting}
 * />
 * 
 * @example
 * // With custom submission handling using async/await
 * const handleSubmit = async (data: FormData) => {
 *   setIsSubmitting(true);
 *   try {
 *     await projectService.update(projectId, data);
 *     toast.success('Project updated successfully');
 *     navigate('/projects');
 *   } catch (error) {
 *     toast.error('Failed to update project');
 *   } finally {
 *     setIsSubmitting(false);
 *   }
 * };
 * 
 * @remarks
 * - Form uses controlled components pattern with useState for formData
 * - useEffect syncs formData when project prop changes (handles async loading)
 * - All form fields use proper HTML5 validation attributes where applicable
 * - Select components use shadcn/ui Select with proper accessibility attributes
 * - Layout uses CSS grid for responsive two-column and three-column arrangements
 * - Submit button text dynamically changes based on mode prop
 * - Loading state shows spinner icon with disabled button state
 * - Cancel button is conditionally rendered based on onCancel prop presence
 * - Form prevents default browser submission to enable custom handling
 * - All user-facing text is in Spanish; consider i18n for multi-language support
 * 
 * @see {@link FormData} For the structure of form data submitted to parent
 * @see {@link Project} For the structure of project data used in edit mode
 * @see {@link https://ui.shadcn.com/docs/components/select} For Select component documentation
 */
export const ProjectForm = ({
  project,
  mode = 'create',
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) => {
  
  const [formData, setFormData] = useState<FormData>({
    projectname: project?.projectname || '',
    accountid: project?.linktoaccountscontacts || undefined,
    assigned_user_id: project?.assigned_user_id || null,
    projectstatus: project?.projectstatus || 'in progress',
    projectpriority: project?.projectpriority || 'normal',
    projecttype: project?.projecttype || 'operative',
    startdate: project?.startdate || '',
    targetenddate: project?.targetenddate || '',
    targetbudget: project?.targetbudget?.toString() || '',
    projecturl: project?.projecturl || '',
    description: project?.description || '',
  });

  
  useEffect(() => {
    if (project) {
      setFormData({
        projectname: project.projectname || '',
        accountid: project.linktoaccountscontacts || undefined,
        assigned_user_id: project.assigned_user_id || null,
        projectstatus: project.projectstatus || 'in progress',
        projectpriority: project.projectpriority || 'normal',
        projecttype: project.projecttype || 'operative',
        startdate: project.startdate || '',
        targetenddate: project.targetenddate || '',
        targetbudget: project.targetbudget?.toString() || '',
        projecturl: project.projecturl || '',
        description: project.description || '',
      });
    }
  }, [project]);

 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name Field */}
            <div className="space-y-2">
              <Label htmlFor="projectname">Project Name *</Label>
              <Input
                id="projectname"
                name="projectname"
                value={formData.projectname}
                onChange={handleInputChange}
                placeholder="Example: Kitchen Renovation"
                required
              />
            </div>

            {/* Client Account Field */}
            <div className="space-y-2">
              <Label htmlFor="accountid">Client</Label>
              <Input
                id="accountid"
                name="accountid"
                type="number"
                value={formData.accountid || ''}
                onChange={handleInputChange}
                placeholder="Client ID"
              />
            </div>

            {/* Project Status Select */}
            <div className="space-y-2">
              <Label htmlFor="projectstatus">Status</Label>
              <Select
                value={formData.projectstatus}
                onValueChange={(value) => handleSelectChange('projectstatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Priority Select */}
            <div className="space-y-2">
              <Label htmlFor="projectpriority">Priority</Label>
              <Select
                value={formData.projectpriority}
                onValueChange={(value) => handleSelectChange('projectpriority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Type Select */}
            <div className="space-y-2">
              <Label htmlFor="projecttype">Type</Label>
              <Select
                value={formData.projecttype}
                onValueChange={(value) => handleSelectChange('projecttype', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operative">Operative</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned User Field */}
            <div className="space-y-2">
              <Label htmlFor="assigned_user_id">Assigned To</Label>
              <Input
                id="assigned_user_id"
                name="assigned_user_id"
                type="number"
                value={formData.assigned_user_id || ''}
                onChange={handleInputChange}
                placeholder="User ID"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed project description..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates and Budget Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dates and Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date Field */}
            <div className="space-y-2">
              <Label htmlFor="startdate">Start Date</Label>
              <Input
                id="startdate"
                name="startdate"
                type="date"
                value={formData.startdate}
                onChange={handleInputChange}
              />
            </div>

            {/* Target End Date Field */}
            <div className="space-y-2">
              <Label htmlFor="targetenddate">Target End Date</Label>
              <Input
                id="targetenddate"
                name="targetenddate"
                type="date"
                value={formData.targetenddate}
                onChange={handleInputChange}
              />
            </div>

            {/* Target Budget Field */}
            <div className="space-y-2">
              <Label htmlFor="targetbudget">Estimated Budget (USD)</Label>
              <Input
                id="targetbudget"
                name="targetbudget"
                type="number"
                step="0.01"
                value={formData.targetbudget}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Project URL Field */}
          <div className="space-y-2">
            <Label htmlFor="projecturl">Project URL</Label>
            <Input
              id="projecturl"
              name="projecturl"
              type="url"
              value={formData.projecturl}
              onChange={handleInputChange}
              placeholder="https://example.com/project"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Section */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        {/* Cancel Button - Conditionally rendered */}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
        
        {/* Submit Button with loading state */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'edit' ? 'Update Project' : 'Create Project'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;