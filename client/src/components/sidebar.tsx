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
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-600 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-600 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
            <span className="text-white font-bold text-lg">🦈</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Gawr Gura Bot</h1>
            <p className="text-teal-100 text-xs font-medium">WhatsApp Dashboard v2.1</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-3">
          {navItems.map((item) => {
            const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
            const canAccess = !item.protected || isAuthenticated;
            
            return (
              <Link key={item.path + item.label} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-12 px-4 relative transition-all duration-200 rounded-xl ${
                    isActive 
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg transform scale-105" 
                      : canAccess
                        ? "text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105 hover:shadow-md"
                        : "text-slate-500 opacity-60 cursor-not-allowed"
                  }`}
                  disabled={!canAccess}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    isActive ? "bg-white bg-opacity-20" : "bg-slate-600"
                  }`}>
                    <i className={`${item.icon} text-sm`}></i>
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {item.protected && !isAuthenticated && (
                    <Lock className="w-4 h-4 ml-auto text-slate-400" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Indicador de autenticación */}
        {!isAuthenticated && (
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-amber-300 font-semibold">Acceso Limitado</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Algunas funciones requieren autenticación de administrador.
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-6 p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-green-300 font-semibold">Administrador</span>
            </div>
            <p className="text-xs text-slate-300">
              Acceso completo habilitado
            </p>
          </div>
        )}
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-slate-600 bg-slate-800/50">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Estado del Bot</span>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              botStatus?.isConnected ? 'bg-green-400 shadow-green-400/50 shadow-lg' : 'bg-red-400 shadow-red-400/50 shadow-lg'
            }`}></div>
          </div>
          <div className="text-sm text-white font-medium mb-2">
            {botStatus?.isConnected ? '🦈 WhatsApp Conectado' : '❌ Desconectado'}
          </div>
          {botStatus?.isConnected && (
            <div className="text-xs text-slate-300 bg-slate-600/50 px-2 py-1 rounded-lg">
              ⏱️ Uptime: {Math.floor((botStatus.uptime || 0) / 3600)}h {Math.floor(((botStatus.uptime || 0) % 3600) / 60)}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
}