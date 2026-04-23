import { useProfiles, useUpdateProfile } from '../hooks/use-profiles';
import { ProfilePermissionsForm } from '../components/ProfilePermissionsForm';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProfilesPage = () => {
  const { data: profiles, isLoading } = useProfiles();
  const { mutate, isPending } = useUpdateProfile();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permission Profiles</h1>
        <p className="text-muted-foreground">Configure module access and CRUD permissions</p>
      </div>

      <Tabs defaultValue={profiles?.[0]?.profileid} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {profiles?.map(p => (
            <TabsTrigger key={p.profileid} value={p.profileid} className="whitespace-nowrap">
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {profiles?.map(p => (
          <TabsContent key={p.profileid} value={p.profileid} className="mt-6">
            <ProfilePermissionsForm 
              profile={p} 
              onSave={(data) => mutate({ id: p.profileid, ...data })} 
              isPending={isPending} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};