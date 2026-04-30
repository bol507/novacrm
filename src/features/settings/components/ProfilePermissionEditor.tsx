import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Shield } from 'lucide-react';
import { TABID_TO_MODULE_KEY, type PermissionAction } from '../types/settings';
import { profileSchema, type ProfileFormValues } from '../validations/settings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProfileOption {
    profileid: string;
    name: string;
}

interface ModulePermissionData {
    tabid: number;
    name: string;
    permissions: PermissionAction[];
}

interface ProfilePermissionEditorProps {
    profiles: ProfileOption[];
    availableModules: Record<number, { name: string; tablabel?: string }>;
    selectedProfileId?: string;
    onProfileSelect: (profileId: string) => void;
    onLoadPermissions: (profileId: string) => Promise<ModulePermissionData[]>;
    onSave: (profileId: string, data: { name: string; modules: { tabid: number; permissions: PermissionAction[] }[] }) => void;
    isPending: boolean;
}

const ALL_PERMISSIONS: PermissionAction[] = ['read', 'write', 'create', 'delete'];

/**
 * Component for editing profile permissions.
 *
 * Allows selecting a profile, viewing and editing its module permissions,
 * and saving changes back to the server.
 *
 * @component
 * @param props - Component props
 * @param props.profiles - List of available profiles
 * @param props.availableModules - Available modules from backend
 * @param props.selectedProfileId - Currently selected profile ID
 * @param props.onProfileSelect - Callback when profile selection changes
 * @param props.onLoadPermissions - Async function to load permissions for a profile
 * @param props.onSave - Callback to save permissions changes
 * @param props.isPending - Whether a save operation is in progress
 * @returns The rendered profile permission editor component
 */
