import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";
import type { QuoteFormValues } from "../../types/quote";

/**
 * Props for QuoteFormDescription component
 */
export interface QuoteFormDescriptionProps {
  /** React Hook Form control instance */
  control: Control<QuoteFormValues>;
}

/**
 * QuoteFormDescription Component
 * 
 * Displays the general description textarea for the quote.
 * 
 * @component
 * @param {QuoteFormDescriptionProps} props - Component props
 * @param {Control} props.control - React Hook Form control
 * 
 * @returns {JSX.Element} Description field section
 */
export const QuoteFormDescription = ({ control }: QuoteFormDescriptionProps) => {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>General Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Additional details about the quote..."
              className="min-h-24"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};