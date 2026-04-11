import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { QuoteFormValues } from "../../types/quote";
import type { Control } from "react-hook-form";

/**
 * Props for QuoteFormDescription component
 */
export interface QuoteFormDescriptionProps {
  control: Control<QuoteFormValues>;
}

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