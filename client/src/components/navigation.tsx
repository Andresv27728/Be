import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/chat", label: "Chat", icon: "fas fa-comments" },
    { path: "/admin", label: "Admin", icon: "fas fa-cog" },
    { path: "/connect", label: "Conectar", icon: "fas fa-qrcode", variant: "coral" },
  ];

  return (
    <nav className="relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 ocean-gradient rounded-full flex items-center justify-center animate-pulse-blue">
                <i className="fas fa-robot text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">🦈 Gawr Gura Bot</h1>
                <p className="text-blue-300 text-xs">Advanced WhatsApp Bot v2.0</p>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg font-medium ${
                      item.variant === "coral" 
                        ? "coral-gradient hover:opacity-80" 
                        : isActive 
                          ? "bg-white/20" 
                          : ""
                    }`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
