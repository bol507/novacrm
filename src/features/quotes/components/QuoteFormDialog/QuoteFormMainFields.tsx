import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import type { QuoteFormValues } from "../../types/quote";

/**
 * Props for QuoteFormMainFields component
 */
export interface QuoteFormMainFieldsProps {
  /** React Hook Form control instance */
  control: Control<QuoteFormValues>;
  /** Form mode: 'create' or 'edit' */
  mode: 'create' | 'edit';
}

/**
 * QuoteFormMainFields Component
 * 
 * Displays the main quote fields: subject, stage, and valid until date.
 * 
 * @component
 * @param {QuoteFormMainFieldsProps} props - Component props
 * @param {Control} props.control - React Hook Form control
 * @param {'create' | 'edit'} props.mode - Form mode (stage is disabled in create mode)
 * 
 * @returns {JSX.Element} Main form fields section
 */
export const QuoteFormMainFields = ({ control, mode }: QuoteFormMainFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Subject Field */}
      <FormField
        control={control}
        name="subject"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quote Title *</FormLabel>
            <FormControl>
              <Input placeholder="Quote for project ABC..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quote Stage Field */}
      <FormField
        control={control}
        name="quote_stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={mode === 'create'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Valid Until Field */}
      <FormField
        control={control}
        name="validtill"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Valid until
              </div>
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};