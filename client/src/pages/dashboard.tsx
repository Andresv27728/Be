import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Cpu, HardDrive, Clock, Terminal, Activity } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  const { data: botStatus, isLoading: statusLoading } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  if (statusLoading) {
    return (
      <div className="flex-1 p-8 bg-slate-900 min-h-screen">
        <Skeleton className="h-32 w-full bg-slate-800 mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
          <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
          <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const commands = [
    { name: "/help", description: "Muestra la lista de comandos disponibles" },
    { name: "/ping", description: "Verifica la latencia del bot" },
    { name: "/info", description: "Muestra información del bot y el propietario" },
    { name: "/menu", description: "Muestra el menú principal en el chat" }
  ];

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex-1 p-4 md:p-8 bg-slate-900 min-h-screen"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center">
            <span className="mr-3">🦈</span> GAWR GURA BOT
          </h1>
          <p className="text-slate-400 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-teal-400" />
            Panel de Control del Sistema
          </p>
        </div>

        <Badge className={`${
          botStatus?.isConnected ? 'bg-green-600/20 text-green-400 border-green-500/50' : 'bg-red-600/20 text-red-400 border-red-500/50'
        } px-4 py-2 text-sm font-bold shadow-lg border backdrop-blur-md`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            botStatus?.isConnected ? 'bg-green-400' : 'bg-red-400'
          } animate-pulse`}></div>
          {botStatus?.isConnected ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
        </Badge>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Tiempo Activo</p>
                <h3 className="text-2xl font-bold text-white font-mono">
                  {botStatus?.uptime ? formatUptime(botStatus.uptime) : '0h 0m 0s'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Uso de Memoria</p>
                <h3 className="text-2xl font-bold text-white font-mono">
                  {botStatus?.memoryUsage || 0} MB
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Carga de CPU</p>
                <h3 className="text-2xl font-bold text-white font-mono">
                  {botStatus?.cpuUsage || 0}%
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commands Section */}
      <motion.div variants={item} className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/80 border-2 border-teal-500/20 shadow-2xl overflow-hidden rounded-2xl backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-teal-600/30 to-blue-600/30 p-6 border-b border-teal-500/20">
            <CardTitle className="text-white text-2xl flex items-center justify-center font-black italic tracking-widest uppercase">
              <Terminal className="mr-3 text-teal-400" />
              Lista de Comandos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <div className="bg-slate-950/50 rounded-2xl p-4 md:p-8 font-mono text-lg border border-slate-700/50 shadow-inner">
              <div className="hidden md:block">
                <div className="text-teal-400 mb-4 font-bold flex justify-center opacity-30">
                  ╔══════════════════════════════════════════════╗
                </div>
                <div className="text-white mb-2 flex justify-center text-xl font-bold">
                  ║  🦈 <span className="text-teal-400 mx-2 font-black italic">GAWR GURA SYSTEM</span> 🦈  ║
                </div>
                <div className="text-teal-400 mb-8 font-bold flex justify-center opacity-30">
                  ╚══════════════════════════════════════════════╝
                </div>
              </div>

              <div className="text-blue-400 mb-8 italic text-center font-bold text-xl border-b border-slate-800 pb-4 flex items-center justify-center gap-3">
                <span className="w-8 h-[2px] bg-blue-500/20"></span>
                ✨ MÓDULOS ACTIVOS ✨
                <span className="w-8 h-[2px] bg-blue-500/20"></span>
              </div>

              <div className="space-y-4 md:space-y-6">
                {commands.map((cmd) => (
                  <motion.div
                    key={cmd.name}
                    whileHover={{ x: 10 }}
                    className="group hover:bg-slate-900/50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-500/20 cursor-default"
                  >
                    <div className="text-yellow-400 font-bold text-xl md:text-2xl flex items-center">
                      <span className="text-teal-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">●</span>
                      <span className="text-teal-400 mr-2">$</span> {cmd.name}
                    </div>
                    <div className="text-slate-400 ml-8 md:ml-10 mt-2 text-sm md:text-base leading-relaxed italic border-l-2 border-slate-800 pl-4">
                      {cmd.description}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t border-slate-800/50 flex flex-col items-center">
                <div className="text-slate-500 text-xs mb-4 uppercase tracking-[0.2em]">
                  Autorizado por: <span className="text-teal-500 font-bold ml-1">Yo Soy Yo</span>
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-teal-500/60 font-bold text-sm md:text-base"
                >
                  🌊 SYSTEM.STABLE: ACTIVE
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 flex justify-center space-x-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center group cursor-help">
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-2 group-hover:bg-teal-500 transition-colors"></div>
            Core v{botStatus?.version || '2.1.0'}
          </div>
          <div className="flex items-center group cursor-help">
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></div>
            {botStatus?.isConnected ? 'Active Session' : 'No Session'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
