import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Building2,
  ChevronLeft,
  ChevronDown,
  Target,
  Folder,
  CheckSquare,
  User,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const menuItems = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
     /*  { name: "Calendario", icon: Calendar, path: "/dashboard/calendar" }, */
    ],
  },
  {
    title: "Ventas",
    items: [
      { name: "Clientes", icon: Users, path: "/dashboard/clients" },
      { name: "Contactos", icon: User, path: "/dashboard/contacts" },
      { name: "Oportunidades", icon: Target, path: "/dashboard/opportunities" },
      { name: "Cotizaciones", icon: FileText, path: "/dashboard/quotes" },
    ],
  },
 /*  {
    title: "Marketing",
    items: [
      { name: "Campañas", icon: Mail, path: "/dashboard/campaigns" },
      { name: "Leads", icon: Briefcase, path: "/dashboard/leads" },
    ],
  },
  {
    title: "Inventario",
    items: [
      { name: "Productos", icon: Package, path: "/dashboard/products" },
      { name: "Reportes", icon: BarChart3, path: "/dashboard/reports" },
    ],
  }, */
  {
    title: "Proyectos",
    items: [
    { name: "Proyectos", icon: Folder, path: "/dashboard/projects" },
    { name: "Tareas", icon: CheckSquare, path: "/dashboard/tasks" },
  ],
  },
  /* {
    title: "Configuración",
    items: [
      {
        name: "Usuarios",
        icon: UserCogIcon,
        path: "/dashboard/users",
      },
      
    ],
  }, */
];

const Sidebar = ({ isOpen, onToggle, isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Principal", "Ventas"]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

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
      {/* Header */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuItems.map((group) => (
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

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
            isActive("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Configuración</span>}
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Ayuda</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
