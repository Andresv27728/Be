import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";

interface LiveMessage {
  id: string;
  content: string;
  from: string;
  type: 'incoming' | 'outgoing' | 'command';
  timestamp: Date;
  groupName?: string;
}

export default function LiveMessages() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const { isConnected } = useWebSocket();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setSocket(null);
    };
    
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' || data.type === 'command_executed') {
          const newMessage: LiveMessage = {
            id: `${Date.now()}-${Math.random()}`,
            content: data.content || data.response || 'Mensaje sin contenido',
            from: data.from || 'Desconocido',
            type: data.type === 'command_executed' ? 'command' : 
                  data.fromBot ? 'outgoing' : 'incoming',
            timestamp: new Date(),
            groupName: data.groupName
          };
          
          setMessages(prev => [newMessage, ...prev.slice(0, 49)]); // Mantener solo 50 mensajes
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'incoming': return '📥';
      case 'outgoing': return '📤';
      case 'command': return '⚡';
      default: return '💬';
    }
  };

  const getMessageBadge = (type: string) => {
    switch (type) {
      case 'incoming': return 'bg-blue-600';
      case 'outgoing': return 'bg-green-600';
      case 'command': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>💬</span>
            <span>Mensajes en Tiempo Real</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-slate-400">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <div className="text-2xl mb-2">🦈</div>
                <p className="text-sm">Esperando mensajes...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-teal-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getMessageIcon(message.type)}</span>
                      <Badge className={`${getMessageBadge(message.type)} text-white text-xs`}>
                        {message.type === 'command' ? 'Comando' : 
                         message.type === 'outgoing' ? 'Bot' : 'Usuario'}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
                  </div>
                  
                  <div className="text-sm text-slate-300 mb-1">
                    <strong>De:</strong> {message.from}
                  </div>
                  
                  {message.groupName && (
                    <div className="text-xs text-slate-400 mb-2">
                      <strong>Grupo:</strong> {message.groupName}
                    </div>
                  )}
                  
                  <div className="text-sm text-white bg-slate-800/50 rounded px-2 py-1">
                    {message.content.length > 100 
                      ? `${message.content.substring(0, 100)}...` 
                      : message.content
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}