import { useQuery } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityFeed() {
  const { data: recentMessages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/activity/recent"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getActivityIcon = (message: Message) => {
    if (message.isFromBot) return "fas fa-robot";
    if (message.messageType === "command") return "fas fa-terminal";
    if (message.content.includes("/sticker")) return "fas fa-image";
    if (message.content.includes("/trivia")) return "fas fa-gamepad";
    if (message.content.includes("/audio")) return "fas fa-volume-up";
    return "fas fa-comment";
  };

  const getActivityColor = (message: Message) => {
    if (message.isFromBot) return "coral-gradient";
    if (message.messageType === "command") return "from-purple-500 to-indigo-500";
    if (message.content.includes("/sticker")) return "from-green-500 to-emerald-500";
    if (message.content.includes("/trivia")) return "from-yellow-500 to-orange-500";
    return "ocean-gradient";
  };

  const getActivityDescription = (message: Message) => {
    if (message.isFromBot) return "Bot respondió";
    if (message.content.includes("/sticker")) return "Solicitó sticker";
    if (message.content.includes("/trivia")) return "Inició trivia";
    if (message.content.includes("/help")) return "Solicitó ayuda";
    if (message.messageType === "command") return "Ejecutó comando";
    return "Envió mensaje";
  };

  return (
    <div className="space-y-4">
      {recentMessages?.map((message) => (
        <div
          key={message.id}
          className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${getActivityColor(message)} rounded-full flex items-center justify-center`}>
            <i className={`${getActivityIcon(message)} text-white text-sm`}></i>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">
              {message.isFromBot ? "🦈 Gawr Gura Bot" : "Usuario"} {getActivityDescription(message)}
            </p>
            <p className="text-sm text-gray-600">
              {message.content.length > 50 
                ? `${message.content.substring(0, 50)}...` 
                : message.content} • {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
            </p>
          </div>
          <div className="text-green-500">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>
      ))}
      
      {(!recentMessages || recentMessages.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-fish text-4xl mb-4 opacity-50"></i>
          <p>No hay actividad reciente</p>
        </div>
      )}
    </div>
  );
}
