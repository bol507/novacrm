import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, AlertCircle, ArrowLeftIcon } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useTask } from "../hooks/useTask"
import type { UpdateTaskRequest } from "../types/task"
import { useAuth, useIsAdmin } from "@/features/auth/hooks/use-auth"
import { useUpdateTask } from "../hooks/use-update-task"
import { useUsers } from "@/features/users/hooks/use-users"

/**
 * TaskEditPage component for editing an existing task.
 *
 * Features:
 * - Fetches task data by ID from URL parameters
 * - Form with validation for required fields
 * - Admin-only user assignment
 * - Date pickers with Spanish locale
 * - Priority and status selection
 * - Loading and error states
 *
 * @component
 * @returns The rendered task edit page
 */
const TaskEditPage = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  
  const { data: taskResponse, isLoading: taskLoading } = useTask(Number(taskId))
  const updateMutation = useUpdateTask()
  
  const { data: usersData } = useUsers({ 
    active: true,           
    enabled: isAdmin,       
    perPage: 100,           
  })
  const [formData, setFormData] = useState<UpdateTaskRequest>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (taskResponse?.data) {
      const task = taskResponse.data
      setFormData({
        subject: task.title,
        date_start: task.startDate,
        due_date: task.dueDate,
        time_start: task.startTime,
        time_end: task.dueTime,
        priority: task.priority,
        status: task.status,
        location: task.location,
        description: task.description,
        assigned_user_id: task.assignedUserId,
      })
    }
  }, [taskResponse])

  const handleChange = (field: keyof UpdateTaskRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.subject?.trim()) {
      newErrors.subject = 'Title is required'
    }
    if (!formData.date_start) {
      newErrors.dateStart = 'Start date is required'
    }
    if (formData.due_date && formData.date_start) {
      const start = new Date(formData.date_start)
      const due = new Date(formData.due_date)
      if (due < start) {
        newErrors.dueDate = 'Due date cannot be earlier than start date'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await updateMutation.mutateAsync({ 
        taskId: Number(taskId),  
        ...formData 
      })
      
      toast.success('Task updated successfully')
      navigate(`/dashboard/tasks/${taskId}`)
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast.error(error.response?.data?.error || 'Error updating task')
    }
  }

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!taskResponse?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Task not found</h2>
        <Button variant="link" onClick={() => navigate("/dashboard/tasks")}>
          Back to tasks
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/tasks/${taskId}`)}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground">
            Modify task details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Fields marked with * are required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Title *</Label>
              <Input
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                disabled={updateMutation.isPending}
                className={cn(errors.subject && "border-destructive")}
              />
              {errors.subject && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={updateMutation.isPending}
                className="min-h-[100px] resize-none"
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Select
                  value={formData.assigned_user_id?.toString() || ''}
                  onValueChange={(val) => handleChange('assigned_user_id', parseInt(val))}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.data?.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.first_name} {u.last_name}
                        {u.id === user?.id && ' (You)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start", !formData.date_start && "text-muted-foreground", errors.dateStart && "border-destructive")}
                      disabled={updateMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_start ? format(new Date(formData.date_start), 'PPP', { locale: es }) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_start ? new Date(formData.date_start) : undefined}
                      onSelect={(date) => date && handleChange('date_start', format(date, 'yyyy-MM-dd'))}
                      disabled={updateMutation.isPending}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateStart && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dateStart}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start", !formData.due_date && "text-muted-foreground")}
                      disabled={updateMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(new Date(formData.due_date), 'PPP', { locale: es }) : 'Optional'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date ? new Date(formData.due_date) : undefined}
                      onSelect={(date) => date && handleChange('due_date', format(date, 'yyyy-MM-dd'))}
                      disabled={updateMutation.isPending}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  key={`priority-${formData.priority}`}
                  value={formData.priority}
                  onValueChange={(v: any) => handleChange('priority', v)}
                  disabled={updateMutation.isPending}
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  key={`status-${formData.status}`}
                  value={formData.status}
                  onValueChange={(v: any) => handleChange('status', v)}
                  disabled={updateMutation.isPending}
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

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={updateMutation.isPending}
                placeholder="E.g., Office, Zoom, Client XYZ"
                maxLength={150}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/tasks/${taskId}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskEditPage