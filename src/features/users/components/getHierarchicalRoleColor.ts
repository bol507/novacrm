/**
 * 
 * Adjust colors to match your design system and actual roles in vtiger_role.
 */
export const getHierarchicalRoleColor = (rolename: string | null | undefined): string => {
  if (!rolename) return 'bg-muted text-muted-foreground border-muted-foreground/20';
  
  const colorMap: Record<string, string> = {
    // Executives
    'Organization': 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    'CEO': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'Vice President': 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    
    // Operations
    'Jefe de Planta': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Vendedor': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    'Asistente de Ingenieria': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    
    //External
    'Socio': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    
    // Default fallback
    'default': 'bg-muted text-muted-foreground border-muted-foreground/20',
  };
  
  return colorMap[rolename] ?? colorMap['default'];
};