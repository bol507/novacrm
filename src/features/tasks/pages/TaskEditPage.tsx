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

const TaskEditPage = () => {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  
  const {  data: taskResponse, isLoading: taskLoading } = useTask(Number(taskId))
  const updateMutation = useUpdateTask()
  
  const {  data: usersData } = useUsers({ 
  active: true,           
  enabled: isAdmin,       
  perPage: 100,           
});
  const [formData, setFormData] = useState<UpdateTaskRequest>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos de la tarea existente
  useEffect(() => {
    if (taskResponse?.data) {
      const task = taskResponse.data
      // ✅ Mapear de Task (frontend) a UpdateTaskRequest (camelCase)
      setFormData({
        subject: task.title,              
        dateStart: task.startDate,        
        dueDate: task.dueDate,            
        timeStart: task.startTime,        
        timeEnd: task.dueTime,            
        priority: task.priority,
        status: task.status,
        location: task.location,
        description: task.description,
        assignedUserId: task.assignedUserId,  
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
      newErrors.subject = 'El título es requerido'
    }
    if (!formData.dateStart) { 
      newErrors.dateStart = 'La fecha de inicio es requerida'  
    }
    if (formData.dueDate && formData.dateStart) {
      const start = new Date(formData.dateStart)
      const due = new Date(formData.dueDate)
      if (due < start) {
        newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
     // ✅ DEBUG: Verificar qué se está enviando
  console.log('=== Form Submission Debug ===');
  console.log('formData:', formData);
  console.log('dueDate value:', formData.dueDate);
  console.log('dueDate type:', typeof formData.dueDate);
  console.log('taskId:', taskId);

    if (!validate()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      await updateMutation.mutateAsync({ 
        taskId: Number(taskId),  
        ...formData 
      })
      // O si el hook ya tiene taskId: await updateMutation.mutateAsync(formData)
      
      toast.success('Tarea actualizada correctamente')
      navigate(`/dashboard/tasks/${taskId}`)
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast.error(error.response?.data?.error || 'Error al actualizar la tarea')
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
        <h2 className="text-lg font-semibold">Tarea no encontrada</h2>
        <Button variant="link" onClick={() => navigate("/dashboard/tasks")}>
          Volver a tareas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/tasks/${taskId}`)}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Tarea</h1>
          <p className="text-muted-foreground">
            Modifica los detalles de la tarea
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la tarea</CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Título *</Label>
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={updateMutation.isPending}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Assigned User (Admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label>Asignado a</Label>
                <Select
                  value={formData.assignedUserId?.toString() || ''} 
                  onValueChange={(val) => handleChange('assignedUserId', parseInt(val))}  
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.data?.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.first_name} {u.last_name}
                        {u.id === user?.data.id && ' (Tú)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de inicio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start", !formData.dateStart && "text-muted-foreground", errors.dateStart && "border-destructive")}  
                      disabled={updateMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateStart ? format(new Date(formData.dateStart), 'PPP', { locale: es }) : 'Seleccionar'}  
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateStart ? new Date(formData.dateStart) : undefined}  
                      onSelect={(date) => date && handleChange('dateStart', format(date, 'yyyy-MM-dd'))}  
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
                <Label>Fecha de vencimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start", !formData.dueDate && "text-muted-foreground")}  
                      disabled={updateMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(new Date(formData.dueDate), 'PPP', { locale: es }) : 'Opcional'}  
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate ? new Date(formData.dueDate) : undefined}  
                      onSelect={(date) => date && handleChange('dueDate', format(date, 'yyyy-MM-dd'))} 
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

            {/* Priority & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v: any) => handleChange('priority', v)}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Baja</SelectItem>
                    <SelectItem value="Medium">Media</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => handleChange('status', v)}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">No Iniciada</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Completed">Completada</SelectItem>
                    <SelectItem value="Pending Input">Pendiente</SelectItem>
                    <SelectItem value="Planned">Planificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={updateMutation.isPending}
                placeholder="Ej: Oficina, Zoom, Cliente XYZ"
                maxLength={150}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/tasks/${taskId}`)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                ) : (
                  'Guardar Cambios'
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