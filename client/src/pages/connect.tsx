import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BotStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { QrCode, Smartphone, Wifi, Copy } from "lucide-react";

export default function Connect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const { toast } = useToast();
  const { isConnected: wsConnected } = useWebSocket();

  const { data: botStatus, isLoading } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 3000,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bot/connect", {});
    },
    onSuccess: () => {
      setIsConnecting(true);
      toast({
        title: "Iniciando conexión",
        description: "Generando código QR para WhatsApp...",
      });
    },
    onError: (error: any) => {
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo iniciar la conexión",
      });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bot/restart", {});
    },
    onSuccess: () => {
      setIsConnecting(false);
      setPairingCode("");
      setPhoneNumber("");
      toast({
        title: "🔄 Bot Reiniciado",
        description: "El bot ha sido reiniciado. Genera un nuevo código para conectar.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo reiniciar el bot",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bot/disconnect", {});
    },
    onSuccess: () => {
      setIsConnecting(false);
      toast({
        title: "Desconectado",
        description: "Bot desconectado de WhatsApp",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo desconectar",
      });
    },
  });

  const refreshQRMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bot/qr/refresh", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({
        title: "QR Actualizado",
        description: "Se ha generado un nuevo código QR",
      });
    },
  });

  const requestPairingMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return apiRequest("POST", "/api/bot/pairing/request", { phoneNumber });
    },
    onSuccess: (data: any) => {
      setPairingCode(data.pairingCode);
      toast({
        title: "Código de vinculación generado",
        description: `Código: ${data.pairingCode}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo generar el código de vinculación",
      });
    },
  });

  // Stop showing connecting state when bot connects
  useEffect(() => {
    if (botStatus?.isConnected) {
      setIsConnecting(false);
    }
  }, [botStatus?.isConnected]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-96 w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Conexión WhatsApp</h1>
          <p className="text-slate-400">Conecta tu bot de Gawr Gura a WhatsApp</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  botStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                Estado de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  botStatus?.isConnected ? 'bg-green-600' : isConnecting ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  <i className={`fas ${
                    botStatus?.isConnected ? 'fa-check' : isConnecting ? 'fa-spinner fa-spin' : 'fa-times'
                  } text-white text-2xl`}></i>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {botStatus?.isConnected ? 'WhatsApp Conectado' : 
                   isConnecting ? 'Conectando...' : 'Desconectado'}
                </h3>
                
                <p className="text-slate-400 mb-6">
                  {botStatus?.isConnected ? 'El bot está funcionando correctamente' :
                   isConnecting ? 'Esperando escaneo del código QR' :
                   'Haz clic en "Conectar" para iniciar'}
                </p>

                {botStatus?.isConnected ? (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <Badge className="bg-green-600 text-white">
                        Método: {botStatus.connectionMethod || 'QR'}
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Uptime: {Math.floor((botStatus.uptime || 0) / 60)}m
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => disconnectMutation.mutate()}
                        disabled={disconnectMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <i className="fas fa-power-off mr-2"></i>
                        Desconectar
                      </Button>
                      <Button 
                        onClick={() => restartMutation.mutate()}
                        disabled={restartMutation.isPending}
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      >
                        🔄 Reiniciar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending || isConnecting}
                      className="ocean-gradient text-white flex-1"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      {isConnecting ? 'Conectando...' : 'Conectar'}
                    </Button>
                    <Button 
                      onClick={() => restartMutation.mutate()}
                      disabled={restartMutation.isPending}
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    >
                      🔄
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Connection Methods */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Métodos de Conexión</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="qr" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                  <TabsTrigger value="qr" className="data-[state=active]:bg-slate-600">
                    <QrCode className="w-4 h-4 mr-2" />
                    Código QR
                  </TabsTrigger>
                  <TabsTrigger value="pin" className="data-[state=active]:bg-slate-600">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Código PIN
                  </TabsTrigger>
                </TabsList>

                {/* QR Code Tab */}
                <TabsContent value="qr" className="space-y-4">
                  <div className="text-center">
                    <p className="text-slate-400 mb-4">
                      Escanea el código QR desde WhatsApp Web en tu teléfono
                    </p>
                    
                    {botStatus?.qrCode ? (
                      <div className="bg-white p-4 rounded-lg inline-block mb-4">
                        <img 
                          src={botStatus.qrCode} 
                          alt="QR Code" 
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="w-64 h-64 mx-auto mb-4 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                        <div className="text-center">
                          <QrCode className="w-16 h-16 text-slate-500 mx-auto mb-2" />
                          <p className="text-slate-500">
                            {isConnecting ? 'Generando QR...' : 'Sin código QR'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={() => refreshQRMutation.mutate()}
                        disabled={refreshQRMutation.isPending || !botStatus?.qrCode}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <i className="fas fa-sync mr-2"></i>
                        Actualizar QR
                      </Button>
                      
                      <div className="text-xs text-slate-500">
                        El código QR expira automáticamente cada 2 minutos
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PIN Code Tab */}
                <TabsContent value="pin" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-slate-200">
                        Número de teléfono (con código de país)
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ej: +5212345678901"
                        className="bg-slate-700 border-slate-600 text-white mt-2"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Incluye el código de país sin espacios ni guiones
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        if (phoneNumber.trim()) {
                          requestPairingMutation.mutate(phoneNumber);
                        }
                      }}
                      disabled={!phoneNumber.trim() || requestPairingMutation.isPending}
                      className="w-full ocean-gradient text-white"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      {requestPairingMutation.isPending ? 'Generando...' : 'Generar Código PIN'}
                    </Button>

                    {pairingCode && (
                      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                        <div className="text-center">
                          <Label className="text-slate-200 text-sm">
                            Código de Vinculación
                          </Label>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <code className="text-2xl font-mono bg-slate-800 px-4 py-2 rounded border text-green-400">
                              {pairingCode}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(pairingCode);
                                toast({
                                  title: "Copiado",
                                  description: "Código copiado al portapapeles",
                                });
                              }}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-3 text-xs text-slate-400">
                            <p>1. Abre WhatsApp en tu teléfono</p>
                            <p>2. Ve a Configuración → Dispositivos vinculados</p>
                            <p>3. Toca "Vincular un dispositivo"</p>
                            <p>4. Ingresa este código de 8 dígitos</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">
              <i className="fas fa-info-circle mr-2 text-blue-400"></i>
              Instrucciones de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  📱 Método QR Code
                </h4>
                <ol className="text-sm text-slate-300 space-y-2">
                  <li>1. Abre WhatsApp en tu teléfono</li>
                  <li>2. Ve a Configuración → Dispositivos vinculados</li>
                  <li>3. Toca "Vincular un dispositivo"</li>
                  <li>4. Escanea el código QR mostrado arriba</li>
                  <li>5. El bot se conectará automáticamente</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  🔢 Método Código PIN
                </h4>
                <ol className="text-sm text-slate-300 space-y-2">
                  <li>1. Ingresa tu número con código de país</li>
                  <li>2. Haz clic en "Generar Código PIN"</li>
                  <li>3. Abre WhatsApp en tu teléfono</li>
                  <li>4. Ve a Configuración → Dispositivos vinculados</li>
                  <li>5. Ingresa el código de 8 dígitos generado</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <i className="fas fa-lightbulb text-yellow-400 mt-1"></i>
                <div>
                  <h5 className="text-white font-medium">Consejos:</h5>
                  <ul className="text-sm text-slate-300 mt-2 space-y-1">
                    <li>• El código PIN es más conveniente para conexiones remotas</li>
                    <li>• El código QR es más rápido si tienes el teléfono cerca</li>
                    <li>• Ambos métodos son igualmente seguros</li>
                    <li>• El bot recordará la conexión una vez vinculado</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}