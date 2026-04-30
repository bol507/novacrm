import { TABID_TO_MODULE_KEY, type ModuleKey, type PermissionAction } from "@/features/settings/types/settings";

export const MODULE_KEY_TO_TABID: Record<ModuleKey, number> = Object.fromEntries(
  Object.entries(TABID_TO_MODULE_KEY).map(([k, v]) => [v, Number(k)])
) as Record<ModuleKey, number>;

/**
 * Converts backend permissions (keyed by tabid) to frontend structure.
 *
 * @param backendPerms - Permissions object from backend keyed by tabid
 * @param availableModules - Available modules data from backend
 * @returns Partial record mapping module keys to their allowed permission actions
 */
export function mapBackendPermissions(
  backendPerms: Record<number, { read: boolean; write: boolean; create: boolean; delete: boolean }>,
  _availableModules: Record<number, { name: string; tablabel: string }>
): Partial<Record<ModuleKey, PermissionAction[]>> {
  const result: Partial<Record<ModuleKey, PermissionAction[]>> = {};

  for (const [tabidStr, moduleKey] of Object.entries(TABID_TO_MODULE_KEY)) {
    const tabid = Number(tabidStr);
    const perms = backendPerms[tabid];
    
    if (!perms) continue;

    const actions: PermissionAction[] = [];
    if (perms.read) actions.push('read');
    if (perms.write) actions.push('write');
    if (perms.create) actions.push('create');
    if (perms.delete) actions.push('delete');

    result[moduleKey] = actions;
  }

  return result;
}

/**
 * Runtime type guard to validate if a string is a valid ModuleKey.
 *
 * @param value - The string to validate
 * @returns True if the value is a valid ModuleKey
 */
export function isValidModuleKey(value: string): value is ModuleKey {
  return Object.values(TABID_TO_MODULE_KEY).includes(value as ModuleKey);
}

/**
 * Retrieves module metadata by combining the module mapping with available modules data.
 *
 * @param moduleKey - The module key to look up
 * @param availableModules - Available modules data from backend keyed by tabid
 * @returns Module metadata or null if not found
 */
export function getModuleMetadata(
  moduleKey: ModuleKey, 
  availableModules: Record<number, { name: string; tablabel: string }>
) {
  const tabid = MODULE_KEY_TO_TABID[moduleKey];
  return availableModules[tabid] ?? null;
}