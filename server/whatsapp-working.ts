import { EventEmitter } from 'events';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { botConfig, isValidCommand, extractCommand, formatCommandList } from './bot-config';

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
      console.log('🦈 Conectando a WhatsApp...');
      
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
        printQRInTerminal: true,
        browser: Browsers.macOS(botConfig.botInfo.name),
        generateHighQualityLinkPreview: true,
      });

      // Eventos de conexión
      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('📱 Código QR generado');
          
          try {
            this.qrCode = await QRCode.toDataURL(qr);
            this.connectionMethod = 'qr';
            
            this.emit('qr_ready', {
              qrCode: this.qrCode,
              rawQR: qr
            });
            
            console.log('✅ QR listo para escanear');
          } catch (error) {
            console.error('Error generando QR:', error);
            this.emit('error', error);
          }
        }

        if (connection === 'close') {
          const boom = lastDisconnect?.error as any;
          const shouldReconnect = boom?.output?.statusCode !== DisconnectReason.loggedOut;
          
          console.log(`🔌 Conexión cerrada. Reconectar: ${shouldReconnect}`);
          this.isConnected = false;
          this.connectionMethod = null;
          this.qrCode = null;
          
          this.emit('connection_closed', { shouldReconnect });

          if (shouldReconnect) {
            setTimeout(() => this.connect(), 3000);
          }
        } else if (connection === 'open') {
          console.log('🦈 ¡Conectado exitosamente a WhatsApp!');
          this.isConnected = true;
          this.connectionMethod = 'qr';
          this.qrCode = null;
          
          const user = this.socket?.user;
          if (user) {
            console.log(`📱 Usuario: ${user.name} (+${user.id?.replace('@s.whatsapp.net', '')})`);
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
            
            console.log(`📥 Mensaje de ${from}: ${content}`);
            
            this.emit('message_received', {
              from,
              content,
              message,
              isGroup: from?.endsWith('@g.us')
            });

            // Procesar comandos con cualquier prefijo válido
            if (isValidCommand(content)) {
              await this.handleCommand(from!, content);
            }
          }
        }
      });

    } catch (error) {
      console.error('Error conectando:', error);
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
      console.log('🛑 Desconectado de WhatsApp');
    } catch (error) {
      console.error('Error desconectando:', error);
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
      console.log(`🔗 Solicitando código de vinculación para ${cleanNumber}`);
      
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

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          tempSocket.end();
          reject(new Error('Timeout solicitando código de vinculación'));
        }, botConfig.pairingConfig.timeout);

        tempSocket.ev.on('connection.update', async (update: any) => {
          const { connection, lastDisconnect } = update;
          
          if (connection === 'close') {
            clearTimeout(timeout);
            tempSocket.end();
            
            const boom = lastDisconnect?.error as any;
            if (boom?.output?.statusCode === 428) {
              // Código 428 indica que necesitamos vinculación
              try {
                const code = await tempSocket.requestPairingCode(cleanNumber);
                this.pairingCode = code;
                this.connectionMethod = 'pin';
                
                console.log(`📱 Código de vinculación generado: ${code}`);
                
                this.emit('pairing_code_ready', {
                  pairingCode: code,
                  phoneNumber: cleanNumber
                });
                
                resolve(code);
              } catch (error) {
                console.error('Error obteniendo código de vinculación:', error);
                reject(error);
              }
            } else {
              reject(new Error('No se pudo generar código de vinculación'));
            }
          }
        });

        // Iniciar el proceso de conexión
        tempSocket.ev.on('creds.update', saveCreds);
      });

    } catch (error) {
      console.error('Error solicitando código de vinculación:', error);
      throw error;
    }
  }

  private async handleCommand(from: string, commandText: string): Promise<void> {
    if (!this.socket) return;

    const commandData = extractCommand(commandText);
    if (!commandData) return;

    const { command, args } = commandData;
    let response = '';
    
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

        default:
          response = `🦈 Comando "${command}" encontrado pero no implementado aún.`;
      }
    } else {
      const availablePrefixes = botConfig.prefixes.join(', ');
      response = `🦈 Comando "${command}" no encontrado.\n\n💡 Usa ${botConfig.defaultPrefix}help para ver comandos disponibles.\n📝 Prefijos válidos: ${availablePrefixes}`;
    }

    if (response) {
      try {
        await this.socket.sendMessage(from, { text: response });
        console.log(`📤 Respuesta enviada a ${from}`);
      } catch (error) {
        console.error('Error enviando respuesta:', error);
      }
    }
  }
}

const workingBot = new WorkingWhatsAppBotImpl();
export default workingBot;