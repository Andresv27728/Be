import { useQuery } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: botStatus, isLoading: statusLoading, error } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
    retry: 3
  });

  if (statusLoading) {
    return (
      <div className="flex-1 p-8 bg-slate-900 min-h-screen">
        <Skeleton className="h-32 w-full bg-slate-800 mb-8" />
        <Skeleton className="h-96 w-full bg-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-900 min-h-screen flex flex-col items-center justify-center text-white">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Error de conexión</h2>
        <p className="text-slate-400">No se pudo cargar el estado del bot. Reintentando...</p>
      </div>
    );
  }

  const commands = [
    { name: "/help", description: "Muestra la lista de comandos disponibles" },
    { name: "/ping", description: "Verifica la latencia del bot" },
    { name: "/info", description: "Muestra información del bot y el propietario" },
    { name: "/menu", description: "Muestra el menú principal en el chat" }
  ];

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            🦈 GAWR GURA BOT
          </h1>
          <p className="text-slate-400 flex items-center">
            <span className="mr-2">👤</span>
            Prop: <span className="text-teal-400 font-bold ml-1">Yo Soy Yo</span>
          </p>
        </div>

        <Badge className={`${
          botStatus?.isConnected ? 'bg-green-600' : 'bg-red-600'
        } text-white px-4 py-1 text-sm font-bold shadow-lg w-fit`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            botStatus?.isConnected ? 'bg-green-300' : 'bg-red-300'
          } ${botStatus?.isConnected ? 'animate-pulse' : ''}`}></div>
          {botStatus?.isConnected ? 'CONECTADO' : 'DESCONECTADO'}
        </Badge>
      </div>

      {/* Main Content - Only Command List */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-2 border-teal-500/30 shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 border-b border-teal-400/20">
            <CardTitle className="text-white text-xl md:text-2xl flex items-center justify-center font-black italic">
              <i className="fas fa-terminal mr-3"></i>
              MENÚ DE COMANDOS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <div className="bg-slate-950 rounded-2xl p-4 md:p-8 font-mono text-sm md:text-lg border border-slate-700 shadow-inner">
              <div className="text-teal-400 mb-6 font-bold flex justify-center overflow-hidden whitespace-nowrap">
                ╔══════════════════════════════╗
              </div>
              <div className="text-white mb-2 flex justify-center text-lg md:text-xl font-bold">
                ║  🦈 GAWR GURA BOT 🦈  ║
              </div>
              <div className="text-teal-400 mb-8 font-bold flex justify-center overflow-hidden whitespace-nowrap">
                ╚══════════════════════════════╝
              </div>

              <div className="text-blue-400 mb-8 italic text-center font-bold text-lg md:text-xl border-b border-slate-800 pb-4">
                ✨ MENÚ PRINCIPAL ✨
              </div>

              <div className="space-y-6 md:space-y-8">
                {commands.map((cmd) => (
                  <div key={cmd.name} className="group hover:bg-slate-900 p-3 md:p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-500/20">
                    <div className="text-yellow-400 font-bold text-xl md:text-2xl flex items-center">
                      <span className="text-teal-500 mr-3 opacity-50 group-hover:opacity-100">&gt;</span>
                      ⚡ {cmd.name}
                    </div>
                    <div className="text-slate-400 ml-8 md:ml-10 mt-1 md:mt-2 text-sm md:text-base leading-relaxed italic">
                      └ {cmd.description}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col items-center">
                <div className="text-slate-300 text-sm md:text-base mb-2">
                  👤 <span className="font-bold">Prop:</span> <span className="text-teal-400">Yo Soy Yo</span>
                </div>
                <div className="text-teal-500 font-bold">
                  🌊 ¡Disfruta del bot, chum!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simple Status Info at bottom */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-slate-500 text-xs md:text-sm font-medium">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-slate-600 rounded-full mr-2"></span>
            Versión 2.1.0
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-slate-600 rounded-full mr-2"></span>
            {botStatus?.uptime ? `Uptime: ${Math.floor(botStatus.uptime / 3600)}h` : 'Uptime: 0h'}
          </div>
        </div>
      </div>
    </div>
  );
}
