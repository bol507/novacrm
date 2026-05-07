import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";
import MyProfileDialog from "@/features/users/components/MyProfileDialog";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { NotificationPanel } from "@/features/notifications/components/NotificationPanel";

interface TopBarProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

/**
 * Top navigation bar component for the main application layout.
 *
 * Features:
 * - Mobile menu toggle button (visible only on small screens)
 * - Global search component (handles responsive display internally)
 * - Theme toggle (light/dark mode)
 * - Notification dropdown with mock data
 * - User menu with profile and logout actions
 * - Profile dialog for editing user information
 *
 * @component
 * @param props - Component props
 * @param props.onMenuClick - Callback invoked when the mobile menu button is clicked
 * @param props.sidebarOpen - Whether the sidebar is currently open (optional)
 * @param props.onSidebarToggle - Callback to toggle the sidebar (optional)
 * @returns The rendered top bar component
 *
 * @example
 * // Basic usage with mobile menu handler
 * <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
 *
 * @example
 * // Usage with sidebar toggle
 * <TopBar
 *   sidebarOpen={sidebarOpen}
 *   onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
 * />
 */
const TopBar = ({ onMenuClick }: TopBarProps) => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const { projectId } = useParams<{ projectId?: string }>();
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

  





  const handleMyProfileClick = () => {
    setIsMyProfileOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const { data: notificationData, isLoading: notificationsLoading } = useNotifications.list({
    project_id: projectId ? Number(projectId) : undefined,
    unread_only: true // Solo contar no leídas para el badge
  });

  const unreadCount = notificationData?.meta?.unread_count ?? 0;

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-50">

        {/* ===== LEFT SECTION: Menu + Search ===== */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-none lg:w-auto">

          {/* Mobile Menu Button - solo visible en móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden flex-shrink-0 h-9 w-9"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search - Colapsable en móvil */}
          <div className="relative flex-1 min-w-0 lg:max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* ===== RIGHT SECTION: Actions ===== */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          {/* Theme Toggle - siempre visible */}
          <ModeToggle />

          {/* ===== NOTIFICATIONS ===== */}
          <NotificationPanel projectId={projectId ? Number(projectId) : undefined}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 flex-shrink-0"
              aria-label="Notifications"
              disabled={notificationsLoading}
            >
              <Bell className={`h-5 w-5 ${notificationsLoading ? 'animate-pulse opacity-50' : ''}`} />

              {/* Badge con posición segura */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4.5 sm:h-5 px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] sm:text-xs flex items-center justify-center font-medium leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </NotificationPanel>

          {/* User Menu - responsive */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-9 sm:h-10 flex-shrink-0"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_name}`}
                    alt={user.first_name || user.user_name}
                  />
                  <AvatarFallback className="text-xs">
                    {(user.first_name?.charAt(0) || '?') + (user.last_name?.charAt(0) || '?')}
                  </AvatarFallback>
                </Avatar>

                {/* Nombre de usuario - solo en desktop */}
                <div className="hidden lg:flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user.user_name}
                  </span>
                </div>

                {/* Chevron - solo en desktop */}
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 sm:w-56 max-w-[90vw] sm:max-w-none">
              <DropdownMenuLabel className="text-sm font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleMyProfileClick}
                className="text-sm py-2.5"
              >
                <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-2.5">
                <SettingsIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive text-sm py-2.5"
              >
                <LogOutIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MyProfileDialog
        open={isMyProfileOpen}
        onOpenChange={setIsMyProfileOpen}
      />
    </>
  );
};

export default TopBar;