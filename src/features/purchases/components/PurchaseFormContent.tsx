import { useMemo, useState } from "react";
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { PurchaseFormItemsList } from "./PurchaseFormItemsList";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import {
    PURCHASE_STATUS_LABELS,
    type Purchase,
    type PurchaseFormData,
    type PurchaseFormValues,
    type PurchaseStatus,
} from "../types/purchase";
import { usePurchaseFormItems } from "../hooks/usePurchaseFormItems";
import { usePurchaseFormCalculations } from "../hooks/usePurchaseFormCalculations";
import { VendorSearch } from "@/features/vendors/components/VendorSearch";
import { ProjectSearch } from "@/features/projects/components/ProjectSearch";

// Validation schema
export const purchaseFormSchema = z.object({
    subject: z.string().min(1, "Subject is required").max(255),
    projectid: z.number().min(1, "Project is required"),
    vendorid: z.number().min(1, "Vendor is required"),
    postatus: z.enum(['Draft', 'Pending Approval', 'Approved', 'Received']).default('Draft'),
    podate: z.string().optional(),
    validtill: z.string().optional(),
    description: z.string().optional(),
    assigned_user_id: z.number().optional(),
});

export interface PurchaseFormContentProps {
    mode: 'create' | 'edit';
    initialData?: Purchase;
    initialProjectId?: number;
    initialProjectName?: string;
    onSubmit: (values: PurchaseFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const PurchaseFormContent = ({
    mode,
    initialData,
    initialProjectId,
    initialProjectName,
    onSubmit,
    onCancel,
    isSubmitting: externalSubmitting,
}: PurchaseFormContentProps) => {
    const [_vendorSearchTerm, _setVendorSearchTerm] = useState("");
    const [_projectSearchTerm, _setProjectSearchTerm] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState<number | null>(
        mode === 'edit' && initialData?.vendorid ? initialData.vendorid : null
    );
    const [selectedProjectId, _setSelectedProjectId] = useState<number | null>(

        mode === 'create' && initialProjectId
            ? initialProjectId
            : mode === 'edit' && initialData?.projectid
                ? initialData.projectid
                : null
    );

    const { items, addItem, removeItem, updateItem, reorderItems, canRemoveItems } = usePurchaseFormItems(initialData?.items);
    const { subtotal, taxtotal, total, formatCurrency } = usePurchaseFormCalculations(items);
    //const { data: vendorResults, isLoading: vendorsLoading } = useSearchVendors(vendorSearchTerm);
    //const { data: projectResults, isLoading: projectsLoading } = useSearchProjects(projectSearchTerm);

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
        defaultValues: useMemo(() => {
            if (mode === 'edit' && initialData) {
                return {
                    subject: initialData.subject,
                    projectid: initialData.projectid,
                    vendorid: initialData.vendorid,
                    postatus: initialData.status,
                    podate: initialData.podate || undefined,
                    validtill: initialData.validtill || undefined,
                    description: initialData.description || '',
                    assigned_user_id: initialData.assigned_user_id,
                };
            }
            return {
                subject: "",
                projectid: initialProjectId || 0,
                vendorid: 0,
                postatus: "Draft" as PurchaseStatus,
                podate: undefined,
                validtill: undefined,
                description: "",
                assigned_user_id: 0,
            };
        }, [mode, initialData, initialProjectId]),
    });

    const handleItemsReorder = (reorderedItems: PurchaseFormData['items']) => {
        reorderItems(reorderedItems);
    };



    const handleSubmit = async (data: PurchaseFormValues) => {
        try {
            const validItems = items.filter(item =>
                item.productname?.trim() && item.quantity > 0 && item.listprice > 0
            );

            if (validItems.length === 0) {
                form.setError('root', {
                    type: 'manual',
                    message: 'You must add at least one valid item'
                });
                toast.error('Please add at least one valid item');
                return;
            }

            const payload: PurchaseFormData = {
                subject: data.subject,
                projectid: selectedProjectId || data.projectid,
                vendorid: selectedVendorId || data.vendorid,
                postatus: mode === 'create' ? 'Draft' : data.postatus,
                podate: data.podate || null,
                validtill: data.validtill || null,
                description: data.description || null,
                assigned_user_id: data.assigned_user_id || 1,
                items: validItems.map(item => ({
                    productid: item.productid,
                    sequence_no: item.sequence_no,
                    productname: item.productname,
                    quantity: item.quantity,
                    listprice: item.listprice,
                    discount_percent: item.discount_percent || 0,
                    description: item.description || null,
                }))
            };

            await onSubmit(payload);
            if (mode === 'create') {
                form.reset();
            }
        } catch (error: any) {
            const backendError = error.response?.data?.error || error.message || 'Unknown error';
            toast.error('Error saving purchase', {
                description: backendError,
                duration: 6000,
            });
            throw error;
        }
    };

    const isSubmitting = externalSubmitting ?? form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {mode === 'create' ? 'Create Purchase Order' : 'Edit Purchase Order'}
                    </h2>
                    {mode === 'edit' && initialData && (
                        <PurchaseStatusBadge status={initialData.status} />
                    )}
                </div>

                {/* Subject */}
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <FormControl>
                                <Input placeholder="Purchase order subject..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Project & Vendor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="projectid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project *</FormLabel>
                                <FormControl>
                                    <ProjectSearch
                                        value={field.value || null}
                                        onChange={(projectId, projectName) => {
                                            field.onChange(projectId);
                                            if (projectName) {
                                                form.setValue('project_search', projectName);
                                            }
                                        }}
                                        placeholder="Search or select a project..."
                                        disabled={mode === 'edit'}
                                        initialProjectName={initialProjectName} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="vendorid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vendor *</FormLabel>
                                <FormControl>
                                    <VendorSearch
                                        value={selectedVendorId}
                                        onChange={(vendorId, vendorName) => {
                                            setSelectedVendorId(vendorId);
                                            field.onChange(vendorId);
                                            if (vendorName) {
                                                form.setValue('vendor_search', vendorName);
                                            }
                                        }}
                                        placeholder="Search for a vendor..."
                                        disabled={mode === 'edit'}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="postatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="podate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PO Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="validtill"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valid Until</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Items List */}
                <PurchaseFormItemsList
                    items={items}
                    onUpdate={updateItem}
                    onAdd={addItem}
                    onRemove={removeItem}
                    canRemove={canRemoveItems}
                    formatCurrency={formatCurrency}
                    onReorder={handleItemsReorder}
                />

                {/* Financial Summary */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Subtotal</div>
                                <div className="text-xl font-bold">{formatCurrency(subtotal)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Tax (7%)</div>
                                <div className="text-xl font-bold text-blue-600">{formatCurrency(taxtotal)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total</div>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(total)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>General Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional details about the purchase..."
                                    className="min-h-24"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Purchase' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};