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
import { QrCode, Smartphone, Wifi, Copy, RefreshCw, LogOut, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    if (botStatus?.isConnected) {
      setIsConnecting(false);
    }
  }, [botStatus?.isConnected]);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-transparent min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-96 w-full bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center">
            <Wifi className="mr-3 text-teal-400" /> CONEXIÓN WHATSAPP
          </h1>
          <p className="text-slate-400 font-medium">Vincula tu cuenta para activar las funciones del bot</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full shadow-2xl overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg uppercase tracking-wider">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    botStatus?.isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  }`}></div>
                  Estado del Enlace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <motion.div
                    animate={isConnecting ? { rotate: 360 } : {}}
                    transition={isConnecting ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                      botStatus?.isConnected ? 'bg-green-500/20 text-green-400' : isConnecting ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    } border border-current transition-colors duration-500`}
                  >
                    {botStatus?.isConnected ? (
                      <Wifi className="w-10 h-10" />
                    ) : isConnecting ? (
                      <RotateCw className="w-10 h-10" />
                    ) : (
                      <LogOut className="w-10 h-10" />
                    )}
                  </motion.div>

                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                    {botStatus?.isConnected ? 'WhatsApp Activo' :
                     isConnecting ? 'Sincronizando...' : 'Desconectado'}
                  </h3>

                  <p className="text-slate-400 mb-8 max-w-[250px] mx-auto text-sm leading-relaxed">
                    {botStatus?.isConnected ? 'Tu bot está patrullando los mares de WhatsApp' :
                     isConnecting ? 'Esperando que escanees el código de acceso' :
                     'El sistema requiere una conexión activa para funcionar'}
                  </p>

                  <div className="space-y-4">
                    {botStatus?.isConnected ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-center space-x-2">
                          <Badge variant="outline" className="border-teal-500/50 text-teal-400 px-3">
                            MODO: {botStatus.connectionMethod?.toUpperCase() || 'QR'}
                          </Badge>
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400 px-3">
                            ONLINE: {Math.floor((botStatus.uptime || 0) / 60)}m
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => disconnectMutation.mutate()}
                            disabled={disconnectMutation.isPending}
                            className="bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600 hover:text-white flex-1 font-bold"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            DESCONECTAR
                          </Button>
                          <Button
                            onClick={() => restartMutation.mutate()}
                            disabled={restartMutation.isPending}
                            variant="outline"
                            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black shrink-0"
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => connectMutation.mutate()}
                          disabled={connectMutation.isPending || isConnecting}
                          className="bg-teal-600 hover:bg-teal-700 text-white flex-1 font-bold shadow-lg shadow-teal-600/20 h-12"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              CONECTANDO...
                            </>
                          ) : (
                            <>
                              <Wifi className="w-4 h-4 mr-2" />
                              INICIAR CONEXIÓN
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => restartMutation.mutate()}
                          disabled={restartMutation.isPending}
                          variant="outline"
                          className="border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white shrink-0"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Connection Methods */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden h-full shadow-2xl">
              <Tabs defaultValue="qr" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 rounded-none h-14 p-0">
                  <TabsTrigger
                    value="qr"
                    className="data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400 rounded-none h-full border-b-2 border-transparent data-[state=active]:border-teal-500"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    CÓDIGO QR
                  </TabsTrigger>
                  <TabsTrigger
                    value="pin"
                    className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 rounded-none h-full border-b-2 border-transparent data-[state=active]:border-blue-500"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    CÓDIGO PIN
                  </TabsTrigger>
                </TabsList>

                {/* QR Code Tab */}
                <TabsContent value="qr" className="p-6 flex-1 flex flex-col justify-center m-0">
                  <div className="text-center">
                    <p className="text-slate-400 mb-6 text-sm italic">
                      Escanea el código con tu aplicación de WhatsApp
                    </p>
                    
                    <div className="relative group mx-auto mb-8 w-64 h-64">
                      <AnimatePresence mode="wait">
                        {botStatus?.qrCode ? (
                          <motion.div
                            key={botStatus.qrCode}
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{
                              opacity: 0,
                              scale: 1.1,
                              filter: "blur(20px)",
                              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 20%)"
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="bg-white p-4 rounded-3xl shadow-2xl relative z-10"
                          >
                            <img
                              src={botStatus.qrCode}
                              alt="QR Code"
                              className="w-full h-full rounded-lg"
                            />
                            {/* Decorative Frame */}
                            <div className="absolute -inset-1 border-2 border-teal-500/30 rounded-[30px] -z-10 pointer-events-none group-hover:scale-105 transition-transform duration-500"></div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full bg-slate-900/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-700 overflow-hidden relative"
                          >
                            <div className="text-center z-10">
                              <QrCode className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                                {isConnecting ? 'Generando...' : 'Sin código'}
                              </p>
                            </div>
                            {isConnecting && (
                              <motion.div
                                animate={{ y: [0, 256, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute top-0 left-0 right-0 h-1 bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.8)]"
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => refreshQRMutation.mutate()}
                        disabled={refreshQRMutation.isPending || !botStatus?.qrCode}
                        variant="outline"
                        className="border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white w-full max-w-[200px]"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshQRMutation.isPending ? 'animate-spin' : ''}`} />
                        ACTUALIZAR QR
                      </Button>
                      
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                        El código caduca cada 60 segundos
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PIN Code Tab */}
                <TabsContent value="pin" className="p-6 flex-1 flex flex-col m-0">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 block">
                        Número de Teléfono
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Ej: +521234567890"
                          className="bg-slate-900/50 border-slate-700 text-white pl-10 h-12 focus:border-blue-500/50 focus:ring-0 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 italic">
                        * Incluye el código de país sin espacios ni símbolos
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        if (phoneNumber.trim()) {
                          requestPairingMutation.mutate(phoneNumber);
                        }
                      }}
                      disabled={!phoneNumber.trim() || requestPairingMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-600/20"
                    >
                      {requestPairingMutation.isPending ? 'PROCESANDO...' : 'GENERAR PIN'}
                    </Button>

                    <AnimatePresence>
                      {pairingCode && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900/80 p-6 rounded-2xl border border-blue-500/30 backdrop-blur-md mt-4"
                        >
                          <div className="text-center">
                            <Label className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                              CÓDIGO DE ENLACE
                            </Label>
                            <div className="flex items-center justify-center space-x-3 mb-6">
                              <code className="text-3xl font-black font-mono text-white tracking-widest px-6 py-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                {pairingCode}
                              </code>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(pairingCode);
                                  toast({
                                    title: "Copiado",
                                    description: "Código copiado al portapapeles",
                                  });
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy className="w-5 h-5" />
                              </Button>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-relaxed text-left space-y-1">
                              <p>1. Abre WhatsApp → Dispositivos Vinculados</p>
                              <p>2. Toca "Vincular con número de teléfono"</p>
                              <p>3. Ingresa este código de 8 dígitos</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/30 border-slate-700/50 border-dashed backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-bold text-sm mb-4 flex items-center">
                    <span className="w-6 h-6 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center text-xs mr-2 italic">1</span>
                    VÍA CÓDIGO QR
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 font-medium">
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Abre WhatsApp en tu dispositivo</li>
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Menú &gt; Dispositivos Vinculados</li>
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Escanea el código mostrado</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-xs mr-2 italic">2</span>
                    VÍA CÓDIGO PIN
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 font-medium">
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Ingresa tu número internacional</li>
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Recibe el PIN de 8 caracteres</li>
                    <li className="flex items-center"><span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span> Introdúcelo en la notificación de WhatsApp</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
