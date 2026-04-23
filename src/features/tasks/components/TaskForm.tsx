import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, AlertCircle, User } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useCreateTask } from "../hooks/useCreateTask"
import type { CreateTaskPayload } from "../types/task"
import { useAuth, useIsAdmin } from "@/features/auth/hooks/use-auth"
import { useUsers } from "@/features/users/hooks/use-users"
import { Badge } from "@/components/ui/badge"

/**
 * Props for TaskForm component
 */
interface TaskFormProps {
    /** Callback fired when task is successfully created, receives created task ID */
    onSuccess?: (taskId: number) => void
    /** Callback fired when user cancels the form */
    onCancel?: () => void
    /** Initial data to populate form (used for edit mode or pre-filled forms) */
    initialData?: Partial<CreateTaskPayload>
}

/**
 * TaskForm Component
 * 
 * A comprehensive form for creating new tasks in the CRM system.
 * Supports task assignment, priority levels, status tracking, scheduling, and notifications.
 * Admin users can assign tasks to other users; regular users can only assign to themselves.
 * 
 * @component
 * @param {TaskFormProps} props - Component props
 * @param {function} [props.onSuccess] - Callback fired when task is successfully created
 * @param {function} [props.onCancel] - Callback fired when user cancels the form
 * @param {Partial<CreateTaskPayload>} [props.initialData] - Initial data to populate form
 * 
 * @returns {JSX.Element} Task creation form component
 * 
 * @example
 * // Basic usage
 * <TaskForm 
 *   onSuccess={(taskId) => navigate(`/tasks/${taskId}`)}
 *   onCancel={() => navigate('/tasks')}
 * />
 * 
 * @example
 * // With initial data (for pre-filled forms)
 * <TaskForm 
 *   initialData={{
 *     subject: 'Follow up with client',
 *     priority: 'High',
 *     assigned_user_id: currentUser.id
 *   }}
 *   onSuccess={handleSuccess}
 * />
 * 
 * @remarks
 * - Form validation occurs on submit with real-time error clearing
 * - Date validation ensures due date is not before start date
 * - Time validation ensures end time is after start time
 * - Admin users see additional "Assigned to" dropdown
 * - Notification checkbox controls email notifications to assignee
 * - Subject field has 255 character limit
 * - Location field has 150 character limit
 * 
 * @see {@link CreateTaskPayload} for payload structure
 * @see {@link useCreateTask} for mutation hook
 * @see {@link useIsAdmin} for admin role checking
 */
