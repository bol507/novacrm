// src/features/settings/components/ProfilePermissionsForm.tsx

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ModulePermissionData, type ModulePermissionUpdate, type PermissionAction,  TABID_TO_MODULE_KEY } from '../types/settings';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { profileSchema, type ProfileFormValues } from '../validations/settings';


interface ProfilePermissionsFormProps {
  profile: {
    profileid: string;
    name: string;
    modules: ModulePermissionData[];
  } | null;
  availableModules?: Record<number, { name: string; tablabel: string }>;
  onSave: (data: { name: string; modules: ModulePermissionUpdate[] }) => void;
  isPending: boolean;
}


export const ProfilePermissionsForm = ({
  profile,
  availableModules = {},
  onSave,
  isPending
}: ProfilePermissionsFormProps) => {

  // ✅ Derivar módulos visibles: intersección entre frontend-soportado y backend-disponible
  const visibleModules = Object.entries(TABID_TO_MODULE_KEY)
    .map(([tabidStr, moduleKey]) => {
      const tabid = Number(tabidStr);
      const backendMeta = availableModules[tabid];

      // Si el backend no reporta este módulo, ocultarlo
      if (!backendMeta) return null;

      // Buscar permisos existentes del perfil
      const existing = profile?.modules?.find(m => m.tabid === tabid);

      return {
        tabid,
        moduleKey,
        name: backendMeta.tablabel || backendMeta.name || moduleKey,
        permissions: Array.isArray(existing?.permissions) ? existing.permissions : [],
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  // ✅ Inicializar formulario con estructura de array para RHF
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      // ✅ Array de módulos en orden, con permisos normalizados
      modules: visibleModules.map(mod => ({
        tabid: mod.tabid,
        permissions: mod.permissions,
      })),
    },
  });

  // ✅ useFieldArray para manejar array dinámico de módulos
  const { fields } = useFieldArray({
    control: form.control,
    name: 'modules',
  });

  const onSubmit = (values: ProfileFormValues) => {
    const modulesToUpdate = values.modules
      .filter(mod => mod.permissions.length > 0)
      .map(mod => ({
        tabid: mod.tabid,
        permissions: mod.permissions,
        
      }));

    onSave({
      name: values.name,
      modules: modulesToUpdate  
    });
  };

  return (
    <ErrorBoundary>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Nombre del Perfil */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name</FormLabel>
              <FormControl><Input {...field} disabled={isPending} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Permisos por Módulo */}
          <div className="space-y-4">
            <h3 className="font-medium">Module Permissions</h3>
            <div className="grid gap-3">

              {fields.map((field, index) => {
                const moduleConfig = visibleModules[index];
                if (!moduleConfig) return null;
                
                return (
                  <Card key={field.id}>
                    <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      {/* Nombre del módulo */}
                      <span className="font-medium w-32 truncate" title={moduleConfig.name}>
                        {moduleConfig.name}
                      </span>

                      {/* Checkboxes de permisos */}
                      <div className="flex gap-4">
                        {(['read', 'write', 'create', 'delete'] as PermissionAction[]).map(perm => (
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
                                <FormLabel className="text-xs capitalize select-none">{perm}</FormLabel>
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
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !form.formState.isValid}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Permissions
            </Button>
          </div>
        </form>
      </Form>
    </ErrorBoundary>
  );
};