import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import CleanWhatsAppBot from "./whatsapp-clean";
import { insertMessageSchema, insertUserSchema, insertGroupSchema, insertCommandSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // API Routes

  // Bot Status
  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = {
        id: "bot_status",
        isConnected: whatsappBot.isConnected,
        connectionMethod: whatsappBot.connectionMethod,
        lastConnection: whatsappBot.isConnected ? new Date() : null,
        qrCode: whatsappBot.qrCode,
        uptime: whatsappBot.isConnected ? Math.floor(process.uptime()) : 0,
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Connect Bot
  app.post("/api/bot/connect", async (req, res) => {
    try {
      if (whatsappBot.isConnected) {
        res.json({ message: "Bot ya está conectado", isConnected: true });
        return;
      }

      // Iniciar bot de forma asíncrona
      setTimeout(async () => {
        try {
          await whatsappBot.connect();
        } catch (error: any) {
          console.error('Error conectando bot:', error);
          broadcast({
            type: 'bot_error',
            data: { error: error.message }
          });
        }
      }, 100);

      res.json({ 
        message: "Iniciando conexión a WhatsApp...",
        isConnected: false,
        status: "connecting"
      });
    } catch (error) {
      console.error('Error starting bot:', error);
      res.status(500).json({ error: "Failed to start bot connection" });
    }
  });

  // Disconnect Bot
  app.post("/api/bot/disconnect", async (req, res) => {
    try {
      await whatsappBot.disconnect();
      res.json({ message: "Bot desconectado exitosamente" });
    } catch (error) {
      console.error('Error desconectando bot:', error);
      res.status(500).json({ error: "Failed to disconnect bot" });
    }
  });

  // Refresh QR Code
  app.post("/api/bot/qr/refresh", async (req, res) => {
    try {
      const qrCode = await whatsappBot.getQRCode();
      res.json({ qrCode });
    } catch (error) {
      console.error('Error generando QR:', error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // Request Pairing Code
  app.post("/api/bot/pairing/request", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const pairingCode = await whatsappBot.requestPairingCode(phoneNumber);
      res.json({ 
        pairingCode,
        phoneNumber,
        message: "Código de vinculación generado exitosamente"
      });
    } catch (error: any) {
      console.error('Error generando código de vinculación:', error);
      res.status(500).json({ 
        error: "Failed to generate pairing code",
        details: error.message 
      });
    }
  });

  app.patch("/api/bot/status", async (req, res) => {
    try {
      const updates = req.body;
      const status = await storage.updateBotStatus(updates);
      
      // Broadcast status update
      broadcast({
        type: 'bot_status_update',
        data: status
      });
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot status" });
    }
  });

  // Create WhatsApp Bot instance and start it
  const whatsappBot = new CleanWhatsAppBot();
  
  // Initialize bot connection
  whatsappBot.connect().catch(error => {
    console.error('Error starting WhatsApp bot:', error);
  });

  // Configurar eventos del bot
  whatsappBot.on('qr_ready', ({ qrCode }) => {
    broadcast({
      type: 'qr_ready',
      data: { qrCode, timestamp: new Date() }
    });
  });

  whatsappBot.on('pairing_code_ready', ({ pairingCode, phoneNumber }) => {
    broadcast({
      type: 'pairing_code_ready',
      data: { pairingCode, phoneNumber, timestamp: new Date() }
    });
  });

  whatsappBot.on('connected', ({ user }) => {
    broadcast({
      type: 'bot_connected',
      data: { user, timestamp: new Date() }
    });
  });

  whatsappBot.on('connection_closed', ({ shouldReconnect }) => {
    broadcast({
      type: 'bot_disconnected',
      data: { shouldReconnect, timestamp: new Date() }
    });
  });

  // Real-time message synchronization
  whatsappBot.on('message_received', async (messageData) => {
    try {
      // Store message in database
      await storage.createMessage({
        groupId: messageData.groupId,
        userId: messageData.userId,
        content: messageData.content,
        messageType: messageData.messageType,
        isFromBot: messageData.isFromBot,
        metadata: messageData.metadata || {}
      });

      // Update statistics
      const today = new Date().toISOString().split('T')[0];
      await storage.createOrUpdateStatistics({
        date: today,
        totalMessages: 1,
        totalCommands: 0,
        activeUsers: 1,
        activeGroups: messageData.isGroup ? 1 : 0
      });

      // Broadcast to dashboard
      broadcast({
        type: 'new_message',
        data: {
          ...messageData,
          timestamp: messageData.timestamp.toISOString()
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  whatsappBot.on('message_sent', async (messageData) => {
    try {
      // Store bot message in database
      await storage.createMessage({
        groupId: messageData.groupId,
        userId: 'bot',
        content: messageData.content,
        messageType: messageData.messageType,
        isFromBot: true,
        metadata: messageData.metadata || {}
      });

      // Broadcast to dashboard
      broadcast({
        type: 'bot_message_sent',
        data: {
          ...messageData,
          timestamp: messageData.timestamp.toISOString()
        }
      });
    } catch (error) {
      console.error('Error processing bot message:', error);
    }
  });

  whatsappBot.on('command_executed', async (commandData) => {
    try {
      // Update command usage statistics
      await storage.incrementCommandUsage(commandData.command);

      // Update daily statistics
      const today = new Date().toISOString().split('T')[0];
      await storage.createOrUpdateStatistics({
        date: today,
        totalMessages: 0,
        totalCommands: 1,
        activeUsers: 1,
        activeGroups: commandData.isGroup ? 1 : 0
      });

      // Broadcast command execution
      broadcast({
        type: 'command_executed',
        data: {
          ...commandData,
          timestamp: commandData.timestamp.toISOString()
        }
      });
    } catch (error) {
      console.error('Error processing command:', error);
    }
  });

  whatsappBot.on('error', (error) => {
    broadcast({
      type: 'bot_error',
      data: { error: error.message, timestamp: new Date() }
    });
  });

  whatsappBot.on('session_cleared', (data) => {
    broadcast({
      type: 'session_cleared',
      data: { ...data, timestamp: new Date() }
    });
  });

  // Admin Authentication
  app.post("/api/admin/auth", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD || "gawr2024";
      
      if (password === adminPassword) {
        res.json({ 
          success: true, 
          message: "Autenticación exitosa",
          token: "authenticated" // En producción usar JWT
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: "Contraseña incorrecta" 
        });
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Request Pairing Code
  app.post("/api/bot/pairing/request", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Número de teléfono requerido" });
      }
      
      const pairingCode = await whatsappBot.requestPairingCode(phoneNumber);
      
      res.json({ 
        success: true, 
        pairingCode: pairingCode,
        phoneNumber: phoneNumber 
      });
    } catch (error: any) {
      console.error('Error solicitando código de vinculación:', error);
      res.status(500).json({ 
        error: error.message || "Error generando código de vinculación" 
      });
    }
  });

  // Connect with PIN
  app.post("/api/bot/connect/pin", async (req, res) => {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        return res.status(400).json({ error: "Código PIN requerido" });
      }
      
      // En una implementación real, este PIN vendría del proceso de vinculación
      // Por ahora validamos con el código que se generó
      if (whatsappBot.pairingCode && pin === whatsappBot.pairingCode) {
        // El bot ya debería estar conectado si el PIN fue ingresado correctamente en WhatsApp
        const status = await storage.updateBotStatus({
          isConnected: whatsappBot.isConnected,
          connectionMethod: "pin"
        });
        
        broadcast({
          type: 'bot_connected',
          data: status
        });
        
        res.json({ success: true, status });
      } else {
        res.status(400).json({ error: "Código PIN inválido" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error conectando con PIN" });
    }
  });

  // Force restart bot connection
  app.post("/api/bot/restart", async (req, res) => {
    try {
      await whatsappBot.forceRestart();
      
      const status = await storage.updateBotStatus({
        isConnected: false,
        connectionMethod: null,
        qrCode: null,
        pinCode: null
      });
      
      res.json({ 
        success: true, 
        message: "Bot reiniciado. Genera un nuevo código QR o PIN para conectar.",
        status 
      });
    } catch (error) {
      console.error('Error restarting bot:', error);
      res.status(500).json({ error: "Error reiniciando bot" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getActiveUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  // Groups
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to get groups" });
    }
  });

  app.get("/api/groups/active", async (req, res) => {
    try {
      const groups = await storage.getActiveGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to get group" });
    }
  });

  // Messages
  app.get("/api/groups/:groupId/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessagesByGroup(req.params.groupId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Check if it's a command
      if (messageData.content.startsWith('/')) {
        const commandName = messageData.content.split(' ')[0].substring(1);
        const command = await storage.getCommand(commandName);
        
        if (command) {
          await storage.incrementCommandUsage(commandName);
          
          // Create bot response
          const botResponse = await storage.createMessage({
            groupId: messageData.groupId,
            userId: null,
            content: command.response,
            messageType: "text",
            isFromBot: true,
            metadata: { command: commandName },
          });
          
          // Broadcast command execution and bot response
          broadcast({
            type: 'command_executed',
            data: { command: commandName, user: messageData.userId, group: messageData.groupId }
          });
          
          broadcast({
            type: 'new_message',
            data: botResponse
          });
        }
      }
      
      // Broadcast new message
      broadcast({
        type: 'new_message',
        data: message
      });
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  // Commands
  app.get("/api/commands", async (req, res) => {
    try {
      const commands = await storage.getAllCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to get commands" });
    }
  });

  app.post("/api/commands", async (req, res) => {
    try {
      const commandData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(commandData);
      
      broadcast({
        type: 'command_created',
        data: { command, timestamp: new Date() }
      });
      
      res.json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid command data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create command" });
      }
    }
  });

  app.put("/api/commands/:id", async (req, res) => {
    try {
      const updates = req.body;
      const command = await storage.updateCommand(req.params.id, updates);
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      broadcast({
        type: 'command_updated',
        data: { command, timestamp: new Date() }
      });
      
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to update command" });
    }
  });

  app.delete("/api/commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCommand(id);
      
      if (!success) {
        return res.status(404).json({ error: "Command not found" });
      }
      
      broadcast({
        type: 'command_deleted',
        data: { commandId: id, timestamp: new Date() }
      });
      
      res.json({ success: true, message: "Command deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete command" });
    }
  });

  // Statistics
  app.get("/api/statistics/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await storage.getStatistics(today);
      
      // Broadcast updated statistics via WebSocket
      broadcast({
        type: 'statistics_update',
        data: stats
      });
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get today's statistics" });
    }
  });

  app.get("/api/statistics/range", async (req, res) => {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }
      
      const stats = await storage.getStatisticsRange(start as string, end as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get statistics range" });
    }
  });

  // Recent activity
  app.get("/api/activity/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const messages = await storage.getRecentMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get recent activity" });
    }
  });

  // Configure WhatsApp Bot Event Listeners
  whatsappBot.on('qr', (qrCode: string) => {
    console.log('🔗 QR Code generated');
    broadcast({
      type: 'qr_code',
      data: { qrCode }
    });
  });

  whatsappBot.on('connected', () => {
    console.log('🎉 Bot connected successfully!');
    broadcast({
      type: 'bot_connected',
      data: {
        isConnected: true,
        connectionMethod: whatsappBot.connectionMethod,
        timestamp: new Date()
      }
    });
  });

  whatsappBot.on('status', (status: any) => {
    broadcast({
      type: 'bot_status_update',
      data: status
    });
  });

  whatsappBot.on('message', async (messageData: any) => {
    try {
      // Store message in database
      const message = await storage.createMessage({
        groupId: messageData.isGroup ? messageData.from : null,
        userId: messageData.participant || messageData.from,
        content: messageData.text,
        isFromBot: false,
        messageType: 'text',
      });

      // Broadcast new message
      broadcast({
        type: 'new_message',
        data: message
      });

      console.log(`📥 New message: ${messageData.text.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  whatsappBot.on('error', (error: any) => {
    console.error('🚨 WhatsApp Bot Error:', error);
    broadcast({
      type: 'bot_error',
      data: { error: error.message }
    });
  });

  // Simulate periodic updates for dashboard
  setInterval(() => {
    broadcast({
      type: 'stats_update',
      data: {
        timestamp: new Date().toISOString(),
        botConnected: whatsappBot.isConnected,
        uptime: whatsappBot.isConnected ? Math.floor(process.uptime()) : 0,
      }
    });
  }, 10000);

  return httpServer;
}
