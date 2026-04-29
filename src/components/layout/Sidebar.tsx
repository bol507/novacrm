import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  Building2,
  ChevronLeft,
  ChevronDown,
  Target,
  Folder,
  CheckSquare,
  User,
  ShoppingCart,
  Store,
  UserCogIcon,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { usePermissions } from "@/features/settings/hooks/use-permissions";
import type { ModuleKey } from "@/features/settings/types/settings";

const MENU_PERMISSION_MAP: Record<string, ModuleKey | null> = {
  "/dashboard/clients": "accounts",
  "/dashboard/contacts": "contacts",
  "/dashboard/opportunities": "potentials",
  "/dashboard/quotes": "quotes",
  "/dashboard/projects": "projects",
  "/dashboard/tasks": "calendar",
  "/dashboard/purchases": "PurchaseOrder",
  "/dashboard/vendors": "vendors",
  "/dashboard/settings/users": null,
  "/dashboard/settings/roles": null,
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const baseMenuItems: MenuGroup[] = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ],
  },
  {
    title: "Sales",
    items: [
      { name: "Clients", icon: Users, path: "/dashboard/clients" },
      { name: "Contacts", icon: User, path: "/dashboard/contacts" },
      { name: "Opportunities", icon: Target, path: "/dashboard/opportunities" },
      { name: "Quotes", icon: FileText, path: "/dashboard/quotes" },
    ],
  },
  {
    title: "Projects",
    items: [
      { name: "Projects", icon: Folder, path: "/dashboard/projects" },
      { name: "Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
    ],
  },
  {
    title: "Purchases",
    items: [
      { name: "Purchase Orders", icon: ShoppingCart, path: "/dashboard/purchases" },
      { name: "Vendors", icon: Store, path: "/dashboard/vendors" },
    ],
  },
];

/**
 * Sidebar component with permission-based menu filtering.
 *
 * Admin users bypass permission checks and see all menu items.
 * Regular users only see items for which they have 'read' permission.
 * Items without permission mapping are always shown as a safe fallback.
 *
 * @component
 * @param props - Component props
 * @param props.isOpen - Whether the sidebar is expanded
 * @param props.onToggle - Callback to toggle the sidebar collapsed state
 * @param props.isMobile - Whether the sidebar is in mobile mode
 * @returns The rendered sidebar component
 */
const Sidebar = ({ isOpen, onToggle, isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Main", "Sales"]);

  const { isAdmin, canAccess } = usePermissions();

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const filterItemsByPermissions = (items: MenuItem[]): MenuItem[] => {
    if (isAdmin) return items;
    
    return items.filter((item) => {
      const moduleKey = MENU_PERMISSION_MAP[item.path];
      if (!moduleKey) return true;
      return canAccess(moduleKey);
    });
  };

  const filterMenuGroups = (groups: MenuGroup[]): MenuGroup[] => {
    return groups
      .map((group) => ({
        ...group,
        items: filterItemsByPermissions(group.items),
      }))
      .filter((group) => group.items.length > 0);
  };

  const adminMenuItems: MenuGroup[] = isAdmin
    ? [
        {
          title: "Configuration",
          items: [
            { name: "Users", icon: UserCogIcon, path: "/dashboard/settings/users" },
            { name: "Roles & Profiles", icon: Shield, path: "/dashboard/settings/roles" },
          ],
        },
      ]
    : [];

  const allMenuItems = [...baseMenuItems, ...adminMenuItems];
  const visibleMenuItems = filterMenuGroups(allMenuItems);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-sidebar text-sidebar-foreground flex flex-col z-50",
        isMobile && "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold"
            >
              NovaCRM
            </motion.span>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                !isOpen && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {visibleMenuItems.map((group) => (
          <div key={group.title}>
            {isOpen && (
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors"
              >
                {group.title}
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    expandedGroups.includes(group.title) && "rotate-180"
                  )}
                />
              </button>
            )}
            {(expandedGroups.includes(group.title) || !isOpen) && (
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            !active && "group-hover:scale-110 transition-transform"
                          )}
                        />
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm font-medium"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Help</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default Sidebar;