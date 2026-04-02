import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateProject } from "../hooks/useCreateProject";
import apiClient from "@/shared/lib/axios";
import { ClientSearchInput } from "@/features/clients/components/ClientSearchInput";
import { UserSearchInput } from "@/features/users/components/UserSearchInput";

export const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createProjectMutation = useCreateProject();


  const fromQuote = searchParams.get('fromQuote');
  const quoteIdParam = searchParams.get('quoteId');
  const accountIdParam = searchParams.get('accountId');
  const accountNameParam = searchParams.get('accountName');

  const [formData, setFormData] = useState({
    projectname: "",
    accountid: 0,
    account_name: "",  // Para mostrar en el search
    assigned_user_id: 0,
    assigned_user_name: "",  // Para mostrar en el search
    projectstatus: "Draft",
    projectpriority: "Medium",
    projecttype: "",
    startdate: "",
    targetenddate: "",
    targetbudget: "",
    projecturl: "",
    description: "",
    potentialid: null as number | null,
    quoteid: null as number | null,
  });

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    const quoteId = fromQuote ? parseInt(fromQuote, 10) : (quoteIdParam ? parseInt(quoteIdParam, 10) : null);
    
    if (quoteId && !quoteData) {
      loadQuoteData(quoteId);
    }
  }, [fromQuote, quoteIdParam]);

  const loadQuoteData = async (id: number) => {
    try {
      setLoadingQuote(true);
      const response = await apiClient.get(`/quotes/${id}`);
      const quote = response.data;
      setQuoteData(quote);

      setFormData(prev => ({
        ...prev,
        projectname: quote.subject || quote.quotename || "",
        accountid: quote.accountid || 0,
        account_name: quote.account_name || '',
        assigned_user_id: quote.assigned_user_id || 0,
        assigned_user_name: quote.assigned_user_name || '',
        projectstatus: "Draft",
        projectpriority: "Medium",
        projecttype: "",
        startdate: "",
        targetenddate: "",
        targetbudget: quote.total?.toString() || quote.total || "",
        projecturl: "",
        description: quote.description || "",
        potentialid: quote.potentialid || null,
        quoteid: id,
      }));


    } catch (error) {
      console.error("Error loading quote data:", error);
      toast.error("Error loading quote data");
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectname.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (!formData.accountid || formData.accountid === 0) {
      toast.error("Client is required");
      return;
    }

    try {
      const payload = {
        ...formData,
        assigned_user_id: formData.assigned_user_id || 2,  // Default to "All Users" if not set
        potentialid: formData.potentialid ?? undefined,
        quoteid: formData.quoteid ?? undefined,
      };

      const result = await createProjectMutation.mutateAsync(payload);
      toast.success("Project created successfully");
      
      // Navegar al detalle del proyecto creado
      if (result?.projectid) {
        navigate(`/dashboard/projects/${result.projectid}`);
      } else {
        navigate('/dashboard/projects');
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.response?.data?.error || "Error creating project. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/projects');
  };

   const handleClientChange = (clientId: number | null) => {
    setFormData(prev => ({
      ...prev,
      accountid: clientId ?? 0,
    }));
  };

  
  const handleUserChange = (userId: number | null) => {
    setFormData(prev => ({
      ...prev,
      assigned_user_id: userId ?? 0,
    }));
  };

  if (loadingQuote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quote data...</p>
        </div>
      </div>
    );
  }

  return (
      <div className=" p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {fromQuote || quoteIdParam ? "Create Project from Quote" : "Create New Project"}
            </h1>
            <p className="text-muted-foreground">
              {fromQuote || quoteIdParam 
                ? `Pre-filled from quote #${fromQuote || quoteIdParam}` 
                : "Complete the information for the new project"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border">
          {/* Project Name */}
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

          {/* Client Search */}
          <ClientSearchInput
            value={formData.accountid || null}
            onChange={handleClientChange}
            label="Client *"
            placeholder="Search client by name..."
            required={true}
            disabled={loadingQuote}
            initialData={
              accountIdParam || quoteData?.accountid
                ? {
                    id: accountIdParam ? parseInt(accountIdParam, 10) : quoteData?.accountid,
                    name: accountNameParam || quoteData?.account_name,
                  }
                : undefined
            }
          />

          {/* User Search Input  */}
          <UserSearchInput
            value={formData.assigned_user_id || null}
            onChange={handleUserChange}
            label="Assigned to"
            placeholder="Search user by name..."
            initialData={
              quoteData?.assigned_user_id
                ? {
                    id: quoteData.assigned_user_id,
                    name: quoteData.assigned_user_name,
                  }
                : undefined
            }
          />

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="projecttype">Project Type</Label>
            <Input
              id="projecttype"
              value={formData.projecttype}
              onChange={(e) => setFormData({ ...formData, projecttype: e.target.value })}
              placeholder="E.g., Furniture, Installation, etc."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startdate">Start Date</Label>
              <DatePicker
                value={formData.startdate || null}
                onChange={(date) => setFormData({ ...formData, startdate: date || "" })}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetenddate">Target End Date</Label>
              <DatePicker
                value={formData.targetenddate || null}
                onChange={(date) => setFormData({ ...formData, targetenddate: date || "" })}
                placeholder="Select target end date"
              />
            </div>
          </div>

          {/* Budget */}
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

          {/* URL */}
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

          {/* Description */}
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

          {/* Quote Info (if creating from quote) */}
          {(fromQuote || quoteIdParam) && quoteData && (
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

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createProjectMutation.isPending}
            >
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
      </div>
  );
};

export default ProjectCreatePage;