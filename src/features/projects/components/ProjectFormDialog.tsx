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

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId?: number;
  onSuccess?: () => void;
}

export const ProjectFormDialog = ({ 
  open, 
  onOpenChange, 
  quoteId, 
  onSuccess 
}: ProjectFormDialogProps) => {
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

  const createProjectMutation = useCreateProject();
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [initialClientLoaded, setInitialClientLoaded] = useState(false); // ✅ Para evitar race conditions
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [initialUserLoaded, setInitialUserLoaded] = useState(false); // ✅ Para evitar race conditions

  // ✅ Cargar datos de la cotización si existe
  useEffect(() => {
    if (quoteId && open) {
      loadQuoteData();
    } else {
      // ✅ Resetear estados cuando se cierra el diálogo
      setInitialClientLoaded(false);
      setInitialUserLoaded(false);
      setQuoteData(null);
    }
  }, [quoteId, open]);

  const loadQuoteData = async () => {
    try {
      setLoadingQuote(true);
      const response = await apiClient.get(`/quotes/${quoteId}`);
      const quote = response.data;
      setQuoteData(quote);

      // ✅ Pre-seleccionar cliente y responsable de la cotización
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

      // ✅ Marcar que los datos iniciales están cargados
      setInitialClientLoaded(true);
      
      setInitialUserLoaded(true);
    } catch (error) {
      console.error("Error al cargar datos de cotización:", error);
      toast.error("Error al cargar datos de la cotización");
    } finally {
      setLoadingQuote(false);
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectname.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }

    if (!formData.accountid || formData.accountid === 0) {
      toast.error("El cliente es requerido");
      return;
    }

    try {
      // ✅ Convertir null a undefined para cumplir con el tipo CreateProjectData
      const payload = {
        ...formData,
        assigned_user_id: formData.assigned_user_id || 2, 
        potentialid: formData.potentialid ?? undefined,
        quoteid: formData.quoteid ?? undefined,
      };

      await createProjectMutation.mutateAsync(payload);
      toast.success("Proyecto creado exitosamente");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al crear proyecto:", error);
      toast.error(error.response?.data?.error || "Error al crear el proyecto. Por favor intente nuevamente.");
    }
  };

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
            {quoteId ? "Crear Proyecto desde Cotización" : "Crear Nuevo Proyecto"}
          </DialogTitle>
        </DialogHeader>

        {loadingQuote ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando datos de la cotización...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del Proyecto */}
            <div className="space-y-2">
              <Label htmlFor="projectname">Nombre del Proyecto *</Label>
              <Input
                id="projectname"
                value={formData.projectname}
                onChange={(e) => setFormData({ ...formData, projectname: e.target.value })}
                placeholder="Ej: Proyecto MM Interiores"
                required
              />
            </div>

            {/* Cliente - CORREGIDO */}
            <div className="space-y-2">
              <ClientSearch
                value={initialClientLoaded ? formData.accountid || null : null}
                onChange={(id) => {
                  setFormData(prev => ({ ...prev, accountid: id || 0 }));
                }}
                label="Cliente"
                placeholder="Buscar cliente por nombre..."
                required
              />
              
              
            </div>

            {/* Asignado a - CORREGIDO */}
            <div className="space-y-2">
              
              <UserSearch
                value={initialUserLoaded ? formData.assigned_user_id || null : null}
                onChange={(id) => {
                  setFormData(prev => ({ ...prev, assigned_user_id: id || 0 }));
                }}
                label="Asignado a"
                placeholder="Buscar usuario por nombre..."
                showAllOption={true}
              />
              
              {/* ✅ Mostrar usuario de la cotización si existe */}
              
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="projectstatus">Estado</Label>
              <Select
                value={formData.projectstatus}
                onValueChange={(value) => setFormData({ ...formData, projectstatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Borrador</SelectItem>
                  <SelectItem value="In Progress">En Curso</SelectItem>
                  <SelectItem value="Completed">Completado</SelectItem>
                  <SelectItem value="On Hold">En Espera</SelectItem>
                  <SelectItem value="Cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="projectpriority">Prioridad</Label>
              <Select
                value={formData.projectpriority}
                onValueChange={(value) => setFormData({ ...formData, projectpriority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">Alta</SelectItem>
                  <SelectItem value="Medium">Media</SelectItem>
                  <SelectItem value="Low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Proyecto */}
            <div className="space-y-2">
              <Label htmlFor="projecttype">Tipo de Proyecto</Label>
              <Input
                id="projecttype"
                value={formData.projecttype}
                onChange={(e) => setFormData({ ...formData, projecttype: e.target.value })}
                placeholder="Ej: Muebles, Instalación, etc."
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startdate">Fecha de Inicio</Label>
                <DatePicker
                  value={formData.startdate || null}
                  onChange={(date) => setFormData({ ...formData, startdate: date || "" })}
                  placeholder="Seleccionar fecha de inicio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetenddate">Fecha Límite</Label>
                <DatePicker
                  value={formData.targetenddate || null}
                  onChange={(date) => setFormData({ ...formData, targetenddate: date || "" })}
                  placeholder="Seleccionar fecha límite"
                />
              </div>
            </div>

            {/* Presupuesto */}
            <div className="space-y-2">
              <Label htmlFor="targetbudget">Presupuesto Objetivo (USD)</Label>
              <Input
                id="targetbudget"
                type="number"
                value={formData.targetbudget}
                onChange={(e) => setFormData({ ...formData, targetbudget: e.target.value })}
                placeholder="Ej: 10000"
                min="0"
                step="0.01"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="projecturl">URL del Proyecto</Label>
              <Input
                id="projecturl"
                type="url"
                value={formData.projecturl}
                onChange={(e) => setFormData({ ...formData, projecturl: e.target.value })}
                placeholder="https://ejemplo.com/proyecto"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del proyecto"
                rows={4}
              />
            </div>

            {/* Información de Cotización (si aplica) */}
            {quoteId && quoteData && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <Label className="font-semibold">Cotización Asociada</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Número:</strong> {quoteData.quoteno || quoteData.quote_no}<br />
                  <strong>Cliente:</strong> {quoteData.account_name || 'Sin cliente'}<br />
                  <strong>Total:</strong> ${quoteData.total?.toLocaleString('es-PA') || '0'}
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createProjectMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending || !formData.accountid}
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Proyecto
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