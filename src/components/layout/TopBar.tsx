import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/use-auth"; // 👈 Importa useAuth

interface TopBarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const TopBar = ({ onMenuClick, sidebarOpen, onSidebarToggle }: TopBarProps) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, loading } = useAuth(); // 👈 Ahora sí está definido

  // Manejo de estado de carga o ausencia de usuario
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

  // Si no hay usuario (aunque no debería pasar en un layout protegido)
  if (!user) {
    return null;
  }

  const notifications = [
    { id: 1, title: "Nueva oportunidad", message: "Cliente ABC solicitó cotización", time: "5 min" },
    { id: 2, title: "Tarea completada", message: "Seguimiento a lead finalizado", time: "1 hora" },
    { id: 3, title: "Reunión próxima", message: "Presentación en 30 minutos", time: "30 min" },
  ];

  return (
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

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className={`pl-9 w-64 transition-all ${searchFocused ? "w-80 ring-2 ring-primary" : ""}`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <ModeToggle />

        {/* Notifications */}
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
              Notificaciones
              <Badge variant="secondary">3 nuevas</Badge>
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
              Ver todas las notificaciones
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
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Aquí deberías llamar a logout del hook
                // Ej: const { logout } = useAuth(); logout();
                navigate("/login");
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;