export const ProfilePermissionEditor = ({
    profiles,
    availableModules,
    selectedProfileId,
    onProfileSelect,
    onLoadPermissions,
    onSave,
    isPending,
}: ProfilePermissionEditorProps) => {
    const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null);
    const [_modulePermissions, setModulePermissions] = useState<ModulePermissionData[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: '', modules: [] },
        mode: 'onChange',
    });

    const { fields } = useFieldArray({ control: form.control, name: 'modules' });

    const visibleModules = useMemo(() => {
        return Object.entries(TABID_TO_MODULE_KEY)
            .map(([tabidStr, moduleKey]) => {
                const tabid = Number(tabidStr);
                const meta = availableModules[tabid];
                if (!meta) return null;
                return { tabid, name: meta.tablabel || meta.name || moduleKey };
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);
    }, [availableModules]);

    useEffect(() => {
        const load = async () => {
            // ✅ 1. Limpieza si no hay perfil seleccionado
            if (!selectedProfileId) {
                form.reset({ name: '', modules: [] });
                setModulePermissions([]);
                return;
            }

            setIsLoadingPermissions(true);
            try {
                const perms = await onLoadPermissions(selectedProfileId);
                setModulePermissions(perms);

                // ✅ 2. Mapas para búsqueda O(1): por tabid Y por nombre normalizado
                const permsByTabid = new Map(perms.map(p => [p.tabid, p]));
                const permsByName = new Map(
                    perms.map(p => [p.name.toLowerCase().trim(), p])
                );

                // 🔍 Helper de matching flexible
                const findPermission = (tabid: number, moduleName: string) => {
                    // Prioridad 1: Match exacto por tabid
                    const byTabid = permsByTabid.get(tabid);
                    if (byTabid) return byTabid;

                    // Prioridad 2: Fallback por nombre (case-insensitive + sin espacios extra)
                    const normalizedName = moduleName.toLowerCase().trim();
                    return permsByName.get(normalizedName);
                };

                // ✅ 3. Inicializar formulario con matching inteligente
                const modulesToReset = visibleModules.map(mod => {
                    const existing = findPermission(mod.tabid, mod.name);

                    // 🐛 Debug: avisa si un módulo del frontend no encuentra match en el backend
                    if (!existing) {
                        console.warn(`⚠️ [Permisos] Sin match para "${mod.name}" (frontend tabid:${mod.tabid}). Backend retornó ${perms.length} módulos.`);
                    }

                    return {
                        tabid: mod.tabid,
                        permissions: Array.isArray(existing?.permissions) ? existing.permissions : [],
                    };
                });

                form.reset({
                    name: selectedProfile?.name ?? '',
                    modules: modulesToReset,
                });

                // 📊 Resumen en consola para verificación rápida
                const activeModules = modulesToReset.filter(m => m.permissions.length > 0).length;
                console.log(`✅ [Permisos] Perfil ${selectedProfileId}: ${activeModules}/${visibleModules.length} módulos con permisos asignados.`);

            } catch (error) {
                console.error('❌ Error cargando permisos del perfil:', error);
            } finally {
                setIsLoadingPermissions(false);
            }
        };
        load();
    }, [selectedProfileId, selectedProfile, visibleModules, onLoadPermissions, form]);

    const handleProfileChange = (profileId: string) => {
        const profile = profiles.find(p => p.profileid === profileId) ?? null;
        setSelectedProfile(profile);
        onProfileSelect(profileId);
    };

    const onSubmit = (values: ProfileFormValues) => {
        if (!selectedProfileId) return;

        const modulesToUpdate = values.modules
            .filter(mod => mod.permissions.length > 0)
            .map(({ tabid, permissions }) => ({ tabid, permissions }));

        onSave(selectedProfileId, { name: values.name, modules: modulesToUpdate });
    };

    const [profileSearch, setProfileSearch] = useState('');
    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(profileSearch.toLowerCase())
    );

    

    return (
        <ErrorBoundary>
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Profile Permissions
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <FormLabel>Select Profile to Edit</FormLabel>

                                {profiles.length > 10 && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search profiles..."
                                            value={profileSearch}
                                            onChange={(e) => setProfileSearch(e.target.value)}
                                            className="pl-9 mb-2"
                                        />
                                    </div>
                                )}

                                <Select value={selectedProfileId} onValueChange={handleProfileChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a profile..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {filteredProfiles.map(profile => (
                                            <SelectItem key={profile.profileid} value={profile.profileid}>
                                                {profile.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedProfileId && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{selectedProfile?.name}</p>
                                            <p className="text-xs text-muted-foreground">ID: {selectedProfileId}</p>
                                        </div>
                                        {isLoadingPermissions && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>

                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profile Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled={isPending || isLoadingPermissions} />
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    <div className="space-y-3">
                                        <FormLabel>Module Permissions</FormLabel>

                                        {isLoadingPermissions ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                {fields.map((field, index) => {
                                                    const module = visibleModules[index];
                                                    if (!module) return null;

                                                    return (
                                                        <Card key={field.id} className="border-muted">
                                                            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <span className="font-medium w-32 truncate" title={module.name}>
                                                                    {module.name}
                                                                </span>

                                                                <div className="flex gap-4">
                                                                    {ALL_PERMISSIONS.map(perm => (
                                                                        <FormField
                                                                            key={perm}
                                                                            control={form.control}
                                                                            name={`modules.${index}.permissions` as const}
                                                                            render={({ field: permField }) => (
                                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                                    <FormControl>
                                                                                        <Checkbox
                                                                                            checked={Array.isArray(permField.value) ? permField.value.includes(perm) : false}
                                                                                            onCheckedChange={(checked) => {
                                                                                                const current = Array.isArray(permField.value) ? permField.value : [];
                                                                                                const updated = checked
                                                                                                    ? [...current, perm]
                                                                                                    : current.filter((p: string) => p !== perm);
                                                                                                permField.onChange(updated);
                                                                                            }}
                                                                                            disabled={isPending}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormLabel className="text-xs capitalize select-none cursor-pointer">{perm}</FormLabel>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={isPending || isLoadingPermissions || !selectedProfileId}>
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!selectedProfileId && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Shield className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p>Select a profile from the dropdown to edit its permissions.</p>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </ErrorBoundary>
    );
};