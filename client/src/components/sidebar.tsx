import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();

  const { data: botStatus } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/connect", label: "Conexión", icon: "fas fa-wifi" },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-teal-600 to-blue-600">
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
            
            return (
              <Link key={item.path + item.label} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-12 px-4 transition-all duration-200 rounded-xl ${
                    isActive 
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    isActive ? "bg-white bg-opacity-20" : "bg-slate-800"
                  }`}>
                    <i className={`${item.icon} text-sm`}></i>
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Estado</span>
            <div className={`w-3 h-3 rounded-full ${
              botStatus?.isConnected ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400'
            }`}></div>
          </div>
          <div className="text-sm text-white font-medium mb-1">
            {botStatus?.isConnected ? '🦈 Conectado' : '❌ Desconectado'}
          </div>
          {botStatus?.isConnected && (
            <div className="text-[10px] text-slate-500">
              ⏱️ Uptime: {Math.floor((botStatus.uptime || 0) / 3600)}h {Math.floor(((botStatus.uptime || 0) % 3600) / 60)}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
