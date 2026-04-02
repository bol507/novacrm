import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ACCOUNT_TYPES,
  INDUSTRIES,
  RATINGS,
  type Client,
  type ClientFormData,
} from "@/features/clients/types/client";
import { useMemo } from "react";

/**
 * Zod validation schema for the client form.
 * Defines validation rules for all client fields.
 */
const clientFormSchema = z.object({
  accountname: z.string().min(1, "Name is required").max(100),
  account_no: z.string().max(50).optional(),
  account_type: z.string().optional(),
  industry: z.string().optional(),
  annualrevenue: z.coerce.number().optional(),
  rating: z.string().optional(),
  ownership: z.string().max(50).optional(),
  siccode: z.string().max(50).optional(),
  tickersymbol: z.string().max(30).optional(),
  phone: z.string().max(30).optional(),
  otherphone: z.string().max(30).optional(),
  email1: z.string().max(100).email("Invalid email").optional().or(z.literal("")),
  email2: z.string().max(100).email("Invalid email").optional().or(z.literal("")),
  website: z.string().max(100).optional(),
  fax: z.string().max(30).optional(),
  employees: z.coerce.number().int().min(0).optional(),
  emailoptout: z.boolean(),
  notify_owner: z.boolean(),
  isconvertedfromlead: z.boolean(),
  bill_street: z.string().max(250).optional(),
  bill_city: z.string().max(30).optional(),
  bill_state: z.string().max(30).optional(),
  bill_code: z.string().max(30).optional(),
  bill_country: z.string().max(30).optional(),
  bill_pobox: z.string().max(30).optional(),
  ship_street: z.string().max(250).optional(),
  ship_city: z.string().max(30).optional(),
  ship_state: z.string().max(30).optional(),
  ship_code: z.string().max(30).optional(),
  ship_country: z.string().max(30).optional(),
  ship_pobox: z.string().max(30).optional(),
  description: z.string().optional(),
});

interface ClientFormProps {
  /**
   * Initial data for edit mode. If undefined, form is in create mode.
   */
  initialData?: Client;

  /**
   * Form mode: 'create' or 'edit'
   */
  mode?: 'create' | 'edit';

  /**
   * Callback when form is submitted successfully.
   * Receives validated form data.
   */
  onSubmit: (data: ClientFormData) => void | Promise<void>;

  /**
   * Callback when cancel button is clicked.
   */
  onCancel?: () => void;

  /**
   * Loading state for submit button.
   */
  isLoading?: boolean;
}

/**
 * ClientForm Component
 *
 * A reusable, presentational form component for creating and editing clients.
 * Handles all form fields, validation, and layout. Delegates submission
 * logic to the parent component via the onSubmit callback.
 *
 * Features:
 * - React Hook Form integration with Zod validation
 * - Supports both create and edit modes
 * - Boolean fields managed as booleans (converted to "0"/"1" by parent)
 * - "Copy billing to shipping" helper button
 * - Responsive grid layout for form fields
 * - Form is scrollable for better UX on smaller screens
 *
 * @component
 * @param props - Component configuration props
 * @param props.initialData - Initial data for edit mode (optional)
 * @param props.mode - Form mode: 'create' or 'edit' (default: 'create')
 * @param props.onSubmit - Callback when form is submitted successfully
 * @param props.onCancel - Callback when cancel button is clicked (optional)
 * @param props.isLoading - Loading state for submit button (default: false)
 * @returns The rendered client form
 *
 * @example
 * // Create mode
 * <ClientForm
 *   mode="create"
 *   onSubmit={handleCreateClient}
 *   onCancel={handleCancel}
 * />
 *
 * @example
 * // Edit mode
 * <ClientForm
 *   mode="edit"
 *   initialData={client}
 *   onSubmit={handleUpdateClient}
 *   onCancel={handleCancel}
 *   isLoading={isSubmitting}
 * />
 */
