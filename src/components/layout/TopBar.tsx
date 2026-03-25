import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";
import MyProfileDialog from "@/features/users/components/MyProfileDialog";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";

interface TopBarProps {
  /** Callback invoked when the mobile menu button is clicked */
  onMenuClick: () => void;
  /** Whether the sidebar is currently open (optional, for responsive behavior) */
  sidebarOpen?: boolean;
  /** Callback to toggle the sidebar (optional, alternative to onMenuClick) */
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
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);

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

  if (!user) {
    return null;
  }

  const notifications = [
    { id: 1, title: "New opportunity", message: "Client ABC requested a quote", time: "5 min" },
    { id: 2, title: "Task completed", message: "Lead follow-up completed", time: "1 hr" },
    { id: 3, title: "Upcoming meeting", message: "Presentation in 30 minutes", time: "30 min" },
  ];

  const handleMyProfileClick = () => {
    setIsMyProfileOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search - GlobalSearch handles responsive behavior internally */}
          <div className="relative w-full max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <span className="text-sm text-muted-foreground mt-1">{notif.message}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_name}`} />
                  <AvatarFallback>
                    {user.first_name?.charAt(0) || "?"}
                    {user.last_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.user_name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMyProfileClick}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
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