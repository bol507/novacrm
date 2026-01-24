import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === "email") {
      if (!value) {
        setErrors((prev) => ({ ...prev, email: "El email es requerido" }));
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Email inválido" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }
    
    if (field === "password") {
      if (!value) {
        setErrors((prev) => ({ ...prev, password: "La contraseña es requerida" }));
      } else if (value.length < 6) {
        setErrors((prev) => ({ ...prev, password: "Mínimo 6 caracteres" }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Email inválido" }));
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Contraseña inválida" }));
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast("¡Bienvenido!", {description: "Inicio de sesión exitoso"});
 
    
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-sidebar-background text-sidebar-foreground flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">NovaCRM</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Gestiona tu negocio
            <br />
            <span className="text-primary">de forma inteligente</span>
          </h1>
          <p className="text-lg text-sidebar-foreground/70 max-w-md">
            Sistema CRM moderno, responsive y potente. Diseñado para equipos que buscan eficiencia y resultados.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              "Dashboard interactivo",
              "100% Responsive",
              "Reportes en tiempo real",
              "Seguridad avanzada",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-sm text-sidebar-foreground/80"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {feature}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-sidebar-foreground/50">
          © 2026 NovaCRM. Sistema empresarial moderno.
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NovaCRM</span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-11 h-12 transition-all ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-primary"
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-11 pr-11 h-12 transition-all ${
                    errors.password
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Recordar sesión
                </Label>
              </div>
              <a
                href="#"
                className="text-sm text-primary hover:underline font-medium"
              >
                ¿Olvidó contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary border text-base font-semibold group"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Necesitas ayuda?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Contactar soporte
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;