export const ClientForm = ({
  initialData,
  mode = 'create',
  onSubmit,
  onCancel,
  isLoading = false,
}: ClientFormProps) => {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          accountname: initialData.accountname,
          account_no: initialData.account_no || '',
          account_type: initialData.account_type || '',
          industry: initialData.industry || '',
          annualrevenue: initialData.annualrevenue || undefined,
          rating: initialData.rating || '',
          ownership: initialData.ownership || '',
          siccode: initialData.siccode || '',
          tickersymbol: initialData.tickersymbol || '',
          phone: initialData.phone || '',
          otherphone: initialData.otherphone || '',
          email1: initialData.email1 || '',
          email2: initialData.email2 || '',
          website: initialData.website || '',
          fax: initialData.fax || '',
          employees: initialData.employees || 0,
          emailoptout: initialData.emailoptout === '1',
          notify_owner: initialData.notify_owner === '1',
          isconvertedfromlead: initialData.isconvertedfromlead === '1',
          bill_street: initialData.bill_street || '',
          bill_city: initialData.bill_city || '',
          bill_state: initialData.bill_state || '',
          bill_code: initialData.bill_code || '',
          bill_country: initialData.bill_country || '',
          bill_pobox: initialData.bill_pobox || '',
          ship_street: initialData.ship_street || '',
          ship_city: initialData.ship_city || '',
          ship_state: initialData.ship_state || '',
          ship_code: initialData.ship_code || '',
          ship_country: initialData.ship_country || '',
          ship_pobox: initialData.ship_pobox || '',
          description: initialData.description || '',
        };
      }
      return {
        accountname: "",
        account_no: "",
        account_type: "",
        industry: "",
        rating: "",
        ownership: "",
        siccode: "",
        tickersymbol: "",
        phone: "",
        otherphone: "",
        email1: "",
        email2: "",
        website: "",
        fax: "",
        employees: 0,
        emailoptout: false,
        notify_owner: false,
        isconvertedfromlead: false,
        bill_street: "",
        bill_city: "",
        bill_state: "",
        bill_code: "",
        bill_country: "",
        bill_pobox: "",
        ship_street: "",
        ship_city: "",
        ship_state: "",
        ship_code: "",
        ship_country: "",
        ship_pobox: "",
        description: "",
      };
    }, [mode, initialData]),
  });

  /**
   * Handles form submission by calling the parent's onSubmit callback.
   *
   * @param data - Validated form data
   */
  const handleSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  /**
   * Copies billing address fields to shipping address fields.
   * Useful when the shipping address is the same as the billing address.
   */
  const copyBillingToShipping = () => {
    const billing = form.getValues([
      'bill_street', 'bill_city', 'bill_state', 'bill_code', 'bill_country', 'bill_pobox'
    ]);
    form.setValue('ship_street', billing[0]);
    form.setValue('ship_city', billing[1]);
    form.setValue('ship_state', billing[2]);
    form.setValue('ship_code', billing[3]);
    form.setValue('ship_country', billing[4]);
    form.setValue('ship_pobox', billing[5]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* General Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">General Information</h3>
          <Separator />
          <FormField
            control={form.control}
            name="accountname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RATINGS.map((rating) => (
                        <SelectItem key={rating} value={rating}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownership"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership</FormLabel>
                  <FormControl>
                    <Input placeholder="Ownership type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Financial Information</h3>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="annualrevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Revenue (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Employees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
              name="siccode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SIC code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tickersymbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="otherphone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Settings</h3>
          <Separator />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emailoptout"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Email Opt-out</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Client does not wish to receive emails
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notify_owner"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notify Owner</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to record owner
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isconvertedfromlead"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Converted from Lead</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Client was converted from a lead
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Billing Address</h3>
          <Separator />
          <FormField
            control={form.control}
            name="bill_street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bill_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bill_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bill_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bill_country"
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
          </div>
          <FormField
            control={form.control}
            name="bill_pobox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>P.O. Box</FormLabel>
                <FormControl>
                  <Input placeholder="PO123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Shipping Address</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyBillingToShipping}
            >
              Copy billing address
            </Button>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name="ship_street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="456 Secondary Ave" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ship_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ship_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ship_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="67890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ship_country"
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
          </div>
          <FormField
            control={form.control}
            name="ship_pobox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>P.O. Box</FormLabel>
                <FormControl>
                  <Input placeholder="PO456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Description</h3>
          <Separator />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this client..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : (mode === 'edit' ? 'Update Client' : 'Create Client')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;