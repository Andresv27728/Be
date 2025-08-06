import makeWASocket, { 
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import type { 
  ConnectionState,
  WAMessageKey,
  WAMessageUpdate,
  MessageUpsertType,
  WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import QRCode from 'qrcode';
import QRTerminal from 'qrcode-terminal';
import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import { extractCommand, isValidCommand, formatCommandList } from './bot-config';
import botConfig from './bot-config';

const logger = P({ 
  level: 'silent',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss'
    }
  }
});

// Simplified console logger for bot activity
const botLogger = {
  connection: (status: string, details?: string) => {
    const emoji = status === 'connected' ? '✅' : status === 'connecting' ? '🔄' : '❌';
    console.log(`${emoji} Bot ${status}${details ? ` - ${details}` : ''}`);
  },
  message: (from: string, content: string, direction: 'incoming' | 'outgoing') => {
    const emoji = direction === 'incoming' ? '📥' : '📤';
    const type = from.endsWith('@g.us') ? 'Grupo' : 'Privado';
    const groupId = from.replace('@g.us', '').slice(-12);
    console.log(`${emoji} ${direction === 'incoming' ? 'Recibido' : 'Enviado'} de ${groupId} (${type}): ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error?.message || '');
  }
};

export interface WhatsAppBot {
  isConnected: boolean;
  connectionMethod: 'qr' | 'pin' | null;
  qrCode: string | null;
  pairingCode: string | null;
  
  connect(): Promise<void>;
  disconnect(): void;
  requestPairingCode(phoneNumber: string): Promise<string>;
  
  on(event: 'qr_ready', listener: (data: { qrCode: string }) => void): this;
  on(event: 'pairing_code_ready', listener: (data: { pairingCode: string, phoneNumber: string }) => void): this;
  on(event: 'connected', listener: (data: { user: any }) => void): this;
  on(event: 'connection_closed', listener: (data: { shouldReconnect: boolean }) => void): this;
  on(event: 'message_received', listener: (data: any) => void): this;
  on(event: 'message_sent', listener: (data: any) => void): this;
  on(event: 'command_executed', listener: (data: any) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'session_cleared', listener: (data: { reason: string }) => void): this;
}

class CleanWhatsAppBot extends EventEmitter implements WhatsAppBot {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  public isConnected = false;
  public connectionMethod: 'qr' | 'pin' | null = null;
  public qrCode: string | null = null;
  public pairingCode: string | null = null;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('auth_info');
      const { version } = await fetchLatestBaileysVersion();
      
      this.socket = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger,
        generateHighQualityLinkPreview: false,
        getMessage: async (key: WAMessageKey) => {
          return { conversation: 'Mensaje no encontrado' };
        }
      });

      // Socket configured

      // Connection updates
      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = await QRCode.toDataURL(qr);
          QRTerminal.generate(qr, { small: true });
          botLogger.connection('qr_ready', 'Código QR generado');
          this.emit('qr_ready', { qrCode: this.qrCode });
        }

        if (connection === 'close') {
          this.isConnected = false;
          this.connectionMethod = null;
          this.qrCode = null;
          
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          botLogger.connection('disconnected', shouldReconnect ? 'Reconectando...' : 'Sesión cerrada');
          this.emit('connection_closed', { shouldReconnect });
          
          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            // Si falló todos los intentos de reconexión, limpiar sesión
            await this.clearAuthSession();
            botLogger.connection('session_cleared', 'Limpiando sesión después de múltiples fallos');
            this.emit('session_cleared', { reason: 'max_reconnect_attempts' });
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.connectionMethod = 'qr';
          this.qrCode = null;
          this.reconnectAttempts = 0;
          
          const user = this.socket.user;
          botLogger.connection('connected', `Usuario: ${user.name || user.id}`);
          this.emit('connected', { user });
        }
      });

      // Save credentials
      this.socket.ev.on('creds.update', saveCreds);

      // Handle messages
      this.socket.ev.on('messages.upsert', async (messageUpdate: any) => {
        const { messages, type } = messageUpdate;
        
        if (type === 'notify') {
          for (const message of messages) {
            if (!message.message || message.key.fromMe) continue;
            
            const content = message.message.conversation || 
                           message.message.extendedTextMessage?.text || '';
            
            const from = message.key.remoteJid;
            const isGroup = from?.endsWith('@g.us');
            const pushName = message.pushName || 'Usuario';
            const phone = from?.replace('@s.whatsapp.net', '').replace('@g.us', '');
            
            botLogger.message(from!, content, 'incoming');
            
            // Emit event for real-time sync
            this.emit('message_received', {
              id: message.key.id || nanoid(),
              groupId: isGroup ? from : null,
              userId: isGroup ? message.key.participant?.replace('@s.whatsapp.net', '') : phone,
              content: content.trim(),
              messageType: 'text',
              isFromBot: false,
              timestamp: new Date(message.messageTimestamp * 1000 || Date.now()),
              senderName: pushName,
              from,
              isGroup,
              rawMessage: message
            });

            // Process commands
            if (isValidCommand(content)) {
              await this.handleCommand(from!, content, pushName, phone);
            }
          }
        }
      });

    } catch (error) {
      botLogger.error('Error conectando', error);
      this.emit('error', new Error('Error de conexión'));
      throw error;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    this.reconnectTimeout = setTimeout(() => {
      botLogger.connection('connecting', `Intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect().catch(error => {
        botLogger.error('Error en reconexión', error);
      });
    }, delay);
  }

  async requestPairingCode(phoneNumber: string): Promise<string> {
    try {
      if (!this.socket) {
        throw new Error('Socket no inicializado');
      }

      const cleanNumber = phoneNumber.replace(/\D/g, '');
      if (cleanNumber.length < 10) {
        throw new Error('Número de teléfono inválido');
      }

      const code = await this.socket.requestPairingCode(cleanNumber);
      this.pairingCode = code;
      
      botLogger.connection('pairing_code_ready', `Código: ${code}`);
      this.emit('pairing_code_ready', { pairingCode: code, phoneNumber: cleanNumber });
      
      return code;
    } catch (error) {
      botLogger.error('Error solicitando código de vinculación', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.connectionMethod = null;
    this.qrCode = null;
    this.pairingCode = null;
  }

  private async handleCommand(from: string, commandText: string, senderName?: string, phone?: string): Promise<void> {
    if (!this.socket) return;

    const commandData = extractCommand(commandText);
    if (!commandData) return;

    const { command, args } = commandData;
    let response = '';
    
    const isGroup = from.endsWith('@g.us');
    const userId = phone || from.replace('@s.whatsapp.net', '');
    
    // Emit command start event
    this.emit('command_start', {
      command,
      args,
      from,
      userId,
      senderName: senderName || 'Usuario',
      isGroup,
      timestamp: new Date()
    });

    // Find command
    const commandConfig = Object.entries(botConfig.commands).find(([name, config]) => 
      name === command || config.aliases.includes(command)
    );

    if (commandConfig) {
      const [commandName] = commandConfig;
      
      switch (commandName) {
        case 'help':
        case 'menu':
          response = formatCommandList();
          break;

        case 'ping':
          const startTime = Date.now();
          const pingTime = Date.now() - startTime;
          response = `🦈 ¡Pong! Bot funcionando correctamente\n⚡ Latencia: ~${pingTime}ms`;
          break;

        case 'info':
          response = `🦈 **${botConfig.botInfo.name} v${botConfig.botInfo.version}**\n\n📱 Estado: Conectado\n🤖 Descripción: ${botConfig.botInfo.description}\n👨‍💻 Desarrollado por: ${botConfig.botInfo.author}\n📝 Prefijos: ${botConfig.prefixes.join(', ')}`;
          break;

        case 'dados':
          const diceCount = Math.min(parseInt(args[0]) || 1, 6);
          const results = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
          const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
          response = `🎲 **Lanzando ${diceCount} dado(s)** 🎲\n\nResultados: ${results.map(r => diceEmojis[r-1]).join(' ')}\nTotal: ${results.reduce((a, b) => a + b, 0)}`;
          break;

        case 'moneda':
          const coin = Math.random() < 0.5 ? 'Cara' : 'Cruz';
          response = `🪙 **Lanzando moneda** 🪙\n\nResultado: **${coin}** ${coin === 'Cara' ? '👤' : '❌'}`;
          break;

        case 'perfil':
          response = `👤 **Tu Perfil** 👤\n\n📱 Número: ${userId}\n⭐ Nivel: 1\n🎯 XP: 0\n🏆 Rango: Miembro\n📅 Registrado: Hoy`;
          break;

        default:
          response = `🦈 Comando "${command}" no encontrado.\n💡 Usa /help para ver comandos disponibles.\n📝 Prefijos válidos: ${botConfig.prefixes.join(', ')}`;
      }
    } else {
      response = `🦈 Comando "${command}" no encontrado.\n💡 Usa /help para ver comandos disponibles.\n📝 Prefijos válidos: ${botConfig.prefixes.join(', ')}`;
    }

    if (response) {
      try {
        // Send response
        await this.socket.sendMessage(from, { text: response });
        botLogger.message(from, response, 'outgoing');
        
        // Emit command executed event
        this.emit('command_executed', {
          command,
          args,
          from,
          userId,
          senderName: senderName || 'Usuario',
          isGroup,
          response,
          timestamp: new Date(),
          success: true
        });
        
        // Emit message sent event
        this.emit('message_sent', {
          id: nanoid(),
          groupId: isGroup ? from : null,
          userId: 'bot',
          content: response,
          messageType: 'command',
          isFromBot: true,
          timestamp: new Date(),
          metadata: { command, originalMessage: commandText }
        });
        
      } catch (error) {
        botLogger.error('Error enviando respuesta', error);
        this.emit('command_executed', {
          command,
          args,
          from,
          userId,
          senderName: senderName || 'Usuario',
          isGroup,
          response: '',
          timestamp: new Date(),
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  }

  private async clearAuthSession(): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const authDir = path.default.join(process.cwd(), 'auth_info');
      
      if (fs.default.existsSync(authDir)) {
        // Eliminar todos los archivos de autenticación
        const files = fs.default.readdirSync(authDir);
        for (const file of files) {
          fs.default.unlinkSync(path.default.join(authDir, file));
        }
        botLogger.connection('auth_cleared', 'Archivos de autenticación eliminados');
      }
      
      // Reset internal state
      this.reconnectAttempts = 0;
      this.isConnected = false;
      this.connectionMethod = null;
      this.qrCode = null;
      this.pairingCode = null;
      
    } catch (error) {
      botLogger.error('Error limpiando sesión', error);
    }
  }

  async forceRestart(): Promise<void> {
    botLogger.connection('force_restart', 'Reinicio forzado del bot');
    
    // Clear current session
    await this.clearAuthSession();
    
    // Disconnect current socket
    this.disconnect();
    
    // Reset reconnection attempts
    this.reconnectAttempts = 0;
    
    // Start fresh connection
    setTimeout(() => {
      this.connect().catch(error => {
        botLogger.error('Error en reinicio forzado', error);
      });
    }, 2000);
  }
}

export default CleanWhatsAppBot;