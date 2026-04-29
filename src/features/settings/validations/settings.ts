import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Maximum 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_ñÑ]+$/, 'Only letters, numbers, spaces, hyphens and underscores allowed'),
  parent_id: z.string().nullable().optional(),
  sharing_rule: z.number().int().min(0).max(3).optional(),
});

export const profileSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Maximum 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_ñÑ]+$/, 'Only letters, numbers, spaces, hyphens and underscores allowed'),
  modules: z.array(z.object({
    tabid: z.number().int().min(1),
    permissions: z.array(z.enum(['read', 'write', 'create', 'delete'])),
  })).refine(
    (modules) => modules.some(m => m.permissions.length > 0),
    { message: 'At least one module must have permissions assigned', path: ['modules'] }
  ),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;