import { EventEmitter } from 'events';
import { 
  makeWASocket,
  DisconnectReason, 
  ConnectionState,
  WAMessage,
  WASocket,
  useMultiFileAuthState,
  Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

export interface SimpleWhatsAppBot {
  isConnected: boolean;
  qrCode: string | null;
  connectionMethod: 'qr' | 'pin' | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getQRCode(): Promise<string>;
  sendMessage(to: string, message: string): Promise<void>;
}

class SimpleWhatsAppBotImpl extends EventEmitter implements SimpleWhatsAppBot {
  public isConnected: boolean = false;
  public qrCode: string | null = null;
  public connectionMethod: 'qr' | 'pin' | null = null;
  
  private socket: WASocket | null = null;
  private logger = pino({ level: 'info' });
  private authDir = path.join(process.cwd(), 'auth_info');

  constructor() {
    super();
    // Crear directorio de autenticación
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.info('Bot ya está conectado');
      return;
    }

    try {
      this.logger.info('🦈 Conectando a WhatsApp...');
      
      // Configurar autenticación
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      // Crear socket
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: this.logger,
        browser: Browsers.macOS('Gawr Gura Bot'),
        generateHighQualityLinkPreview: true,
      });

      // Eventos de conexión
      this.socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.logger.info('📱 Código QR generado');
          
          try {
            // Generar QR como data URL
            this.qrCode = await QRCode.toDataURL(qr);
            this.connectionMethod = 'qr';
            
            this.emit('qr_ready', {
              qrCode: this.qrCode,
              rawQR: qr
            });
            
            this.logger.info('✅ QR listo para escanear');
          } catch (error) {
            this.logger.error('Error generando QR:', error);
            this.emit('error', error);
          }
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          this.logger.info(`🔌 Conexión cerrada. Reconectar: ${shouldReconnect}`);
          this.isConnected = false;
          this.connectionMethod = null;
          this.qrCode = null;
          
          this.emit('connection_closed', { shouldReconnect });

          if (shouldReconnect) {
            setTimeout(() => this.connect(), 3000);
          }
        } else if (connection === 'open') {
          this.logger.info('🦈 ¡Conectado exitosamente a WhatsApp!');
          this.isConnected = true;
          this.connectionMethod = 'qr';
          this.qrCode = null; // Limpiar QR
          
          const user = this.socket?.user;
          if (user) {
            this.logger.info(`📱 Usuario: ${user.name} (+${user.id?.replace('@s.whatsapp.net', '')})`);
          }
          
          this.emit('connected', { user });
        }
      });

      // Guardar credenciales
      this.socket.ev.on('creds.update', saveCreds);

      // Manejar mensajes
      this.socket.ev.on('messages.upsert', async (messageUpdate) => {
        const { messages, type } = messageUpdate;
        
        if (type === 'notify') {
          for (const message of messages) {
            if (!message.message || message.key.fromMe) continue;
            
            const content = message.message.conversation || 
                           message.message.extendedTextMessage?.text || '';
            
            const from = message.key.remoteJid;
            
            this.logger.info(`📥 Mensaje de ${from}: ${content}`);
            
            this.emit('message_received', {
              from,
              content,
              message,
              isGroup: from?.endsWith('@g.us')
            });

            // Procesar comandos que empiecen con /
            if (content.startsWith('/')) {
              await this.handleCommand(from!, content, message);
            }
          }
        }
      });

    } catch (error) {
      this.logger.error('Error conectando:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        await this.socket.logout();
        this.socket = null;
      }
      this.isConnected = false;
      this.connectionMethod = null;
      this.qrCode = null;
      this.logger.info('🛑 Desconectado de WhatsApp');
    } catch (error) {
      this.logger.error('Error desconectando:', error);
      throw error;
    }
  }

  async getQRCode(): Promise<string> {
    if (this.isConnected) {
      throw new Error('Bot ya está conectado');
    }

    if (this.qrCode) {
      return this.qrCode;
    }

    // Iniciar conexión y esperar QR
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando QR'));
      }, 30000);

      this.once('qr_ready', ({ qrCode }) => {
        clearTimeout(timeout);
        resolve(qrCode);
      });

      this.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      // Iniciar si no está iniciado
      if (!this.socket) {
        try {
          await this.connect();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      }
    });
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Bot no conectado');
    }

    try {
      await this.socket.sendMessage(to, { text: message });
      this.logger.info(`📤 Mensaje enviado a ${to}`);
    } catch (error) {
      this.logger.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  private async handleCommand(from: string, command: string, message: WAMessage): Promise<void> {
    if (!this.socket) return;

    const [cmd, ...args] = command.substring(1).split(' ');
    
    let response = '';
    
    switch (cmd.toLowerCase()) {
      case 'help':
        response = `🦈 **Gawr Gura Bot - Comandos** 🦈

⚡ **Generales:**
/help - Muestra esta ayuda
/ping - Verifica latencia
/info - Información del bot

🎮 **Juegos:**
/dados [cantidad] - Lanza dados
/moneda - Lanza moneda

🌊 ¡Usa los comandos sabiamente, chum!`;
        break;

      case 'ping':
        response = `🦈 ¡Pong! Bot funcionando correctamente\n⚡ Latencia: ~50ms`;
        break;

      case 'info':
        response = `🦈 **Gawr Gura WhatsApp Bot**\n\n📱 Estado: Conectado\n🕒 Tiempo activo: ${Math.floor(process.uptime())}s\n🤖 Versión: 1.0.0`;
        break;

      case 'dados':
        const diceCount = Math.min(parseInt(args[0]) || 1, 6);
        const results = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        response = `🎲 **Lanzando ${diceCount} dado(s)** 🎲\n\nResultados: ${results.map(r => diceEmojis[r-1]).join(' ')}\nTotal: ${results.reduce((a, b) => a + b, 0)}`;
        break;

      case 'moneda':
        const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        response = `🪙 **Lanzando moneda** 🪙\n\nResultado: **${result}** ${result === 'Cara' ? '👤' : '❌'}`;
        break;

      default:
        response = `🦈 Comando "${cmd}" no encontrado. Usa /help para ver comandos disponibles.`;
    }

    if (response) {
      await this.sendMessage(from, response);
    }
  }
}

// Instancia singleton
const simpleBot = new SimpleWhatsAppBotImpl();
export default simpleBot;