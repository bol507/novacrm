import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, UserIcon, Mail, Phone, Building2, Shield, Calendar, Key, Save, X, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleSelect } from "@/features/roles/components/RoleSelect";
import { USER_STATUSES, type CreateUserRequest } from "../types/user";
import { toOptional } from "@/shared/lib/utils";
import { useCreateUser } from "../hooks/use-create-user";


const userCreateSchema = z.object({
  // Required fields for creation
  user_name: z.string().min(3, "Min 3 characters").max(50),
  first_name: z.string().min(1, "Required").max(30).trim(),
  last_name: z.string().min(1, "Required").max(30).trim(),
  email: z.string().email("Invalid email format").max(100),

  // Password (required only for creation)
  password: z.string()
    .min(6, "Min 6 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirm_password: z.string().min(1, "Please confirm password"),


  is_admin: z.boolean().default(false),
  role_id: z.string().min(1, "Please select a role"),

  // Optional fields
  status: z.enum(USER_STATUSES).default("Active"),
  department: z.string().max(50).optional().or(z.literal("")),
  phone_crm: z.string().max(100).optional().or(z.literal("")),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type UserCreateFormValues = z.infer<typeof userCreateSchema>;

/**
 * UserCreatePage - New user creation form with enhanced UX
 */
export const UserCreatePage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();

  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      user_name: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      is_admin: false,
      role_id: "",
      status: "Active",
      department: "",
      phone_crm: "",
    },
    mode: "onBlur",
  });

  // ✅ Capture validation errors for better UX
  const onInvalid = (errors: any) => {
    console.warn('❌ Form validation failed:', errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error("Validation error", { description: firstError.message });
    }
  };

  const onSubmit = async (values: UserCreateFormValues) => {
    try {
      const payload: CreateUserRequest = {
        user_name: values.user_name,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,


        is_admin: values.is_admin,
        role_id: values.role_id,

        status: values.status,
        department: toOptional(values.department?.trim()),
        phone_crm: toOptional(values.phone_crm?.trim()),
      };

      const userId = await createUser(payload);

      toast.success("User created successfully", {
        description: `${values.first_name} ${values.last_name} can now log in`,
      });

      if (userId && typeof userId === 'number') {
        navigate(`/dashboard/settings/users/${userId}`);
      } else {
        console.error('[UserCreate] Invalid user_id returned:', userId);
        toast.error("User created but redirect failed", {
          description: "Please navigate to users list manually"
        });
        navigate("/dashboard/settings/users");
      }

    } catch (err: any) {
      const messages = err?.response?.data?.messages;

      
      if (messages?.user_name?.[0]) {
        form.setError("user_name", { message: messages.user_name[0] });
        toast.error("Username unavailable", { description: messages.user_name[0] });
      } else if (messages?.email?.[0]) {
        form.setError("email", { message: messages.email[0] });
        toast.error("Email already in use", { description: messages.email[0] });
      } else {
        toast.error("Error creating user", {
          description: err?.response?.data?.error || "Please check the form and try again"
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* 🔝 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New User</h1>
            <p className="text-muted-foreground">Add a new user to the system with appropriate permissions</p>
          </div>
        </div>

        {/* Status hint */}
        <Badge variant="outline" className="bg-green-500/10 text-green-700 w-fit">
          <Calendar className="h-3 w-3 mr-1" />
          Status: Active (default)
        </Badge>
      </div>

      {/* 📋 Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

          {/* 👤 Section: Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserIcon className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic identity details for the new user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Doe" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="user_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                        <Input placeholder="johndoe" {...field} className="pl-7 bg-background" />
                      </div>
                    </FormControl>
                    <FormDescription>Used for login and system mentions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="john@example.com" {...field} className="pl-9 bg-background" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* 🔐 Section: Credentials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-primary" />
                Login Credentials
              </CardTitle>
              <CardDescription>Set secure credentials for the new user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Password */}
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 chars, 1 uppercase, 1 number"
                        {...field}
                        className="pr-10 bg-background"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Password must include at least one uppercase letter and one number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Confirm Password */}
              <FormField control={form.control} name="confirm_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        {...field}
                        className="pr-10 bg-background"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showConfirmPassword ? "Hide" : "Show"} password</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* 🔐 Section: Access & Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Access & Permissions
              </CardTitle>
              <CardDescription>Define system access level and role hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* System Admin Checkbox */}
              <FormField control={form.control} name="is_admin" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-base">System Administrator</FormLabel>
                      {field.value && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <FormDescription className="text-sm">
                      Grants full access to settings, user management, and all modules.
                      <span className="text-amber-600 font-medium"> Use with caution.</span>
                    </FormDescription>
                  </div>
                </FormItem>
              )} />

              <Separator />

              {/* RoleSelect + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="role_id" render={({ field }) => {
                  const normalizedValue = field.value?.toString().trim() ?? "";

                  return (
                    <FormItem>
                      <FormLabel>Department Role <span className="text-destructive">*</span></FormLabel>


                      <RoleSelect
                        value={normalizedValue}
                        onChange={(value) => field.onChange(value)}
                        placeholder="Select hierarchical role..."
                        minDepth={1}
                        disabled={isCreating}

                        onRolesLoaded={(loadedRoles) => {
                          console.log('[UserCreate] Roles loaded:', loadedRoles.length);
                          console.log('[UserCreate] Current value:', normalizedValue);
                        }}
                      />

                      <FormDescription>
                        Determines record sharing and reporting hierarchy in Vtiger
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Users start as Active by default</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* 📞 Section: Contact Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Contact Details
              </CardTitle>
              <CardDescription>Optional professional contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Engineering" {...field} className="pl-9 bg-background" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone_crm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+1 (555) 000-0000" {...field} className="pl-9 bg-background" />
                      </div>
                    </FormControl>
                    <FormDescription>For CRM notifications and contact</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* 🔘 Actions Footer */}
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/settings/users")}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </CardFooter>

        </form>
      </Form>
    </div>
  );
};

export default UserCreatePage;