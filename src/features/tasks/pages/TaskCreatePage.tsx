import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import TaskForm from "../components/TaskForm"

const TaskCreatePage = () => {
  const navigate = useNavigate()

  const handleSuccess = (taskId: number) => {
    // Redirect to task detail after successful creation
    navigate(`/tasks/${taskId}`)
  }

  const handleCancel = () => {
    navigate('/tasks')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Tarea</h1>
          <p className="text-muted-foreground">
            Completa el formulario para crear una nueva tarea
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
          <TaskForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskCreatePage