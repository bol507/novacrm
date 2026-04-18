import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { vendorFormSchema, type VendorFormValues, type Vendor } from "../types/vendor";
import { useMemo } from "react";

export interface VendorFormContentProps {
  mode: "create" | "edit";
  initialData?: Vendor;
  onSubmit: (values: VendorFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const VendorFormContent = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: VendorFormContentProps) => {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: useMemo(() => {
      if (mode === "edit" && initialData) {
        return {
          vendorname: initialData.vendorname,
          email: initialData.email || "",
          phone: initialData.phone || "",
          category: initialData.category || "",
          website: initialData.website || "",
          street: initialData.address || "",
          city: initialData.city || "",
          state: initialData.state || "",
          code: initialData.postalcode || "",
          country: initialData.country || "",
          description: initialData.description || "",
          assigned_user_id: initialData.assigned_user_id || 1,
        };
      }
      return {
        vendorname: "",
        email: "",
        phone: "",
        category: "",
        website: "",
        street: "",
        city: "",
        state: "",
        code: "",
        country: "",
        description: "",
        assigned_user_id: 1,
      };
    }, [mode, initialData]),
  });

  const handleSubmit = async (values: VendorFormValues) => {
    // Limpia campos vacíos antes de enviar
    const payload = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== undefined && v !== "")
    ) as VendorFormValues;

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Create Vendor" : "Edit Vendor"}
          </h2>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendorname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Materials, Services..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="vendor@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+507 0000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <div className="space-y-3 pt-2 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Street address..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="00000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this vendor..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Vendor" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};