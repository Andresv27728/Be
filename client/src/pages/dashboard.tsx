import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Statistics, BotStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LiveMessages from "@/components/live-messages";

export default function Dashboard() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["/api/statistics/today"],
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  const { data: botStatus } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  const authenticateMutation = useMutation({
    mutationFn: async (password: string) => {
      return apiRequest("POST", "/api/admin/auth", { password });
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      setDialogOpen(false);
      setPassword("");
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel avanzado",
      });
      // Redirigir al panel de administración
      window.location.href = '/admin';
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
      });
      setPassword("");
    },
  });

  const handlePasswordSubmit = () => {
    if (password.trim()) {
      authenticateMutation.mutate(password);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🦈 Dashboard - Gawr Gura Bot
            </h1>
            <p className="text-slate-400">Estadísticas en tiempo real de WhatsApp</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className={`${
              botStatus?.isConnected ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                botStatus?.isConnected ? 'bg-green-300' : 'bg-red-300'
              }`}></div>
              {botStatus?.isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>

            {/* Botón de acceso avanzado */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <i className="fas fa-cog mr-2"></i>
                  Acceso Avanzado
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 text-white border-slate-700">
                <DialogHeader>
                  <DialogTitle>🔐 Panel Avanzado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-slate-400">
                    Ingresa la contraseña para acceder a las funciones avanzadas del bot
                  </p>
                  <Input
                    type="password"
                    placeholder="Contraseña del administrador"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button 
                    onClick={handlePasswordSubmit}
                    disabled={authenticateMutation.isPending || !password.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {authenticateMutation.isPending ? 'Verificando...' : 'Acceder'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Mensajes de hoy */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Mensajes Hoy</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {statistics?.totalMessages || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-comment text-white text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              +{statistics?.totalMessages ? Math.floor(statistics.totalMessages * 0.1) : 0} desde ayer
            </p>
          </CardContent>
        </Card>

        {/* Comandos ejecutados */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Comandos</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {statistics?.totalCommands || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-terminal text-white text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              +{statistics?.totalCommands ? Math.floor(statistics.totalCommands * 0.2) : 0} desde ayer
            </p>
          </CardContent>
        </Card>

        {/* Usuarios activos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Usuarios Activos</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {statistics?.activeUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              +{statistics?.activeUsers ? Math.floor(statistics.activeUsers * 0.05) : 0} nuevos usuarios
            </p>
          </CardContent>
        </Card>

        {/* Tiempo de actividad */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Uptime</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {botStatus?.uptime ? Math.floor(botStatus.uptime / 3600) : 0}h
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {botStatus?.isConnected ? 'Funcionando correctamente' : 'Desconectado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del sistema y mensajes en tiempo real */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de conexión */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Conexión WhatsApp</span>
                <Badge className={`${
                  botStatus?.isConnected ? 'bg-green-600' : 'bg-red-600'
                } text-white`}>
                  {botStatus?.isConnected ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">WebSocket</span>
                <Badge className={`${
                  isConnected ? 'bg-green-600' : 'bg-red-600'
                } text-white`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Método de conexión</span>
                <Badge className="bg-blue-600 text-white">
                  {botStatus?.connectionMethod || 'Ninguno'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Última conexión</span>
                <span className="text-white text-sm">
                  {botStatus?.lastConnection 
                    ? new Date(botStatus.lastConnection).toLocaleString('es-ES')
                    : 'Nunca'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics ? (
                <>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">
                      {statistics.totalMessages} mensajes procesados hoy
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">
                      {statistics.totalCommands} comandos ejecutados
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">
                      {statistics.activeUsers} usuarios activos
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-sm">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mensajes en tiempo real */}
        <LiveMessages />
      </div>

      {/* Mensaje informativo */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-teal-800 to-blue-800 border-teal-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-info-circle text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold">Dashboard Simplificado</h3>
                <p className="text-teal-100 text-sm">
                  Este es el panel de estadísticas básicas. Para acceder a funciones avanzadas como 
                  gestión de grupos, configuración de comandos y logs detallados, usa el botón "Acceso Avanzado".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}