import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role } from '../types/settings';

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles?: Role[];
  isPending: boolean;
  onSubmit: (data: { name: string; role_id?: string }) => void;
}

export const CreateProfileDialog = ({ 
  open, 
  onOpenChange, 
  roles, 
  isPending, 
  onSubmit 
}: CreateProfileDialogProps) => {
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!open) {
      setName('');
      setRoleId('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), role_id: roleId || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Profile name (e.g., Senior Sales)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            autoFocus
          />
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Assign to role (optional)" />
            </SelectTrigger>
            <SelectContent>
              
              {roles?.map((r) => (
                <SelectItem key={r.roleid} value={r.roleid}>
                  {r.rolename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? 'Creating...' : 'Create Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};