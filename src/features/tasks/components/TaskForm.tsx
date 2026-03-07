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

interface TaskFormProps {
    onSuccess?: (taskId: number) => void
    onCancel?: () => void
    initialData?: Partial<CreateTaskPayload>
}

export default function TaskForm({ onSuccess, onCancel, initialData }: TaskFormProps) {
    const navigate = useNavigate()
    const { user } = useAuth() //
    const { data: usersData } = useUsers()
    const createMutation = useCreateTask()

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
    });

    const [errors, setErrors] = useState<Record<string, string>>({})

    // ✅ Verificar si el usuario actual es administrador
    const isAdmin = useIsAdmin();

    const priorities: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High']
    const statuses: Array<'Not Started' | 'In Progress' | 'Completed' | 'Pending Input' | 'Planned'> = [
        'Not Started',
        'In Progress',
        'Completed',
        'Pending Input',
        'Planned',
    ]

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

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.subject.trim()) {
            newErrors.subject = 'El título es requerido'
        } else if (formData.subject.length > 255) {
            newErrors.subject = 'El título no puede superar los 255 caracteres'
        }

        if (!formData.date_start) {
            newErrors.date_start = 'La fecha de inicio es requerida'
        }

        if (formData.due_date && formData.date_start && formData.due_date < formData.date_start) {
            newErrors.due_date = 'La fecha de vencimiento no puede ser anterior a la fecha de inicio'
        }

        if (formData.time_start && formData.time_end && formData.time_end <= formData.time_start) {
            newErrors.time_end = 'La hora de fin debe ser posterior a la hora de inicio'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        try {
            // ✅ Asegurar que assigned_user_id se envía correctamente
            const payload = {
                ...formData,
                assigned_user_id: formData.assigned_user_id || user?.id,
            };

            const response = await createMutation.mutateAsync(payload);

            toast.success(response.message || 'Tarea creada correctamente');

            if (onSuccess && response.data?.id) {
                onSuccess(response.data.id);
            } else {
                navigate('/dashboard/tasks');
            }
        } catch (error: any) {
            console.error('Error creating task:', error);

            if (error.response?.status === 422 && error.response?.data?.messages) {
                const messages = error.response.data.messages;
                const firstError = Object.values(messages)[0] as string[];
                toast.error(firstError?.[0] || 'Error de validación');
                setErrors(messages);
            } else if (error.response?.status === 403) {
                // ✅ Manejar error de permisos (usuario normal intenta asignar a otro)
                toast.error(error.response?.data?.error || 'No tienes permisos para asignar a otros usuarios');
            } else {
                toast.error(error.response?.data?.error || 'Error al crear la tarea');
            }
        }
    };

    const isSubmitting = createMutation.isPending

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div className="space-y-2">
                <Label htmlFor="subject">Título *</Label>
                <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Ej: Llamar al cliente ABC"
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

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Detalles adicionales de la tarea..."
                    disabled={isSubmitting}
                    className="min-h-[100px] resize-none"
                />
            </div>

            {/* ✅ NEW: Assigned User (only for admins) */}
            {isAdmin && (
                <div className="space-y-2">
                    <Label htmlFor="assigned_user_id" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Asignado a
                    </Label>
                    <Select
                        value={formData.assigned_user_id?.toString() || ''}
                        onValueChange={(value) => handleChange('assigned_user_id', parseInt(value))}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Filtrar solo usuarios activos antes de mapear */}
                            {usersData?.data
                                ?.filter((u) => u.is_active)  
                                .map((userItem) => (
                                    <SelectItem
                                        key={userItem.id}
                                        value={userItem.id.toString()}
                                    >
                                        {userItem.first_name} {userItem.last_name}
                                        {/* Mostrar "(Tú)" si es el usuario actual */}
                                        {userItem.id === user?.id && (
                                            <span className="ml-1 text-muted-foreground">(Tú)</span>
                                        )}
                                        {/* Mostrar badge de Admin si aplica */}
                                        {userItem.role === 'Admin' && userItem.id !== user?.id && (
                                            <span className="ml-1 text-xs text-muted-foreground">(Admin)</span>
                                        )}
                                    </SelectItem>
                                ))}

                            {/* Empty state si no hay usuarios */}
                            {usersData?.data?.filter((u) => u.is_active).length === 0 && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    No hay usuarios activos disponibles
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Si no se selecciona, la tarea se asignará automáticamente al usuario actual
                    </p>
                </div>
            )}

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                    <Label htmlFor="date_start">Fecha de inicio *</Label>
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
                                    <span>Seleccionar fecha</span>
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
                    <Label htmlFor="due_date">Fecha de vencimiento</Label>
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
                                    <span>Opcional</span>
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

            {/* Times Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                    <Label htmlFor="time_start">Hora de inicio</Label>
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
                    <Label htmlFor="time_end">Hora de fin</Label>
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
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value: 'Low' | 'Medium' | 'High') => handleChange('priority', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Baja</SelectItem>
                            <SelectItem value="Medium">Media</SelectItem>
                            <SelectItem value="High">Alta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value: any) => handleChange('status', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
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
                <Label htmlFor="location">Ubicación</Label>
                <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Ej: Oficina principal, Zoom, Cliente XYZ"
                    disabled={isSubmitting}
                    maxLength={150}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {(formData.location?.length || 0)}/150 caracteres
                </p>
            </div>

            {/* Notification */}
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
                    Notificar al asignado sobre esta tarea
                </Label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creando...
                        </>
                    ) : (
                        'Crear Tarea'
                    )}
                </Button>
            </div>
        </form>
    )
}