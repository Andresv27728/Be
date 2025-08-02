import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function ProtectedRoute({ children, title, description }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Verificar si ya está autenticado en localStorage
  useEffect(() => {
    const authToken = localStorage.getItem("admin_auth");
    const authTime = localStorage.getItem("admin_auth_time");
    
    if (authToken && authTime) {
      const now = new Date().getTime();
      const loginTime = parseInt(authTime);
      const twoHours = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
      
      // Si han pasado menos de 2 horas, mantener autenticado
      if (now - loginTime < twoHours) {
        setIsAuthenticated(true);
      } else {
        // Limpiar autenticación expirada
        localStorage.removeItem("admin_auth");
        localStorage.removeItem("admin_auth_time");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Contraseña hardcodeada como especificaste
    if (password === "gawr2024") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "authenticated");
      localStorage.setItem("admin_auth_time", new Date().getTime().toString());
      
      toast({
        title: "Acceso autorizado",
        description: `Bienvenido al panel de ${title}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
      });
    }
    
    setPassword("");
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_auth_time");
    
    toast({
      title: "Sesión cerrada",
      description: "Has sido desconectado del panel administrativo",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800/90 border-blue-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">
              🦈 Acceso Restringido
            </CardTitle>
            <p className="text-slate-300 mt-2">
              {description || `Esta sección requiere autorización administrativa para acceder a ${title}.`}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Contraseña de Administrador
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Acceder"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-xs text-slate-400 text-center">
                🔒 Acceso limitado a administradores autorizados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si está autenticado, mostrar el contenido con opción de logout
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Shield className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
      {children}
    </div>
  );
}