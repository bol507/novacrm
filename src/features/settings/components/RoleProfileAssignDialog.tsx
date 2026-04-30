import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfiles, useUpdateRoleProfile } from '../hooks/use-profiles';
import { Loader2, Link2 } from 'lucide-react';
import type { Role } from '../types/settings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RoleProfileAssignDialogProps {
  role: Role;
  currentProfileId?: string;
}

export const RoleProfileAssignDialog = ({ role, currentProfileId }: RoleProfileAssignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentProfileId || '');
  const { data: profiles } = useProfiles();
  const { mutate: assign, isPending } = useUpdateRoleProfile();

  const handleSave = () => {
    if (!selected) return;
    assign({ roleId: role.roleid, profileId: selected }, { onSuccess: () => setOpen(false) });
  };

  return (
    <ErrorBoundary>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Link2 className="h-3.5 w-3.5" /> Assign Profile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Profile to {role.rolename}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue placeholder="Select a profile" /></SelectTrigger>
              <SelectContent>
                {profiles?.map(p => (
                  <SelectItem key={p.profileid} value={p.profileid}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!selected || isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};