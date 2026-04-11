import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Mail, User, Calendar, FileText } from "lucide-react";
import type { Control } from "react-hook-form";
import type { ContactFormValues } from "../../types/contact";

/**
 * Props for ContactFormAdditionalInfo component
 */
export interface ContactFormAdditionalInfoProps {
  control: Control<ContactFormValues>;
}

/**
 * ContactFormAdditionalInfo Component
 *
 * Displays additional information fields:
 * - Address (street, city, state, country, zip)
 * - Secondary email
 * - Other phone
 * - Fax
 * - Assistant
 * - Birthdate
 * - Reports to
 * - Lead source
 * - Description
 *
 * @component
 * @param props - Component props
 * @param props.control - React Hook Form control instance
 * @returns The rendered additional information section
 *
 * @example
 * // Basic usage
 * <ContactFormAdditionalInfo control={form.control} />
 */
export const ContactFormAdditionalInfo = ({ control }: ContactFormAdditionalInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Additional Information</h3>
      </div>

      {/* Address Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Address</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="mailingstreet"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mailingcity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Panama City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mailingstate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="Panama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mailingcountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Panama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="mailingzip"
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
      </div>

      {/* Additional Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="secondaryemail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Secondary Email
                </div>
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="secondary@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="otherphone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Phone</FormLabel>
              <FormControl>
                <Input placeholder="+507 0000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fax</FormLabel>
              <FormControl>
                <Input placeholder="+507 0000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="assistant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assistant
                </div>
              </FormLabel>
              <FormControl>
                <Input placeholder="Assistant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Date
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
          control={control}
          name="leadsource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Source</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes about the contact..."
                className="min-h-24"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};