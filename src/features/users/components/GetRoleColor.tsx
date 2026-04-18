/**
 * Returns role badge color classes based on user role.
 *
 * @param role - The user role string
 * @returns Tailwind CSS classes for the role badge
 */
export const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'Usuario':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Cliente':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};