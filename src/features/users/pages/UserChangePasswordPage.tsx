import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "../hooks/use-user";
import { useChangePassword } from "../hooks/use-change-password";
import { ArrowLeftIcon, KeyIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/ErrorBoundary";



const changePasswordSchema = z.object({
    current_password: z.string().optional().or(z.literal("")),
    new_password: z.string()
        .min(6, "Min 6 characters")
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[0-9]/, "Must contain number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const UserChangePasswordPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const numericUserId = userId ? parseInt(userId) : null;

    const { data: user, isLoading: isLoadingUser } = useUser(numericUserId);
    const { mutateAsync: changePassword, isPending: isChanging } = useChangePassword();

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (values: ChangePasswordFormValues) => {
        if (!numericUserId) return;

        try {
            await changePassword({
                userId: numericUserId,
                data: {
                    new_password: values.new_password,
                    confirm_password: values.confirm_password,
                    current_password: values.current_password === "" ? undefined : values.current_password,
                }
            });

            navigate(`/dashboard/settings/users/${numericUserId}`);
        } catch (err) {
            // El error ya se maneja en el hook via onError
        }
    };

    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">User not found</p>
                <Button onClick={() => navigate("/dashboard/settings/users")}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </div>
        );
    }

    const onInvalid = (errors: any) => {
        console.warn('❌ Validación fallida:', errors);
    };

    const isSelf = user.id === (window as any).__AUTH_USER_ID; // O usar useAuth() para obtener el ID del usuario actual

    return (
        <ErrorBoundary>
            <div className="space-y-6 max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Change Password</h1>
                        <p className="text-muted-foreground">
                            Update password for @{user.user_name} • {user.first_name} {user.last_name}
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyIcon className="h-5 w-5 text-primary" />
                            Set New Password
                        </CardTitle>
                        <CardDescription>
                            {isSelf
                                ? "Enter your current password to verify your identity, then set a new secure password."
                                : "Set a new password for this user. They will need to use this to log in."}
                        </CardDescription>
                    </CardHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                            <CardContent className="space-y-4">

                                {/* Current Password (solo si es el propio usuario) */}
                                {isSelf && (
                                    <>
                                        <FormField control={form.control} name="current_password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormDescription>Verify your identity before changing your password</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Separator />
                                    </>
                                )}

                                {/* New Password */}
                                <FormField control={form.control} name="new_password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Min 6 chars, 1 uppercase, 1 number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Password must be at least 6 characters, include one uppercase letter and one number
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Confirm Password */}
                                <FormField control={form.control} name="confirm_password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Re-enter new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Security Notice */}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <ShieldAlertIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium">Security Notice</p>
                                        <p>After changing the password, the user will need to log in again with the new credentials. All active sessions may be invalidated.</p>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Actions */}
                            <CardFooter className="flex justify-end gap-3 border-t pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isChanging}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isChanging}>
                                    {isChanging ? (
                                        <>
                                            <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <KeyIcon className="h-4 w-4 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </ErrorBoundary>
    );
};

export default UserChangePasswordPage;