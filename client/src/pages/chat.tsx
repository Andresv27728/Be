import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Group, Message, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ChatBubble from "@/components/chat-bubble";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { processCommand, getCommandResponse } from "@/lib/bot-commands";
import ProtectedRoute from "@/components/ProtectedRoute";

function ChatContent() {
  const [selectedGroup, setSelectedGroup] = useState<string>("group1");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWebSocket();

  const { data: groups, isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/groups", selectedGroup, "messages"],
    enabled: !!selectedGroup,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup, "messages"] });
      setMessageInput("");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedGroup) return;

    const messageData = {
      groupId: selectedGroup,
      userId: "user1", // Simulate current user
      content: messageInput,
      messageType: messageInput.startsWith('/') ? "command" : "text",
      isFromBot: false,
      metadata: messageInput.startsWith('/') ? { command: messageInput.split(' ')[0].substring(1) } : {},
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users?.find(user => user.id === userId);
  };

  const selectedGroupData = groups?.find(group => group.id === selectedGroup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="glass-card shadow-2xl overflow-hidden h-[800px] flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 ocean-gradient text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="font-semibold">🦈 Gawr Gura Bot</h3>
                <p className="text-xs opacity-90">{groups?.length || 0} grupos activos</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            {groupsLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              groups?.map((group) => (
                <div
                  key={group.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors ${
                    selectedGroup === group.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 ocean-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{group.avatar || group.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{group.name}</h4>
                      <p className="text-sm text-gray-600">
                        {group.memberCount} miembros
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">14:30</p>
                      {Math.random() > 0.7 && (
                        <div className="w-5 h-5 coral-gradient rounded-full text-white text-xs flex items-center justify-center mt-1">
                          {Math.floor(Math.random() * 9) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {selectedGroupData && (
            <div className="p-4 ocean-gradient text-white border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="font-bold">{selectedGroupData.avatar || selectedGroupData.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedGroupData.name}</h3>
                    <p className="text-xs opacity-90">
                      {selectedGroupData.memberCount} miembros • {Math.floor(Math.random() * 20) + 5} en línea
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <i className="fas fa-search"></i>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <i className="fas fa-ellipsis-v"></i>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messagesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-16 w-64 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {messages?.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    user={getUserById(message.userId)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
                <i className="fas fa-plus"></i>
              </Button>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  <i className="fas fa-smile"></i>
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
                <i className="fas fa-microphone"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                className="ocean-gradient text-white rounded-full hover:opacity-80"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Chat() {
  return (
    <ProtectedRoute 
      title="Chat en Tiempo Real" 
      description="Interactúa directamente con los grupos de WhatsApp conectados al bot."
    >
      <ChatContent />
    </ProtectedRoute>
  );
}
