import { EventEmitter } from 'events';
import { 
  default as makeWASocket,
  DisconnectReason, 
  ConnectionState,
  WAMessage,
  WASocket,
  useMultiFileAuthState,
  BaileysEventMap,
  MessageUpsertType,
  Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode';
import * as QRCode from 'qrcode-terminal';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

export interface WhatsAppBot {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
  getGroups(): Promise<any[]>;
  generateQR(): Promise<string>;
}

class WhatsAppBotImpl extends EventEmitter implements WhatsAppBot {
  public socket: WASocket | null = null;
  public qrCode: string | null = null;
  public isConnected: boolean = false;
  public connectionMethod: 'qr' | 'pin' | null = null;
  
  private logger = pino({ level: 'info' });
  private authDir = path.join(process.cwd(), 'auth_info');

  constructor() {
    super();
    // Crear directorio de autenticación si no existe
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    try {
      this.logger.info('🦈 Iniciando Gawr Gura Bot...');
      
      // Configurar autenticación multi-dispositivo
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      // Crear socket de WhatsApp
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: false, // No imprimir QR en terminal
        logger: this.logger,
        browser: Browsers.macOS('Desktop'),
        generateHighQualityLinkPreview: true,
      });

      // Eventos de conexión
      this.socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.logger.info('🔗 Código QR generado para escanear');
          
          // Generar QR code para la web
          try {
            this.qrCode = await qrcode.toDataURL(qr);
            // También mostrar en terminal para desarrollo
            QRCode.generate(qr, { small: true });
            
            this.emit('qr', this.qrCode);
            this.emit('status', {
              isConnected: false,
              connectionMethod: 'qr',
              qrCode: this.qrCode
            });
            
            this.logger.info('📱 Escanea el código QR desde la app de WhatsApp');
          } catch (error) {
            this.logger.error('Error generando QR:', error);
          }
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          this.logger.info('🔌 Conexión cerrada. Reconectando:', shouldReconnect);
          this.isConnected = false;
          this.connectionMethod = null;
          this.qrCode = null;
          
          this.emit('status', {
            isConnected: false,
            connectionMethod: null,
            qrCode: null
          });

          if (shouldReconnect) {
            setTimeout(() => this.start(), 3000);
          }
        } else if (connection === 'open') {
          this.logger.info('🦈 ¡Bot conectado exitosamente a WhatsApp!');
          this.isConnected = true;
          this.connectionMethod = 'qr';
          this.qrCode = null; // Limpiar QR una vez conectado
          
          this.emit('status', {
            isConnected: true,
            connectionMethod: 'qr',
            qrCode: null
          });

          // Obtener información del usuario
          const user = this.socket?.user;
          if (user) {
            this.logger.info(`📱 Conectado como: ${user.name} (+${user.id?.replace('@s.whatsapp.net', '')})`);
          }

          // Cargar grupos automáticamente
          await this.loadGroups();
        }
      });

      // Guardar credenciales automáticamente
      this.socket.ev.on('creds.update', saveCreds);

      // Manejar mensajes entrantes
      this.socket.ev.on('messages.upsert', async (messageUpdate) => {
        await this.handleMessage(messageUpdate);
      });

      this.logger.info('⏳ Esperando conexión o código QR...');

    } catch (error) {
      this.logger.error('Error iniciando bot:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.socket) {
        await this.socket.logout();
        this.socket = null;
      }
      this.isConnected = false;
      this.connectionMethod = null;
      this.qrCode = null;
      this.logger.info('🛑 Bot desconectado');
    } catch (error) {
      this.logger.error('Error deteniendo bot:', error);
      throw error;
    }
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Bot no está conectado');
    }

    try {
      await this.socket.sendMessage(to, { text: message });
      this.logger.info(`📤 Mensaje enviado a ${to}: ${message.substring(0, 50)}...`);
    } catch (error) {
      this.logger.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  async getGroups(): Promise<any[]> {
    if (!this.socket || !this.isConnected) {
      return [];
    }

    try {
      const groups = await this.socket.groupFetchAllParticipating();
      return Object.values(groups);
    } catch (error) {
      this.logger.error('Error obteniendo grupos:', error);
      return [];
    }
  }

  async generateQR(): Promise<string> {
    // Si ya hay un QR disponible, devolverlo
    if (this.qrCode) {
      return this.qrCode;
    }

    // Si ya está conectado, no necesita QR
    if (this.isConnected) {
      throw new Error('Bot ya está conectado a WhatsApp');
    }

    // Iniciar el proceso y esperar QR
    return new Promise(async (resolve, reject) => {
      try {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout esperando código QR'));
        }, 30000);

        // Configurar listeners antes de iniciar
        this.once('qr', (qrCode: string) => {
          clearTimeout(timeout);
          resolve(qrCode);
        });

        this.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        // Si no está iniciado, iniciar el bot
        if (!this.socket) {
          await this.start();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async loadGroups(): Promise<void> {
    try {
      const groups = await this.getGroups();
      this.logger.info(`📱 Conectado a ${groups.length} grupos`);
      
      // Emitir información de grupos para el dashboard
      const groupsInfo = groups.map(group => ({
        id: group.id,
        name: group.subject || 'Sin nombre',
        description: group.desc || '',
        memberCount: group.participants.length,
        isActive: true,
        avatar: '🦈',
        createdAt: group.creation ? new Date(group.creation * 1000) : new Date(),
        settings: {
          allowCommands: true,
          autoWelcome: true,
          antiSpam: false
        }
      }));

      this.emit('groups', groupsInfo);
    } catch (error) {
      this.logger.error('Error cargando grupos:', error);
    }
  }

  private async handleMessage(messageUpdate: any): Promise<void> {
    try {
      const { messages, type } = messageUpdate;
      
      if (type === 'notify') {
        for (const message of messages) {
          if (!message.message) continue;
          
          const messageContent = message.message.conversation || 
                               message.message.extendedTextMessage?.text || '';
          
          const from = message.key.remoteJid;
          const isFromMe = message.key.fromMe;
          
          // No procesar mensajes propios
          if (isFromMe) continue;
          
          this.logger.info(`📥 Mensaje de ${from}: ${messageContent}`);
          
          // Emitir para el dashboard
          this.emit('message', {
            id: message.key.id,
            from,
            content: messageContent,
            timestamp: message.messageTimestamp,
            isGroup: from?.endsWith('@g.us')
          });
          
          // Procesar comandos
          if (messageContent.startsWith('/')) {
            await this.handleCommand(from!, messageContent, message);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error procesando mensaje:', error);
    }
  }

  private async handleCommand(from: string, command: string, originalMessage: WAMessage): Promise<void> {
    if (!this.socket) return;
    
    try {
      // Importar sistema de comandos dinámicamente
      const commandsModule = await import('./plugins/commands.js');
      const { CommandManager, basicCommands } = commandsModule;
      const commandManager = new CommandManager();
      
      // Registrar comandos básicos
      basicCommands.forEach((cmd: any) => commandManager.registerCommand(cmd));
      
      await commandManager.executeCommand(this.socket, originalMessage, command);
    } catch (error) {
      this.logger.error('Error ejecutando comando:', error);
      await this.sendMessage(from, '🚨 Error procesando comando. Intenta de nuevo.');
    }
  }
}

// Instancia singleton del bot
const whatsappBot = new WhatsAppBotImpl();

export default whatsappBot;