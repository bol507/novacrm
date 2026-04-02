import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign } from "lucide-react";
import { OPPORTUNITY_STAGES } from "../types/opportunity";
import { ClientSearchInput } from "@/features/clients/components/ClientSearchInput";
import { UserSearchInput } from "@/features/users/components/UserSearchInput";
import { toast } from "sonner";

export const opportunityFormSchema = z.object({
  potentialname: z.string().min(1, "Name is required").max(255),
  sales_stage: z.enum(OPPORTUNITY_STAGES),
  amount: z.number().min(0).optional(),
  closingdate: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
});

export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;

export type OpportunityPayload = OpportunityFormValues & {
  related_to: number | null;
  assigned_user_id: number | null;
};

export interface OpportunityFormProps {
  mode?: "create" | "edit";
  initialData?: any;
  onSubmit: (values: OpportunityPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const OpportunityForm = ({
  mode = "create",
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: OpportunityFormProps) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    initialData?.related_to ?? null
  );

  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    initialData?.assigned_user_id ?? null
  );

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: useMemo(() => {
      if (mode === "edit" && initialData) {
        return {
          potentialname: initialData.potentialname,
          sales_stage: initialData.sales_stage,
          amount: initialData.amount || undefined,
          closingdate: initialData.closingdate || undefined,
          probability: initialData.probability || undefined,
          description: initialData.description || "",
        };
      }
      return {
        potentialname: "",
        sales_stage: "Prospecting",
        amount: undefined,
        closingdate: undefined,
        probability: undefined,
        description: "",
      };
    }, [mode, initialData]),
  });

  const handleSubmit = (data: OpportunityFormValues) => {
    if (mode === "create" && selectedClientId == null) {
      toast.error("Por favor selecciona un cliente relacionado");
      return;
    }

    if (mode === "create" && selectedUserId == null) {
      toast.error("Por favor asigna un usuario responsable");
      return;
    }

    const payload: OpportunityPayload = {
      potentialname: data.potentialname,
      sales_stage: data.sales_stage,
      amount: data.amount,
      closingdate: data.closingdate,
      probability: data.probability,
      related_to: selectedClientId,
      assigned_user_id: selectedUserId,
      description: data.description,
    };

    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="potentialname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opportunity Name *</FormLabel>
              <FormControl>
                <Input placeholder="CRM Implementation for Company ABC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sales_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OPPORTUNITY_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Estimated value
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="closingdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Closing date
                  </div>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ✅ Componentes reutilizables */}
        <ClientSearchInput
          value={selectedClientId}
          onChange={setSelectedClientId}
          label="Related client"
          required={mode === "create"}
          disabled={isLoading}
          initialData={
            mode === "edit"
              ? { id: initialData?.related_to, name: initialData?.related_to_name }
              : undefined
          }
        />

        <UserSearchInput
          value={selectedUserId}
          onChange={setSelectedUserId}
          label="Assigned to"
          required={mode === "create"}
          disabled={isLoading}
          initialData={
            mode === "edit"
              ? { id: initialData?.assigned_user_id, name: initialData?.assigned_user_name }
              : undefined
          }
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about the opportunity..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "edit" ? "Update Opportunity" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OpportunityForm;