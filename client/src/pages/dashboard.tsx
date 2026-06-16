import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Cpu, HardDrive, Clock, Terminal, Activity } from "lucide-react";
import AnalogClock from "@/components/analog-clock";

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
      <div className="flex-1 p-8 bg-transparent min-h-screen">
        <Skeleton className="h-32 w-full bg-white/5 mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32 bg-white/5 rounded-2xl" />
          <Skeleton className="h-32 bg-white/5 rounded-2xl" />
          <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full bg-white/5 rounded-2xl" />
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
      className="flex-1 p-4 md:p-8 bg-transparent min-h-screen"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center animate-glow">
            <span className="mr-3 filter drop-shadow-[0_0_10px_rgba(77,144,226,0.5)]">🦈</span> GAWR GURA BOT
          </h1>
          <p className="text-slate-400 flex items-center font-medium">
            <Activity className="w-4 h-4 mr-2 text-teal-400 animate-pulse" />
            Panel de Control del Sistema
          </p>
        </div>

        <Badge className={`${
          botStatus?.isConnected ? 'bg-green-600/20 text-green-400 border-green-500/50' : 'bg-red-600/20 text-red-400 border-red-500/50'
        } px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] border-2 animate-rgb backdrop-blur-xl transition-all duration-500`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            botStatus?.isConnected ? 'bg-green-400' : 'bg-red-400'
          } animate-pulse`}></div>
          {botStatus?.isConnected ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
        </Badge>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Uptime Stat with Analog Clock */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group hover:border-teal-500/50 transition-all duration-500 shadow-xl hover:shadow-teal-500/10 h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Tiempo Activo</p>
                  <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                    {botStatus?.uptime ? formatUptime(botStatus.uptime) : '0h 0m 0s'}
                  </h3>
                </div>
                <div className="flex items-center justify-center scale-75 md:scale-100">
                  <AnalogClock uptimeSeconds={botStatus?.uptime || 0} />
                </div>
              </div>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-teal-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </Card>
        </motion.div>

        {/* Other Stats */}
        {[
          { label: 'Uso de Memoria', value: `${botStatus?.memoryUsage || 0} MB`, icon: HardDrive, color: 'blue' },
          { label: 'Carga de CPU', value: `${botStatus?.cpuUsage || 0}%`, icon: Cpu, color: 'purple' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group hover:border-${stat.color}-500/50 transition-all duration-500 shadow-xl hover:shadow-${stat.color}-500/10 h-full`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-${stat.color}-500/20 transition-all duration-500`}>
                    <stat.icon className={`text-${stat.color}-400 w-7 h-7`} />
                  </div>
                </div>
              </CardContent>
              {/* Decorative line */}
              <div className={`h-1 w-full bg-gradient-to-r from-transparent via-${stat.color}-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700`} />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Commands Section */}
      <motion.div variants={item} className="max-w-4xl mx-auto">
        <Card className="bg-slate-900/40 border-2 border-teal-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 p-6 border-b border-white/5">
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

              <motion.div
                className="space-y-4 md:space-y-6"
                variants={{
                  show: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {commands.map((cmd) => (
                  <motion.div
                    key={cmd.name}
                    variants={item}
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                    className="group p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-500/20 cursor-default"
                  >
                    <div className="text-yellow-400 font-bold text-xl md:text-2xl flex items-center">
                      <span className="text-teal-500 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">●</span>
                      <span className="text-teal-400 mr-2">$</span> {cmd.name}
                    </div>
                    <div className="text-slate-400 ml-8 md:ml-10 mt-2 text-sm md:text-base leading-relaxed italic border-l-2 border-white/5 pl-4">
                      {cmd.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

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
