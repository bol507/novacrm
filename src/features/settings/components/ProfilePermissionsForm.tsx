import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { VTIGER_MODULES } from '../constants/vtiger-modules';
import type { Profile, UpdateProfileRequest } from '../types/settings';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  modules: z.array(z.object({
    tabid: z.number(),
    permissions: z.array(z.string()),
  })),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfilePermissionsFormProps {
  profile: Profile;
  onSave: (data: UpdateProfileRequest) => void;
  isPending: boolean;
}

export const ProfilePermissionsForm = ({ profile, onSave, isPending }: ProfilePermissionsFormProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      modules: VTIGER_MODULES.map(mod => ({
        tabid: mod.tabid,
        permissions: profile.modules.find(m => m.tabid === mod.tabid)?.permissions ?? [],
      })),
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    onSave({ name: values.name, modules: values.modules });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-4">
          <h3 className="font-medium">Module Permissions</h3>
          <div className="grid gap-3">
            {VTIGER_MODULES.map(mod => (
              <Card key={mod.tabid}>
                <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-medium w-32">{mod.name}</span>
                  <div className="flex gap-4">
                    {['read', 'write', 'create', 'delete'].map(perm => (
                      <FormField key={perm} control={form.control} name={`modules.${mod.tabid}.permissions`} render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(perm)}
                              onCheckedChange={(checked) => {
                                const updated = checked 
                                  ? [...field.value, perm] 
                                  : field.value.filter((p: string) => p !== perm);
                                field.onChange(updated);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-xs capitalize">{perm}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Permissions
          </Button>
        </div>
      </form>
    </Form>
  );
};