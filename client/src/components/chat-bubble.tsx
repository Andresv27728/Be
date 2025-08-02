import { Message, User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: Message;
  user?: User;
  isBot?: boolean;
}

export default function ChatBubble({ message, user, isBot }: ChatBubbleProps) {
  const isFromBot = message.isFromBot || isBot;
  const timeString = new Date(message.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isFromBot) {
    return (
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8 coral-gradient">
          <AvatarFallback className="text-white">
            <i className="fas fa-robot text-xs"></i>
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 chat-bubble p-3 max-w-md border border-red-200">
            <p className="text-sm font-medium text-red-600 mb-1">🦈 Gawr Gura Bot</p>
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs text-gray-500 mt-1">{timeString}</p>
          </div>
        </div>
      </div>
    );
  }

  // User message from the right side (sent style)
  if (!isFromBot && message.userId) {
    return (
      <div className="flex justify-end">
        <div className="ocean-gradient chat-bubble-sent text-white p-3 max-w-md">
          <p className="text-sm font-medium mb-1">{user?.displayName || "Usuario"}</p>
          <p>{message.content}</p>
          <p className="text-xs opacity-90 mt-1">{timeString}</p>
        </div>
      </div>
    );
  }

  // Regular received message
  return (
    <div className="flex items-start space-x-3">
      <Avatar className="w-8 h-8 ocean-gradient">
        <AvatarFallback className="text-white text-xs font-bold">
          {user?.displayName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-white chat-bubble shadow-sm p-3 max-w-md border border-gray-200">
          <p className="text-sm font-medium text-blue-600 mb-1">{user?.displayName || "Usuario"}</p>
          <p className="text-gray-800">{message.content}</p>
          <p className="text-xs text-gray-500 mt-1">{timeString}</p>
        </div>
      </div>
    </div>
  );
}
