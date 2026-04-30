import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, UserIcon, Mail, Phone, Building2, Shield, Calendar, Save, X } from "lucide-react";
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
import { USER_STATUSES, type UpdateUserRequest } from "../types/user";
import { useUser } from "../hooks/use-user";
import { useUpdateUser } from "../hooks/use-update-user";
import { toOptional } from "@/shared/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleSelect } from "@/features/roles/components/RoleSelect";

const userEditSchema = z.object({
    user_name: z.string().min(3, "Min 3 characters").max(50).optional(),
    first_name: z.string().min(1, "Required").max(30).trim().optional(),
    last_name: z.string().min(1, "Required").max(30).trim().optional(),
    email: z.string().email("Invalid email format").max(100).optional(),

    // ✅ Nuevos campos separados
    is_admin: z.boolean().default(false).optional(),
    role_id: z.string().min(1, "Please select a role").optional(),

    status: z.enum(USER_STATUSES).optional(),
    department: z.string().max(50).optional().or(z.literal("")),
    phone_crm: z.string().max(100).optional().or(z.literal("")),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

/**
 * UserEditPage - Enhanced form with clean design and RoleSelect integration
 */
export const UserEditPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const numericUserId = userId ? parseInt(userId) : null;

    const { data: user, isLoading: isLoadingUser, error: userError } = useUser(numericUserId);
    const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

    const form = useForm<UserEditFormValues>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            user_name: "",
            first_name: "",
            last_name: "",
            email: "",
            is_admin: false,
            role_id: "",
            status: "Active",
            department: "",
            phone_crm: "",
        },
        mode: "onBlur", // ✅ Validar al perder foco para mejor UX
    });

    // ✅ Cargar datos del usuario en el formulario
    useEffect(() => {
        if (user) {
            form.reset({
                user_name: user.user_name,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_admin: user.is_admin ?? false,
                role_id: user.role_id?.toString().trim() ?? "",
                status: user.status,
                department: user.department ?? "",
                phone_crm: user.phone_crm ?? "",
            });
            console.log('[UserEditPage] After reset - role_id value:', {
                raw: user.role_id,
                normalized: user.role_id?.toString().trim(),
                formValue: form.getValues('role_id')
            });
        }
    }, [user, form]);

    
    useEffect(() => {
        if (userError) {
            toast.error("Error loading user data");
            navigate("/dashboard/settings/users");
        }
    }, [userError, navigate]);

    
    const onSubmit = async (values: UserEditFormValues) => {
        if (!numericUserId) return;

        try {
            const payload: Omit<UpdateUserRequest, 'password'> = {
                ...values,
                department: toOptional(values.department?.trim()),
                phone_crm: toOptional(values.phone_crm?.trim()),
            };

            await updateUser({ id: numericUserId, ...payload });

            toast.success("User updated successfully", {
                description: `${values.first_name} ${values.last_name} has been updated`,
            });

            navigate(`/dashboard/settings/users/${numericUserId}`);

        } catch (err: any) {
            const emailError = err?.response?.data?.messages?.email?.[0];
            if (emailError) {
                form.setError("email", { message: emailError });
                toast.error("Validation error", { description: emailError });
            } else {
                toast.error("Error updating user", {
                    description: err?.response?.data?.error || "Please try again"
                });
            }
        }
    };

    // ✅ Loading state
    if (isLoadingUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading user data...</p>
            </div>
        );
    }

    // ✅ User not found
    if (!user) {
        return (
            <Card className="max-w-md mx-auto mt-12">
                <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">User not found</h3>
                    <p className="text-muted-foreground mb-4">The requested user does not exist or has been deleted.</p>
                    <Button onClick={() => navigate("/dashboard/settings/users")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Users
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">

            {/* 🔝 Header con navegación y contexto */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Edit User</h1>
                            {user.is_admin && (
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            Updating @{user.user_name} • {user.first_name} {user.last_name}
                        </p>
                    </div>
                </div>

                {/* Badges de referencia */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={user.rolename ? "" : "bg-muted"}>
                        {user.rolename || user.role_id || "Usuario"}
                    </Badge>
                    <Badge variant="outline" className={user.status === "Active" ? "bg-green-500/10 text-green-700" : ""}>
                        {user.status}
                    </Badge>
                </div>
            </div>

            {/* 📋 Formulario principal */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* 👤 Section: Personal Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Basic identity details for the user</CardDescription>
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
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                                <Input placeholder="johndoe" {...field} className="pl-7 bg-background" />
                                            </div>
                                        </FormControl>
                                        <FormDescription>Used for login and mentions</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
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

                    {/* 🔐 Section: Access & Permissions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-primary" />
                                Access & Permissions
                            </CardTitle>
                            <CardDescription>Control system access and role hierarchy</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* ✅ System Admin Checkbox */}
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

                            {/* ✅ RoleSelect + Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="role_id"
                                    render={({ field }) => {
                                        // ✅ Normalizar valor para garantizar string definido
                                        const normalizedValue = field.value?.toString().trim() ?? "";

                                        return (
                                            <FormItem>
                                                <FormLabel>Department Role *</FormLabel>

                                                {/* ✅ RoleSelect ya incluye el Select internamente */}
                                                <RoleSelect
                                                    value={normalizedValue}  // ✅ String definido
                                                    onChange={(value) => field.onChange(value)}
                                                    placeholder="Select hierarchical role..."
                                                    minDepth={1}  // ✅ H3 (depth=2) aparecerá
                                                    disabled={form.formState.isSubmitting || isLoadingUser}
                                                    // ✅ Debug: verificar que H3 está en la lista cargada
                                                    onRolesLoaded={(loadedRoles) => {
                                                        const hasH3 = loadedRoles.some(r => r.value === 'H3');
                                                        console.log('[RoleSelect] Roles loaded:', loadedRoles.length, 'Has H3:', hasH3, 'Current value:', normalizedValue);
                                                    }}
                                                />

                                                <FormDescription>
                                                    Determines record sharing and reporting hierarchy in Vtiger
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Status</FormLabel>
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
                            <CardDescription>Professional contact information</CardDescription>
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
                                        <FormDescription>For CRM and notifications</FormDescription>
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
                            onClick={() => navigate(-1)}
                            disabled={isUpdating}
                            className="w-full sm:w-auto"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating || !form.formState.isDirty}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>

                </form>
            </Form>
        </div>
    );
};

export default UserEditPage;