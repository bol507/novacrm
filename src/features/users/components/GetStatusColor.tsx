/**
 * Returns status badge color classes based on user status.
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'Inactive':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    case 'Pending':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};