export default function TaskForm({ onSuccess, onCancel, initialData }: TaskFormProps) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: usersData } = useUsers()
    const createMutation = useCreateTask()

    /**
     * Form state with all task fields
     * Initialized with initialData or default values
     */
    const [formData, setFormData] = useState<CreateTaskPayload>({
        subject: initialData?.subject || '',
        date_start: initialData?.date_start || format(new Date(), 'yyyy-MM-dd'),
        due_date: initialData?.due_date || null,
        time_start: initialData?.time_start || null,
        time_end: initialData?.time_end || null,
        priority: initialData?.priority || 'Medium',
        status: initialData?.status || 'Not Started',
        location: initialData?.location || null,
        description: initialData?.description || null,
        related_record_id: initialData?.related_record_id || null,
        related_module_type: initialData?.related_module_type || null,
        send_notification: initialData?.send_notification ?? true,
        assigned_user_id: initialData?.assigned_user_id || user?.id,
    })

    /**
     * Form validation errors state
     * Keys are field names, values are error messages
     */
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Check if current user has admin privileges
    const isAdmin = useIsAdmin()

    /**
     * Handles form field changes and clears associated errors
     * 
     * @param field - Form field name to update
     * @param value - New value for the field
     * 
     * @remarks
     * - Updates formData state with new field value
     * - Automatically clears error for changed field
     * - Supports all CreateTaskPayload field types
     */
    const handleChange = (field: keyof CreateTaskPayload, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    /**
     * Validates all form fields before submission
     * 
     * @returns True if all validations pass, false otherwise
     * 
     * @remarks
     * Validation rules:
     * - Subject is required and max 255 characters
     * - Start date is required
     * - Due date cannot be before start date
     * - End time must be after start time
     * 
     * @see {@link errors} state for error storage
     */
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Validate subject (required, max length)
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required'
        } else if (formData.subject.length > 255) {
            newErrors.subject = 'Subject cannot exceed 255 characters'
        }

        // Validate start date (required)
        if (!formData.date_start) {
            newErrors.date_start = 'Start date is required'
        }

        // Validate due date is not before start date
        if (formData.due_date && formData.date_start && formData.due_date < formData.date_start) {
            newErrors.due_date = 'Due date cannot be before start date'
        }

        // Validate end time is after start time
        if (formData.time_start && formData.time_end && formData.time_end <= formData.time_start) {
            newErrors.time_end = 'End time must be after start time'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    /**
     * Handles form submission with validation and API call
     * 
     * @param e - Form submit event
     * 
     * @remarks
     * Submission flow:
     * 1. Prevent default form submission
     * 2. Run validation
     * 3. Prepare payload with assigned_user_id fallback
     * 4. Call createTask mutation
     * 5. Show success/error toast
     * 6. Navigate or call onSuccess callback
     * 
     * Error handling:
     * - 422: Validation errors from backend
     * - 403: Permission errors (assigning to other users)
     * - Other: Generic error message
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Stop if validation fails
        if (!validate()) {
            toast.error('Please correct the errors in the form')
            return
        }

        try {
            // Ensure assigned_user_id is set (fallback to current user)
            const payload = {
                ...formData,
                assigned_user_id: formData.assigned_user_id || user?.id,
            }

            const response = await createMutation.mutateAsync(payload)

            toast.success(response.message || 'Task created successfully')

            // Navigate or call success callback
            if (onSuccess && response.data?.id) {
                onSuccess(response.data.id)
            } else {
                navigate('/dashboard/tasks')
            }
        } catch (error: any) {
            console.error('Error creating task:', error)

            // Handle validation errors from backend (422)
            if (error.response?.status === 422 && error.response?.data?.messages) {
                const messages = error.response.data.messages
                const firstError = Object.values(messages)[0] as string[]
                toast.error(firstError?.[0] || 'Validation error')
                setErrors(messages)
            }
            // Handle permission errors (403)
            else if (error.response?.status === 403) {
                toast.error(
                    error.response?.data?.error ||
                    'You do not have permission to assign to other users'
                )
            }
            // Handle other errors
            else {
                toast.error(error.response?.data?.error || 'Error creating task')
            }
        }
    }

    // Loading state for submit button
    const isSubmitting = createMutation.isPending

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Field */}
            <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="E.g., Call client ABC"
                    disabled={isSubmitting}
                    className={cn(errors.subject && "border-destructive")}
                />
                {errors.subject && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.subject}
                    </p>
                )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Additional task details..."
                    disabled={isSubmitting}
                    className="min-h-[100px] resize-none"
                />
            </div>

            {/* Assigned User (Admin Only) */}
            {isAdmin && (
                <div className="space-y-2">
                    <Label htmlFor="assigned_user_id" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Assigned to
                    </Label>
                    <Select
                        value={formData.assigned_user_id?.toString() || ''}
                        onValueChange={(value) => handleChange('assigned_user_id', parseInt(value))}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Filter and map active users */}
                            {usersData?.data
                                ?.filter((u) => u.is_active)
                                .map((userItem) => (
                                    <SelectItem
                                        key={userItem.id}
                                        value={userItem.id.toString()}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        {/* Nombre del usuario */}
                                        <span className="flex-1 truncate">
                                            {userItem.first_name} {userItem.last_name}
                                        </span>

                                        {/* Badges de referencia (derecha) */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* ✅ (You) para el usuario actual */}
                                            {userItem.id === user?.id && (
                                                <span className="text-xs text-muted-foreground">(You)</span>
                                            )}

                                            {/* ✅ Badge de Admin (system flag) */}
                                            {userItem.is_admin && userItem.id !== user?.id && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-purple-500/10 text-purple-700 text-[10px] px-1 py-0 h-auto"
                                                >
                                                    Admin
                                                </Badge>
                                            )}

                                            {/* ✅ Badge de Rol Jerárquico (opcional, si quieres mostrarlo) */}
                                            {userItem.rolename && userItem.id !== user?.id && !userItem.is_admin && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    • {userItem.rolename}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}

                            {/* Empty state when no active users */}
                            {(!usersData?.data || usersData?.data?.filter((u) => u.is_active).length === 0) && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    No active users availables
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        If not selected, task will be assigned to you automatically
                    </p>
                </div>
            )}

            {/* Date Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                    <Label htmlFor="date_start">Start Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.date_start && "text-muted-foreground",
                                    errors.date_start && "border-destructive"
                                )}
                                disabled={isSubmitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.date_start ? (
                                    format(new Date(formData.date_start), 'PPP', { locale: es })
                                ) : (
                                    <span>Select date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.date_start ? new Date(formData.date_start) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        handleChange('date_start', format(date, 'yyyy-MM-dd'))
                                    }
                                }}
                                disabled={(date) => date < new Date('1900-01-01')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.date_start && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.date_start}
                        </p>
                    )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.due_date && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.due_date ? (
                                    format(new Date(formData.due_date), 'PPP', { locale: es })
                                ) : (
                                    <span>Optional</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.due_date ? new Date(formData.due_date) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        handleChange('due_date', format(date, 'yyyy-MM-dd'))
                                    }
                                }}
                                disabled={(date) => date < new Date('1900-01-01')}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.due_date && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.due_date}
                        </p>
                    )}
                </div>
            </div>

            {/* Time Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                    <Label htmlFor="time_start">Start Time</Label>
                    <Input
                        id="time_start"
                        type="time"
                        value={formData.time_start || ''}
                        onChange={(e) => handleChange('time_start', e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                    <Label htmlFor="time_end">End Time</Label>
                    <Input
                        id="time_end"
                        type="time"
                        value={formData.time_end || ''}
                        onChange={(e) => handleChange('time_end', e.target.value)}
                        disabled={isSubmitting}
                        className={cn(errors.time_end && "border-destructive")}
                    />
                    {errors.time_end && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.time_end}
                        </p>
                    )}
                </div>
            </div>

            {/* Priority & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value: 'Low' | 'Medium' | 'High') => handleChange('priority', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value: any) => handleChange('status', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Pending Input">Pending Input</SelectItem>
                            <SelectItem value="Planned">Planned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Location Field */}
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="E.g., Main Office, Zoom, Client XYZ"
                    disabled={isSubmitting}
                    maxLength={150}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {(formData.location?.length || 0)}/150 characters
                </p>
            </div>

            {/* Notification Checkbox */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="send_notification"
                    checked={formData.send_notification}
                    onChange={(e) => handleChange('send_notification', e.target.checked)}
                    disabled={isSubmitting}
                    className="rounded border-gray-300"
                />
                <Label htmlFor="send_notification" className="text-sm cursor-pointer">
                    Notify assignee about this task
                </Label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Task'
                    )}
                </Button>
            </div>
        </form>
    )
}