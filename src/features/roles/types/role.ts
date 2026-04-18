export interface Role {
  value: string;   // roleid (e.g., 'H2')
  label: string;   // rolename (e.g., 'CEO')
  depth: number;   // hierarchy level (0 = root)
  parent_role?: string; // optional: full path like "H1::H2::"
}