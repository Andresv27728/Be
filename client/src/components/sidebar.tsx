import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: botStatus } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("admin_auth");
      const authTime = localStorage.getItem("admin_auth_time");
      
      if (authToken && authTime) {
        const now = new Date().getTime();
        const loginTime = parseInt(authTime);
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (now - loginTime < twoHours) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("admin_auth_time");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 30000); // Verificar cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-chart-line", protected: false },
    { path: "/connect", label: "Conexión", icon: "fas fa-wifi", protected: false },
    { path: "/chat", label: "Mensajes", icon: "fas fa-comments", protected: true },
    { path: "/admin", label: "Administración", icon: "fas fa-terminal", protected: true },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GG</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">gawr gura</h1>
            <p className="text-slate-400 text-xs">Bot v2.1</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
            const canAccess = !item.protected || isAuthenticated;
            
            return (
              <Link key={item.path + item.label} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-10 px-3 relative ${
                    isActive 
                      ? "bg-slate-800 text-teal-400 border-r-2 border-teal-500" 
                      : canAccess
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-500 opacity-60 cursor-not-allowed"
                  }`}
                  disabled={!canAccess}
                >
                  <i className={`${item.icon} w-4 text-sm mr-3`}></i>
                  <span className="text-sm">{item.label}</span>
                  {item.protected && !isAuthenticated && (
                    <Lock className="w-3 h-3 ml-auto text-slate-500" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Indicador de autenticación */}
        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">Acceso Limitado</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algunas funciones requieren autenticación de administrador.
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-300 font-medium">Administrador</span>
            </div>
            <p className="text-xs text-slate-400">
              Acceso completo habilitado
            </p>
          </div>
        )}
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Estado</span>
          <div className={`w-2 h-2 rounded-full ${
            botStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        </div>
        <div className="text-sm text-white mb-1">
          {botStatus?.isConnected ? 'WhatsApp Conectado' : 'Desconectado'}
        </div>
        {botStatus?.isConnected && (
          <div className="text-xs text-slate-400">
            Uptime: {Math.floor((botStatus.uptime || 0) / 3600)}h {Math.floor(((botStatus.uptime || 0) % 3600) / 60)}m
          </div>
        )}
      </div>
    </div>
  );
}