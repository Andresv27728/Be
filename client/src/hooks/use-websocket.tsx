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

      case "pairing_code_ready":
        toast({
          title: "🔗 Código de Vinculación Generado",
          description: `Código: ${message.data.pairingCode} para ${message.data.phoneNumber}`,
          duration: 10000,
        });
        break;

      case "qr_ready":
        queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
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
