import { EventEmitter } from 'events';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';
import { botConfig, isValidCommand, extractCommand, formatCommandList } from './bot-config';
import { logger } from './logger';

// Función para importar dinámicamente Baileys
async function importBaileys() {
  try {
    const baileys = await import('@whiskeysockets/baileys');
    return baileys;
  } catch (error) {
    console.error('Error importando Baileys:', error);
    throw error;
  }
}

export interface WorkingWhatsAppBot {
  isConnected: boolean;
  qrCode: string | null;
  connectionMethod: 'qr' | 'pin' | null;
  pairingCode: string | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getQRCode(): Promise<string>;
  requestPairingCode(phoneNumber: string): Promise<string>;
}

class WorkingWhatsAppBotImpl extends EventEmitter implements WorkingWhatsAppBot {
  public isConnected: boolean = false;
  public qrCode: string | null = null;
  public connectionMethod: 'qr' | 'pin' | null = null;
  public pairingCode: string | null = null;
  
  private socket: any = null;
  private baileys: any = null;
  private authDir = path.join(process.cwd(), 'auth_info');
  private pairingTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 segundos
  private isReconnecting = false;

  constructor() {
    super();
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Bot ya está conectado');
      return;
    }

    try {
      logger.botConnection('connecting');
      
      // Importar Baileys dinámicamente
      if (!this.baileys) {
        this.baileys = await importBaileys();
      }

      const { makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = this.baileys;
      
      // Configurar autenticación
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      // Crear socket
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Desactivar QR en terminal
        browser: Browsers.macOS(botConfig.botInfo.name),
        generateHighQualityLinkPreview: true,
        logger: pino({ level: 'silent' }), // Silenciar logs de Baileys
      });

      // Eventos de conexión
      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          logger.qrCode('Código QR generado');
          
