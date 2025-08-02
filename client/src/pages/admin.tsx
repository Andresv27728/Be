import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Statistics, Group, User, Command } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminPanelContent() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const { data: groups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    refetchInterval: 30000,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    refetchInterval: 30000,
  });

  const { data: commands } = useQuery<Command[]>({
    queryKey: ["/api/commands"],
    refetchInterval: 30000,
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics/today"],
    refetchInterval: 30000,
  });

  const toggleCommandMutation = useMutation({
    mutationFn: async ({ commandId, enabled }: { commandId: string; enabled: boolean }) => {
      return apiRequest("PATCH", `/api/commands/${commandId}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
      toast({
        title: "Comando actualizado",
        description: "El estado del comando ha sido cambiado",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el comando",
      });
    },
  });

  const kickUserMutation = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      return apiRequest("POST", `/api/groups/${groupId}/kick`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Usuario expulsado",
        description: "El usuario ha sido removido del grupo",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo expulsar al usuario",
      });
    },
  });

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔐 Panel de Administración
            </h1>
            <p className="text-slate-400">Funciones avanzadas del bot Gawr Gura</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={`${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-300' : 'bg-red-300'
              }`}></div>
              WebSocket {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs para diferentes secciones */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Grupos
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="commands" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Comandos
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Grupos Activos</h3>
                    <p className="text-2xl font-bold text-white mt-2">
                      {groups?.length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-white"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Total Usuarios</h3>
                    <p className="text-2xl font-bold text-white mt-2">
                      {users?.length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-white"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Comandos Activos</h3>
                    <p className="text-2xl font-bold text-white mt-2">
                      {commands?.filter(cmd => cmd.isActive).length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-terminal text-white"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Mensajes Hoy</h3>
                    <p className="text-2xl font-bold text-white mt-2">
                      {statistics?.totalMessages || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-comment text-white"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actividad reciente */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Actividad del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Bot iniciado correctamente</span>
                  <span className="text-slate-500 ml-auto">hace 2 horas</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-300">Conectado a {groups?.length || 0} grupos</span>
                  <span className="text-slate-500 ml-auto">hace 1 hora</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-300">Sistema de comandos activado</span>
                  <span className="text-slate-500 ml-auto">hace 30 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Grupos */}
        <TabsContent value="groups" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Gestión de Grupos</CardTitle>
            </CardHeader>
            <CardContent>
              {groups && groups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Grupo</TableHead>
                      <TableHead className="text-slate-300">Miembros</TableHead>
                      <TableHead className="text-slate-300">Estado</TableHead>
                      <TableHead className="text-slate-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id} className="border-slate-700">
                        <TableCell className="text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm">
                              {group.avatar}
                            </div>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-slate-400">{group.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {group.memberCount} miembros
                        </TableCell>
                        <TableCell>
                          <Badge className={`${
                            group.isActive ? 'bg-green-600' : 'bg-red-600'
                          } text-white`}>
                            {group.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <i className="fas fa-cog mr-1"></i>
                              Configurar
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <i className="fas fa-eye mr-1"></i>
                              Ver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No hay grupos registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Comandos */}
        <TabsContent value="commands" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Gestión de Comandos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'help', description: 'Muestra ayuda', category: 'general', enabled: true },
                  { name: 'ping', description: 'Verifica latencia', category: 'general', enabled: true },
                  { name: 'sticker', description: 'Genera stickers', category: 'fun', enabled: true },
                  { name: 'dados', description: 'Lanza dados', category: 'games', enabled: true },
                  { name: 'trivia', description: 'Juego de trivia', category: 'games', enabled: true },
                  { name: 'kick', description: 'Expulsa usuario', category: 'admin', enabled: true },
                  { name: 'warn', description: 'Advierte usuario', category: 'admin', enabled: true },
                  { name: 'mute', description: 'Silencia usuario', category: 'admin', enabled: false },
                ].map((command, index) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">/{command.name}</h4>
                          <p className="text-slate-400 text-sm">{command.description}</p>
                        </div>
                        <Switch
                          checked={command.enabled}
                          onCheckedChange={() => {
                            // toggleCommandMutation.mutate({ commandId: command.name, enabled: !command.enabled });
                          }}
                        />
                      </div>
                      <Badge className={`text-xs ${
                        command.category === 'admin' ? 'bg-red-600' :
                        command.category === 'games' ? 'bg-purple-600' :
                        command.category === 'fun' ? 'bg-green-600' :
                        'bg-blue-600'
                      } text-white`}>
                        {command.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Logs del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-96 overflow-y-auto">
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-green-400">[12:30:15] INFO: Bot iniciado correctamente</div>
                  <div className="text-blue-400">[12:30:16] DEBUG: Conectando a WhatsApp...</div>
                  <div className="text-yellow-400">[12:30:20] WARN: Esperando código QR</div>
                  <div className="text-green-400">[12:30:45] INFO: Sistema de comandos cargado</div>
                  <div className="text-blue-400">[12:31:00] DEBUG: WebSocket conectado</div>
                  <div className="text-green-400">[12:31:10] INFO: Conectado a 3 grupos</div>
                  <div className="text-blue-400">[12:31:15] DEBUG: Comando /help ejecutado</div>
                  <div className="text-green-400">[12:31:20] INFO: Usuario nuevo registrado</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button size="sm" className="bg-slate-700 hover:bg-slate-600 text-white">
                  <i className="fas fa-download mr-2"></i>
                  Descargar Logs
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                  <i className="fas fa-trash mr-2"></i>
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <ProtectedRoute 
      title="Panel de Administración" 
      description="Accede a la gestión completa del bot, usuarios, grupos y configuraciones avanzadas."
    >
      <AdminPanelContent />
    </ProtectedRoute>
  );
}