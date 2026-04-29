import { Shield } from 'lucide-react';

export const EmptyState = () => (
  <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border">
    <Shield className="mx-auto h-12 w-12 mb-4 opacity-20" />
    <h3 className="text-lg font-semibold">No roles found</h3>
    <p className="text-sm mt-2">Create a role to start building the hierarchy.</p>
  </div>
);