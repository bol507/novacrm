import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Phone, Smartphone, Briefcase } from "lucide-react";
import type { Control } from "react-hook-form";
import type { ContactFormValues } from "../../types/contact";

/**
 * Props for ContactFormContactInfo component
 */
export interface ContactFormContactInfoProps {
  /** React Hook Form control instance */
  control: Control<ContactFormValues>;
}

/**
 * ContactFormContactInfo Component
 *
 * Displays contact information fields:
 * - Phone
 * - Mobile
 * - Department
 *
 * @component
 * @param props - Component props
 * @param props.control - React Hook Form control instance
 * @returns The rendered contact information section
 *
 * @example
 * // Basic usage
 * <ContactFormContactInfo control={form.control} />
 */
export const ContactFormContactInfo = ({ control }: ContactFormContactInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Contact Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phone */}
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
              </FormLabel>
              <FormControl>
                <Input placeholder="+507 0000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mobile */}
        <FormField
          control={control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </div>
              </FormLabel>
              <FormControl>
                <Input placeholder="+507 6000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Department */}
        <FormField
          control={control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Department
                </div>
              </FormLabel>
              <FormControl>
                <Input placeholder="Sales, Purchasing, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};