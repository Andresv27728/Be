import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Lock, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-chart-line", protected: false },
    { path: "/connect", label: "Conexión", icon: "fas fa-wifi", protected: false },
  ];

  const sidebarVariants = {
    expanded: { width: "256px" },
    collapsed: { width: "80px" }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-950/40 backdrop-blur-xl">
      {/* Header */}
      <div className={`p-4 border-b border-white/10 bg-gradient-to-r from-teal-600/80 to-blue-600/80 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="min-w-[48px] w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
            <span className="text-white font-bold text-xl">🦈</span>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="whitespace-nowrap"
            >
              <h1 className="text-white font-black text-lg tracking-tight">GURA BOT</h1>
              <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest">System v2.1</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4">
        {navItems.map((item) => {
          const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
          const canAccess = !item.protected || isAuthenticated;

          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full justify-start h-12 px-0 relative transition-all duration-200 rounded-xl overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${!canAccess ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!canAccess}
              >
                <div className={`min-w-[48px] h-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}>
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {item.protected && !isAuthenticated && !isCollapsed && (
                  <Lock className="w-3 h-3 ml-auto mr-4 text-slate-500" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Status Info */}
      <div className={`p-4 border-t border-white/5 bg-slate-950/20 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
          <div className="flex items-center justify-between w-full">
            <div className={`w-3 h-3 rounded-full animate-pulse shrink-0 ${
              botStatus?.isConnected ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'
            }`}></div>
            {!isCollapsed && (
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Status</span>
            )}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1"
            >
              <div className="text-xs text-white font-bold truncate">
                {botStatus?.isConnected ? 'SHARK ONLINE' : 'SHARK OFFLINE'}
              </div>
              {botStatus?.isConnected && (
                <div className="text-[10px] text-teal-500 font-mono">
                  UP: {Math.floor((botStatus.uptime || 0) / 3600)}h {Math.floor(((botStatus.uptime || 0) % 3600) / 60)}m
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden md:block p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center text-slate-500 hover:text-white hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🦈</span>
          <span className="text-white font-black tracking-tighter">GURA BOT</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden md:flex flex-col h-screen bg-slate-950/40 border-r border-white/10 shadow-2xl relative z-40 transition-all duration-300 ease-in-out backdrop-blur-xl"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl z-50 md:hidden"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
