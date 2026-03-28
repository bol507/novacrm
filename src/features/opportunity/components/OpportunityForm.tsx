import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, DollarSign, User, Building2, Search } from "lucide-react";
import { OPPORTUNITY_STAGES } from "../types/opportunity";
import { useSearchClients } from "@/features/clients/hooks/use-search-clients";
import { useSearchUsers } from "@/features/users/hooks/use-search-users";

/**
 * Zod schema for opportunity form validation
 * 
 * Defines validation rules for all form fields:
 * - potentialname: required, max 255 characters
 * - sales_stage: must be one of OPPORTUNITY_STAGES enum values
 * - amount: optional number, minimum 0
 * - closingdate: optional date string
 * - probability: optional number between 0-100
 * - related_to_search/assigned_user_search: optional search input strings
 * - description: optional text
 */
export const opportunityFormSchema = z.object({
  potentialname: z.string().min(1, "Name is required").max(255),
  sales_stage: z.enum(OPPORTUNITY_STAGES),
  amount: z.number().min(0).optional(),
  closingdate: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  related_to_search: z.string().optional(),
  assigned_user_search: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Valid opportunity form values inferred from Zod schema
 */
export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;

/**
 * Payload type for opportunity submission (includes IDs not in form)
 */
export type OpportunityPayload = OpportunityFormValues & {
  related_to: number | null;
  assigned_user_id: number | null;
};

/**
 * Props for OpportunityForm component
 */
export interface OpportunityFormProps {
  /** Form mode: 'create' for new opportunity, 'edit' for existing */
  mode?: 'create' | 'edit';
  /** Initial opportunity data for edit mode */
  initialData?: any;
  /** Callback fired when form is submitted with validated data */
  onSubmit: (values: OpportunityPayload) => void;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Loading state for submit button */
  isLoading?: boolean;
}

/**
 * OpportunityForm Component
 * 
 * A reusable, presentational form component for creating and editing sales opportunities.
 * Supports client and user search with autocomplete, stage selection, amount/probability inputs,
 * and rich text description. Uses react-hook-form for form state management and zod for validation.
 * 
 * @component
 * @param {OpportunityFormProps} props - Component props
 * @param {'create' | 'edit'} [props.mode='create'] - Form mode determines title and initial data
 * @param {any} [props.initialData] - Initial opportunity data for edit mode
 * @param {function} props.onSubmit - Submit callback with validated form data (includes IDs)
 * @param {function} [props.onCancel] - Cancel callback for navigation
 * @param {boolean} [props.isLoading] - Loading state for submit button
 * 
 * @returns {JSX.Element} Opportunity form with search, validation, and submission
 * 
 * @example
 * // Create mode
 * <OpportunityForm 
 *   mode="create" 
 *   onSubmit={handleCreateOpportunity} 
 *   onCancel={handleCancel}
 *   isLoading={isPending}
 * />
 * 
 * @example
 * // Edit mode with existing opportunity data
 * <OpportunityForm 
 *   mode="edit" 
 *   initialData={opportunity} 
 *   onSubmit={handleUpdateOpportunity} 
 *   onCancel={handleCancel}
 * />
 * 
 * @remarks
 * - Form validates required fields: potentialname and sales_stage
 * - Client and user search components support autocomplete with debounced API calls
 * - Search selections store IDs separately from display values to avoid form validation conflicts
 * - Amount and probability fields convert string input to numbers with undefined fallback
 * - Edit mode pre-fills form with initialData and search display values
 * - Calls onSubmit with merged payload (form values + selected IDs)
 * - Error messages display below each field via FormMessage component
 * 
 * @see {@link opportunityFormSchema} for validation rules
 * @see {@link useSearchClients} for client autocomplete hook
 * @see {@link useSearchUsers} for user autocomplete hook
 * @see {@link OPPORTUNITY_STAGES} for valid stage values
 */
const OpportunityForm = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: OpportunityFormProps) => {
  /**
   * Search term for client autocomplete input
   */
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  /**
   * Search term for user autocomplete input
   */
  const [userSearchTerm, setUserSearchTerm] = useState("");

  /**
   * Selected client ID from search results
   * Initialized from initialData in edit mode
   */
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    mode === 'edit' && initialData?.related_to ? initialData.related_to : null
  );

  /**
   * Selected user ID from search results
   * Initialized from initialData in edit mode
   */
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    mode === 'edit' && initialData?.assigned_user_id ? initialData.assigned_user_id : null
  );

  /**
   * Validation flag for client selection
   * True when a valid client is selected (edit mode or after selection)
   */
  const [isClientValid, setIsClientValid] = useState(
    mode === 'edit' && initialData?.related_to !== null
  );

  /**
   * Validation flag for user selection
   * True when a valid user is selected (edit mode or after selection)
   */
  const [isUserValid, setIsUserValid] = useState(
    mode === 'edit' && initialData?.assigned_user_id !== null
  );

  /**
   * Client search results from API hook
   * 
   * @remarks
   * - Returns array of client objects matching search term
   * - isLoading indicates API request in progress
   * - data is aliased to clientResults for semantic clarity
   */
  const { data: clientResults, isLoading: clientsLoading } = useSearchClients(clientSearchTerm);

  /**
   * User search results from API hook
   * 
   * @remarks
   * - Returns array of user objects matching search term
   * - isLoading indicates API request in progress
   * - data is aliased to userResults for semantic clarity
   */
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(userSearchTerm);

  /**
   * React Hook Form instance with zod validation
   * 
   * defaultValues are memoized to avoid unnecessary re-renders
   * Edit mode pre-fills form fields and search display values from initialData
   */
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: useMemo(() => {
      if (mode === 'edit' && initialData) {
        return {
          potentialname: initialData.potentialname,
          sales_stage: initialData.sales_stage,
          amount: initialData.amount || undefined,
          closingdate: initialData.closingdate || undefined,
          probability: initialData.probability || undefined,
          // Search display values for autocomplete fields
          related_to_search: initialData.related_to_name || '',
          assigned_user_search: initialData.assigned_user_name || '',
          description: initialData.description || '',
        };
      }
      // Default values for create mode
      return {
        potentialname: "",
        sales_stage: "Prospecting",
        amount: undefined,
        closingdate: undefined,
        probability: undefined,
        related_to_search: '',
        assigned_user_search: '',
        description: "",
      };
    }, [mode, initialData]),
  });

  /**
   * Handles form submission with validation and payload transformation
   * 
   * @param data - Validated form values from react-hook-form
   * 
   * @remarks
   * - Merges form values with selected client/user IDs for API submission
   * - Logs payload for debugging purposes
   * - Calls parent onSubmit callback with complete payload
   */
  const handleSubmit = (data: OpportunityFormValues) => {
    // Merge form values with selected IDs (not in form schema)
    const payload: OpportunityPayload = {
      ...data,
      related_to: selectedClientId,
      assigned_user_id: selectedUserId,
    };



    // Call parent submit handler
    onSubmit(payload);
  };

  /**
   * Handles client selection from search results
   * 
   * @param client - Selected client object from API results
   * 
   * @remarks
   * - Sets display value in form field for user feedback
   * - Stores client ID separately for API submission
   * - Marks client as valid to hide validation error
   * - Clears search term to close dropdown
   */
  const handleSelectClient = (client: any) => {
    form.setValue('related_to_search', client.accountname);
    setSelectedClientId(client.id);
    setIsClientValid(true);
    setClientSearchTerm('');
  };

  /**
   * Handles user selection from search results
   * 
   * @param user - Selected user object from API results
   * 
   * @remarks
   * - Handles different user object structures (id vs user_id)
   * - Formats display name from first/last name or falls back to username
   * - Sets display value in form field for user feedback
   * - Stores user ID separately for API submission
   */
  const handleSelectUser = (user: any) => {
    // Handle different ID field names in user objects
    const userId = user.id || user.user_id;

    // Format display name: "First Last" or fallback to username
    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name;

    form.setValue('assigned_user_search', displayName);
    setSelectedUserId(userId);
    setIsUserValid(true);
    setUserSearchTerm('');
  };

  /**
   * Handles client search input changes
   * 
   * @param e - Input change event
   * 
   * @remarks
   * - Updates form field and local search state for autocomplete
   * - Clears validation and selected ID when input is empty
   * - Allows user to modify search after initial selection
   */
  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('related_to_search', value);
    setClientSearchTerm(value);

    // Reset validation when user clears or modifies input
    if (value === '') {
      setIsClientValid(false);
      setSelectedClientId(null);
    }
  };

  /**
   * Handles user search input changes
   * 
   * @param e - Input change event
   * 
   * @remarks
   * - Updates form field and local search state for autocomplete
   * - Clears validation and selected ID when input is empty
   * - Allows user to modify search after initial selection
   */
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('assigned_user_search', value);
    setUserSearchTerm(value);

    // Reset validation when user clears or modifies input
    if (value === '') {
      setIsUserValid(false);
      setSelectedUserId(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* Opportunity Name Field */}
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

        {/* Sales Stage and Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sales Stage Dropdown */}
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
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estimated Amount Input */}
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
                    // Convert string input to number, undefined if empty
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Closing Date and Probability Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Closing Date Input */}
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

          {/* Probability Percentage Input */}
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
                    // Convert string input to integer, undefined if empty
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Related Client Search Field */}
        <FormField
          control={form.control}
          name="related_to_search"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Related client *
                </div>
              </FormLabel>
              <div className="relative">
                {/* Search icon positioned inside input */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Search client by name..."
                    className={`pl-10 transition-all ${isClientValid
                      ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]'
                      : ''
                      }`}
                    {...field}
                    onChange={handleClientInputChange}
                  />
                </FormControl>
              </div>

              {/* Search Results Dropdown */}
              {(clientResults?.length > 0 || clientsLoading) && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border z-10">
                  {clientsLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    clientResults?.map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                        onClick={() => handleSelectClient(client)}
                      >
                        <span>{client.accountname}</span>
                        <span className="text-xs text-muted-foreground">ID: {client.id}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Validation Error Message */}
              {!isClientValid && (
                <p className="text-sm text-destructive mt-1">
                  Please select a client from the list
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assigned User Search Field */}
        <FormField
          control={form.control}
          name="assigned_user_search"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned to *
                </div>
              </FormLabel>
              <div className="relative">
                {/* Search icon positioned inside input */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Search user by name..."
                    className={`pl-10 transition-all ${isUserValid
                      ? 'border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]'
                      : ''
                      }`}
                    {...field}
                    onChange={handleUserInputChange}
                  />
                </FormControl>
              </div>

              {/* Search Results Dropdown */}
              {(userResults?.length > 0 || usersLoading) && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-popover rounded-md border border-border z-10">
                  {usersLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    userResults?.map((user: any) => (
                      <button
                        key={user.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                        onClick={() => handleSelectUser(user)}
                      >
                        <span>{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground">@{user.user_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Validation Error Message */}
              {!isUserValid && (
                <p className="text-sm text-destructive mt-1">
                  Please select a user from the list
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
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

        {/* Form Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (mode === 'edit' ? 'Update Opportunity' : 'Create Opportunity')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OpportunityForm;
