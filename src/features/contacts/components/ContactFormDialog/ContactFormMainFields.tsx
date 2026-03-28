import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Control } from "react-hook-form";
import type { ContactFormValues } from "../../types/contact";

export interface ContactFormMainFieldsProps {
  /** React Hook Form control object for form state management */
  control: Control<ContactFormValues>;
}

/**
 * ContactFormMainFields component for displaying the main contact form fields.
 *
 * Fields included:
 * - First name (required)
 * - Last name (required)
 * - Email (required)
 * - Job title (optional)
 * - Contact status (optional, with Active/Inactive options)
 *
 * @component
 * @param props - Component props
 * @param props.control - React Hook Form control object
 * @param props.mode - Form mode ('create' or 'edit')
 * @returns The rendered main fields section
 *
 * @example
 * // Basic usage
 * <ContactFormMainFields control={form.control} mode="create" />
 *
 * @example
 * // Edit mode
 * <ContactFormMainFields control={form.control} mode="edit" />
 */
export const ContactFormMainFields = ({ control }: ContactFormMainFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="firstname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input placeholder="Juan" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="lastname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name *</FormLabel>
            <FormControl>
              <Input placeholder="Pérez" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="juan@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input placeholder="Purchasing Manager" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="contact_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};