          try {
            this.qrCode = await QRCode.toDataURL(qr);
            this.connectionMethod = 'qr';
            
            this.emit('qr_ready', {
              qrCode: this.qrCode,
              rawQR: qr
            });
            
            logger.success('QR listo para escanear');
          } catch (error) {
            logger.error('Error generando QR', error);
            this.emit('error', error);
          }
        }

        if (connection === 'close') {
          const boom = lastDisconnect?.error as any;
          const shouldReconnect = boom?.output?.statusCode !== DisconnectReason.loggedOut;
          
          logger.botConnection('disconnected', `Reconectar: ${shouldReconnect} - Error: ${boom?.message || 'Unknown'}`);
          console.log('Disconnect details:', {
            statusCode: boom?.output?.statusCode,
            message: boom?.message,
            stack: boom?.stack
          });
          
          this.isConnected = false;
          this.connectionMethod = null;
          this.qrCode = null;
          
          this.emit('connection_closed', { shouldReconnect });

          if (shouldReconnect && !this.isReconnecting) {
            this.scheduleReconnect();
          }
        } else if (connection === 'open') {
          logger.botConnection('connected');
          this.isConnected = true;
          this.connectionMethod = 'qr';
          this.qrCode = null;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          this.isReconnecting = false;
          
          const user = this.socket?.user;
          if (user) {
            logger.info(`Usuario conectado: ${user.name} (+${user.id?.replace('@s.whatsapp.net', '')})`);
          }
          
          this.emit('connected', { user });
        }
      });

      // Guardar credenciales
      this.socket.ev.on('creds.update', saveCreds);

      // Manejar mensajes
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
            
            logger.botMessage(from!, content, 'incoming');
            
            // Emitir evento completo para sincronización en tiempo real
            this.emit('message_received', {
              id: message.key.id || Date.now().toString(),
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

            // Si es comando, procesarlo
            if (isValidCommand(content)) {
              await this.handleCommand(from!, content, pushName, phone);
            }
          }
        }
      });

    } catch (error) {
      logger.error('Error conectando', error);
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
      logger.botConnection('disconnected');
    } catch (error) {
      logger.error('Error desconectando', error);
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

  async requestPairingCode(phoneNumber: string): Promise<string> {
    if (this.isConnected) {
      throw new Error('Bot ya está conectado');
    }

    // Validar formato del número de teléfono
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      throw new Error('Número de teléfono inválido');
    }

    try {
      logger.info(`Solicitando código de vinculación para ${cleanNumber}`);
      
      // Importar Baileys si no está disponible
      if (!this.baileys) {
        this.baileys = await importBaileys();
      }

      const { makeWASocket, useMultiFileAuthState } = this.baileys;
      
      // Configurar autenticación
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      const { Browsers } = this.baileys;
      
      // Crear socket temporal para obtener el código de vinculación
      const tempSocket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS(botConfig.botInfo.name),
        generateHighQualityLinkPreview: true,
      });

      return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          tempSocket.end();
          reject(new Error('Timeout solicitando código de vinculación'));
        }, botConfig.pairingConfig.timeout);

        // Solicitar código de vinculación directamente
        try {
          const code = await tempSocket.requestPairingCode(cleanNumber);
          clearTimeout(timeout);
          
          this.pairingCode = code;
          this.connectionMethod = 'pin';
          
          logger.pairingCode(code, cleanNumber);
          
          this.emit('pairing_code_ready', {
            pairingCode: code,
            phoneNumber: cleanNumber
          });
          
          // Configurar este socket como el principal para la conexión
          this.socket = tempSocket;
          
          // Configurar eventos para cuando se complete la vinculación
          tempSocket.ev.on('connection.update', (update: any) => {
            const { connection } = update;
            if (connection === 'open') {
              this.isConnected = true;
              this.connectionMethod = 'pin';
              this.qrCode = null;
              logger.botConnection('connected', 'Conectado via PIN');
              this.emit('connection_ready', { 
                user: { name: 'Usuario', id: cleanNumber },
                method: 'pin'
              });
            }
          });
          
          resolve(code);
        } catch (error) {
          clearTimeout(timeout);
          tempSocket.end();
          logger.error('Error obteniendo código de vinculación', error);
          reject(error);
        }

        // Iniciar el proceso de conexión
        tempSocket.ev.on('creds.update', saveCreds);
      });

    } catch (error) {
      logger.error('Error solicitando código de vinculación', error);
      throw error;
    }
  }

  private async handleCommand(from: string, commandText: string, senderName?: string, phone?: string): Promise<void> {
    if (!this.socket) return;

    const commandData = extractCommand(commandText);
    if (!commandData) return;

    const { command, args } = commandData;
    let response = '';
    
    const isGroup = from.endsWith('@g.us');
    const userId = phone || from.replace('@s.whatsapp.net', '');
    
    // Emitir evento antes del procesamiento
    this.emit('command_start', {
      command,
      args,
      from,
      userId,
      senderName: senderName || 'Usuario',
      isGroup,
      timestamp: new Date()
    });
    
    // Buscar comando principal o alias
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

        default:
          response = `🦈 Comando "${command}" no encontrado.\n💡 Usa /help para ver comandos disponibles.\n📝 Prefijos válidos: ${botConfig.prefixes.join(', ')}`;
      }
    } else {
      response = `🦈 Comando "${command}" no encontrado.\n💡 Usa /help para ver comandos disponibles.\n📝 Prefijos válidos: ${botConfig.prefixes.join(', ')}`;
    }

    if (response) {
      try {
        // Enviar respuesta
        await this.socket.sendMessage(from, { text: response });
        logger.botMessage(from, response, 'outgoing');
        
        // Emitir evento de comando ejecutado
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
        
        // Emitir evento de mensaje enviado
        this.emit('message_sent', {
          id: Date.now().toString(),
          groupId: isGroup ? from : null,
          userId: 'bot',
          content: response,
          messageType: 'command',
          isFromBot: true,
          timestamp: new Date(),
          metadata: { command, originalMessage: commandText }
        });
        
      } catch (error) {
        logger.error('Error enviando respuesta', error);
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

  private scheduleReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error(`Máximo número de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = this.reconnectInterval * this.reconnectAttempts; // Backoff exponencial
    logger.info(`Programando reconexión en ${delay / 1000} segundos (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        logger.info(`Iniciando reconexión (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        await this.connect();
      } catch (error) {
        logger.error('Error durante la reconexión', error);
        this.isReconnecting = false;
        // Programar siguiente intento si no se ha alcanzado el máximo
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  // Método para forzar reconexión manual
  public forceReconnect(): void {
    logger.info('Forzando reconexión manual del bot');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.scheduleReconnect();
  }

  // Auto-inicialización del bot al instanciar
  public async autoStart(): Promise<void> {
    try {
      logger.info('Iniciando bot automáticamente...');
      await this.connect();
    } catch (error) {
      logger.error('Error en auto-inicio, programando reconexión', error);
      this.scheduleReconnect();
    }
  }
}

const workingBot = new WorkingWhatsAppBotImpl();

// Auto-iniciar el bot cuando se importa el módulo
process.nextTick(() => {
  workingBot.autoStart().catch(error => {
    logger.error('Error en auto-inicio del bot', error);
  });
});

export default workingBot;