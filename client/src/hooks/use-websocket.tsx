import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            // Recreate the connection
            const newWs = new WebSocket(wsUrl);
            wsRef.current = newWs;
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, []);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "bot_status_update":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        if (message.data.isConnected) {
          toast({
            title: "🦈 Bot Conectado",
            description: "Gawr Gura Bot está ahora en línea!",
          });
        }
        break;

      case "bot_connected":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        toast({
          title: "🎉 ¡Conexión Exitosa!",
          description: "El bot se ha conectado correctamente a WhatsApp",
        });
        break;

      case "qr_refresh":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        break;

      case "new_message":
        // Invalidate message queries for the specific group
        if (message.data.groupId) {
          queryClient.invalidateQueries({ 
            queryKey: ["/api/groups", message.data.groupId, "messages"] 
          });
        }
        queryClient.invalidateQueries({ queryKey: ["/api/activity/recent"] });
        break;

      case "qr_ready":
      case "qr_code":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        toast({
          title: "📱 Código QR Disponible",
          description: "Escanea el código QR para conectar WhatsApp",
        });
        break;

      case "bot_disconnected":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        toast({
          title: "🔌 Bot Desconectado",
          description: "El bot se ha desconectado de WhatsApp",
          variant: "destructive",
        });
        break;

      case "pairing_code_ready":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        toast({
          title: "🔐 Código PIN Generado",
          description: `Código: ${message.data.pairingCode}`,
        });
        break;

      case "command_executed":
        queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
        queryClient.invalidateQueries({ queryKey: ["/api/statistics/today"] });
        
        toast({
          title: "⚡ Comando Ejecutado",
          description: `/${message.data.command} ejecutado correctamente`,
        });
        break;

      case "stats_update":
      case "statistics_update":
        queryClient.invalidateQueries({ queryKey: ["/api/statistics/today"] });
        break;

      case "session_cleared":
        toast({
          title: "🔄 Sesión Limpiada",
          description: "Los archivos de autenticación fueron eliminados. Genera un nuevo código QR o PIN.",
          variant: "default",
        });
        // Force refresh of connection page and queries
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
        if (window.location.pathname === '/connect') {
          window.location.reload();
        }
        break;

      case "command_created":
      case "command_updated":
      case "command_deleted":
        queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
        toast({
          title: "✅ Comando Actualizado",
          description: "La lista de comandos ha sido actualizada",
        });
        break;

      case "bot_error":
        toast({
          title: "🚨 Error del Bot",
          description: message.data.error,
          variant: "destructive",
        });
        break;

      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return {
    isConnected,
    sendMessage,
  };
}
