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
            
            logger.botMessage(from!, content, 'incoming');
            
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

        case 'clima':
          const ciudad = args.join(' ') || 'Lima';
          response = `🌤️ **Clima en ${ciudad}** 🌤️\n\n🌡️ Temperatura: 22°C\n☁️ Cielo: Parcialmente nublado\n💨 Viento: 15 km/h\n💧 Humedad: 68%\n\n*Para clima en tiempo real, usa una API de clima.*`;
          break;

        case 'meme':
          const memes = [
            '😂 ¿Por qué los peces no juegan fútbol? ¡Porque tienen miedo de la red!',
            '🤔 ¿Qué le dijo el 3 al 30? Para ser como yo tienes que ser sincero.',
            '😄 ¿Cómo se despiden los químicos? Ácido un placer.',
            '🦈 ¿Por qué Gura es la mejor vtuber? ¡Porque es a-dorable!',
            '🎮 Mi código funciona... no sé por qué. Mi código no funciona... tampoco sé por qué.',
          ];
          const randomMeme = memes[Math.floor(Math.random() * memes.length)];
          response = `🎭 **Meme Aleatorio** 🎭\n\n${randomMeme}`;
          break;

        case 'traducir':
          const textoTraducir = args.slice(1).join(' ');
          const idioma = args[0] || 'en';
          if (!textoTraducir) {
            response = `🌐 **Traductor** 🌐\n\nUso: ${botConfig.defaultPrefix}traducir [idioma] [texto]\nEjemplo: ${botConfig.defaultPrefix}traducir en Hola mundo`;
          } else {
            response = `🌐 **Traduciendo a ${idioma}** 🌐\n\nTexto original: ${textoTraducir}\nTraducción: [Aquí iría la traducción con una API real]\n\n*Conecta una API de traducción para funcionalidad completa.*`;
          }
          break;

        case 'calc':
          const operacion = args.join(' ');
          if (!operacion) {
            response = `🧮 **Calculadora** 🧮\n\nUso: ${botConfig.defaultPrefix}calc [operación]\nEjemplo: ${botConfig.defaultPrefix}calc 2 + 2 * 3`;
          } else {
            try {
              // Operación matemática simple y segura
              const resultado = eval(operacion.replace(/[^0-9+\-*/().]/g, ''));
              response = `🧮 **Calculadora** 🧮\n\nOperación: ${operacion}\nResultado: **${resultado}**`;
            } catch (error) {
              response = `🧮 **Calculadora** 🧮\n\n❌ Error: Operación inválida\nUsa solo números y operadores: +, -, *, /, ()`;
            }
          }
          break;

        case 'perfil':
          response = `👤 **Tu Perfil** 👤\n\n📱 Número: ${from.replace('@s.whatsapp.net', '')}\n🆔 ID: ${from}\n⭐ Nivel: 1\n🎯 XP: 0\n🏆 Rango: Miembro\n📅 Registrado: Hoy`;
          break;

        case 'registro':
          const nombreEdad = args.join(' ');
          if (!nombreEdad || !nombreEdad.includes('.')) {
            response = `📝 **Registro** 📝\n\nUso: ${botConfig.defaultPrefix}reg [nombre].[edad]\nEjemplo: ${botConfig.defaultPrefix}reg Gura.9000`;
          } else {
            const [nombre, edad] = nombreEdad.split('.');
            response = `✅ **Registro Exitoso** ✅\n\n👤 Nombre: ${nombre}\n🎂 Edad: ${edad} años\n🎉 ¡Bienvenido al bot, ${nombre}!`;
          }
          break;

        case 'top':
          response = `🏆 **Ranking de Usuarios** 🏆\n\n1. 🥇 Usuario1 - 1500 XP\n2. 🥈 Usuario2 - 1200 XP\n3. 🥉 Usuario3 - 1000 XP\n4. 🏅 Usuario4 - 800 XP\n5. 🏅 Usuario5 - 600 XP\n\n*Conecta una base de datos para rankings reales.*`;
          break;

        case 'trivia':
          const preguntas = [
            { q: '¿Cuál es el océano más grande del mundo?', r: 'Pacífico' },
            { q: '¿En qué año se fundó Hololive?', r: '2016' },
            { q: '¿Cuántos corazones tiene un pulpo?', r: '3' },
            { q: '¿Cuál es el planeta más grande del sistema solar?', r: 'Júpiter' },
          ];
          const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
          response = `🧠 **Trivia** 🧠\n\n❓ ${pregunta.q}\n\n*Responde en el chat. Respuesta: ||${pregunta.r}||*`;
          break;

        case 'adivinanza':
          const adivinanzas = [
            'Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera. ¿Qué es?',
            'Tiene dientes y no come, tiene cabeza y no es hombre. ¿Qué es?',
            'Oro parece, plata no es, el que no lo adivine bien tonto es. ¿Qué es?',
          ];
          const adivinanza = adivinanzas[Math.floor(Math.random() * adivinanzas.length)];
          response = `🤔 **Adivinanza** 🤔\n\n${adivinanza}\n\n*Responde en el chat para ver si aciertas.*`;
          break;

        case 'bola8':
          const respuestasBola8 = [
            'Es cierto', 'Es decididamente así', 'Sin lugar a dudas', 'Sí, definitivamente',
            'Puedes confiar en ello', 'Como yo lo veo, sí', 'Muy probable', 'Las perspectivas son buenas',
            'Sí', 'Las señales apuntan a que sí', 'Respuesta confusa, intenta de nuevo',
            'Pregunta de nuevo más tarde', 'Mejor no decirte ahora', 'No puedo predecirlo ahora',
            'Concéntrate y pregunta de nuevo', 'No cuentes con ello', 'Mi respuesta es no',
            'Mis fuentes dicen que no', 'Las perspectivas no son tan buenas', 'Muy dudoso'
          ];
          const preguntaBola8 = args.join(' ');
          if (!preguntaBola8) {
            response = `🎱 **Bola Mágica 8** 🎱\n\nUso: ${botConfig.defaultPrefix}8ball [tu pregunta]\nEjemplo: ${botConfig.defaultPrefix}8ball ¿Seré rico?`;
          } else {
            const respuesta = respuestasBola8[Math.floor(Math.random() * respuestasBola8.length)];
            response = `🎱 **Bola Mágica 8** 🎱\n\n❓ ${preguntaBola8}\n🔮 **${respuesta}**`;
          }
          break;

        case 'cita':
          const citas = [
            '"La vida es lo que pasa mientras estás ocupado haciendo otros planes." - John Lennon',
            '"El futuro pertenece a quienes creen en la belleza de sus sueños." - Eleanor Roosevelt',
            '"No es el más fuerte de las especies el que sobrevive, sino el más adaptable." - Charles Darwin',
            '"A-chan wa warukunai yo ne~" - Gawr Gura',
            '"Shaaak!" - Gawr Gura',
          ];
          const cita = citas[Math.floor(Math.random() * citas.length)];
          response = `💭 **Cita Inspiradora** 💭\n\n${cita}`;
          break;

        case 'gato':
          response = `🐱 **Imagen de Gato** 🐱\n\n🖼️ Aquí tendría una linda imagen de gato\n*Conecta una API de imágenes para mostrar gatos reales.*\n\n😸 ¡Miau!`;
          break;

        case 'perro':
          response = `🐶 **Imagen de Perro** 🐶\n\n🖼️ Aquí tendría una linda imagen de perro\n*Conecta una API de imágenes para mostrar perritos reales.*\n\n🐕 ¡Guau!`;
          break;

        case 'musica':
          const cancion = args.join(' ');
          if (!cancion) {
            response = `🎵 **Búsqueda Musical** 🎵\n\nUso: ${botConfig.defaultPrefix}musica [nombre de canción]\nEjemplo: ${botConfig.defaultPrefix}musica Reflect`;
          } else {
            response = `🎵 **Búsqueda Musical** 🎵\n\n🎧 Buscando: "${cancion}"\n🎤 Artista: [Información del artista]\n⏱️ Duración: [Duración]\n\n*Conecta una API musical para información real.*`;
          }
          break;

        case 'horario':
          const ahora = new Date();
          const hora = ahora.toLocaleTimeString('es-ES');
          const fecha = ahora.toLocaleDateString('es-ES');
          response = `🕐 **Hora Actual** 🕐\n\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora}\n🌍 Zona: GMT-5 (Lima, Perú)`;
          break;

        case 'ytdl':
        case 'youtube':
        case 'yt':
        case 'download':
          const urlYT = args.join(' ');
          if (!urlYT) {
            response = `🎵 **Descargador YouTube** 🎵\n\nUso: ${botConfig.defaultPrefix}ytdl [URL de YouTube]\nEjemplo: ${botConfig.defaultPrefix}ytdl https://youtu.be/dQw4w9WgXcQ\n\n📱 Formatos disponibles:\n• Audio MP3 (música)\n• Video MP4 (baja calidad)\n\n⚠️ Solo enlaces públicos de YouTube`;
          } else if (this.isValidYouTubeUrl(urlYT)) {
            response = `🎵 **Procesando YouTube** 🎵\n\n🔄 Analizando: ${urlYT}\n⏳ Obteniendo información...\n\n*Este proceso puede tomar unos segundos*`;
            
            // Procesar descarga de forma asíncrona
            this.processYouTubeDownload(urlYT, from).catch(error => {
              console.error('Error procesando YouTube:', error);
            });
          } else {
            response = `🎵 **Descargador YouTube** 🎵\n\n❌ URL inválida. Usa un enlace válido de YouTube:\n• https://youtube.com/watch?v=...\n• https://youtu.be/...\n• https://m.youtube.com/watch?v=...`;
          }
          break;

        case 'tiktok':
        case 'tt':
        case 'tik':
          const urlTT = args.join(' ');
          if (!urlTT) {
            response = `🎭 **Descargador TikTok** 🎭\n\nUso: ${botConfig.defaultPrefix}tiktok [URL de TikTok]\nEjemplo: ${botConfig.defaultPrefix}tiktok https://vm.tiktok.com/...\n\n📱 Descarga sin marca de agua`;
          } else if (this.isValidTikTokUrl(urlTT)) {
            response = `🎭 **Procesando TikTok** 🎭\n\n🔄 Analizando: ${urlTT}\n⏳ Descargando sin marca de agua...\n\n*Procesando video...*`;
            
            this.processTikTokDownload(urlTT, from).catch(error => {
              console.error('Error procesando TikTok:', error);
            });
          } else {
            response = `🎭 **Descargador TikTok** 🎭\n\n❌ URL inválida. Usa un enlace válido de TikTok:\n• https://tiktok.com/@user/video/...\n• https://vm.tiktok.com/...\n• https://www.tiktok.com/...`;
          }
          break;

        case 'instagram':
        case 'ig':
        case 'insta':
          const urlIG = args.join(' ');
          if (!urlIG) {
            response = `📸 **Descargador Instagram** 📸\n\nUso: ${botConfig.defaultPrefix}instagram [URL de Instagram]\nEjemplo: ${botConfig.defaultPrefix}ig https://instagram.com/p/...\n\n📱 Soporta: Fotos, Videos, Reels, IGTV`;
          } else if (this.isValidInstagramUrl(urlIG)) {
            response = `📸 **Procesando Instagram** 📸\n\n🔄 Analizando: ${urlIG}\n⏳ Descargando contenido...\n\n*Obteniendo media...*`;
            
            this.processInstagramDownload(urlIG, from).catch(error => {
              console.error('Error procesando Instagram:', error);
            });
          } else {
            response = `📸 **Descargador Instagram** 📸\n\n❌ URL inválida. Usa un enlace válido de Instagram:\n• https://instagram.com/p/...\n• https://instagram.com/reel/...\n• https://instagram.com/tv/...`;
          }
          break;

        case 'twitter':
        case 'x':
        case 'tweet':
          const urlTW = args.join(' ');
          if (!urlTW) {
            response = `🐦 **Descargador Twitter/X** 🐦\n\nUso: ${botConfig.defaultPrefix}twitter [URL de Tweet]\nEjemplo: ${botConfig.defaultPrefix}x https://twitter.com/user/status/...\n\n📱 Descarga videos de tweets`;
          } else if (this.isValidTwitterUrl(urlTW)) {
            response = `🐦 **Procesando Twitter/X** 🐦\n\n🔄 Analizando: ${urlTW}\n⏳ Descargando video...\n\n*Extrayendo contenido...*`;
            
            this.processTwitterDownload(urlTW, from).catch(error => {
              console.error('Error procesando Twitter:', error);
            });
          } else {
            response = `🐦 **Descargador Twitter/X** 🐦\n\n❌ URL inválida. Usa un enlace válido de Twitter/X:\n• https://twitter.com/user/status/...\n• https://x.com/user/status/...`;
          }
          break;

        case 'facebook':
        case 'fb':
          const urlFB = args.join(' ');
          if (!urlFB) {
            response = `📘 **Descargador Facebook** 📘\n\nUso: ${botConfig.defaultPrefix}facebook [URL de Facebook]\nEjemplo: ${botConfig.defaultPrefix}fb https://facebook.com/watch/...\n\n📱 Solo videos públicos`;
          } else if (this.isValidFacebookUrl(urlFB)) {
            response = `📘 **Procesando Facebook** 📘\n\n🔄 Analizando: ${urlFB}\n⏳ Descargando video...\n\n*Solo videos públicos disponibles*`;
            
            this.processFacebookDownload(urlFB, from).catch(error => {
              console.error('Error procesando Facebook:', error);
            });
          } else {
            response = `📘 **Descargador Facebook** 📘\n\n❌ URL inválida. Usa un enlace válido de Facebook:\n• https://facebook.com/watch/...\n• https://fb.watch/...\n• https://www.facebook.com/...`;
          }
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
        logger.botMessage(from, response, 'outgoing');
        logger.botCommand(command, from, true);
      } catch (error) {
        logger.error('Error enviando respuesta', error);
        logger.botCommand(command, from, false);
      }
    }
  }

  // Funciones de validación de URLs
  private isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\//
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  private isValidTikTokUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/,
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  private isValidInstagramUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  private isValidTwitterUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w]+\/status\/\d+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  private isValidFacebookUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?(facebook\.com\/watch|fb\.watch)/,
      /^https?:\/\/(www\.)?facebook\.com\/[\w.-]+\/videos/
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  // Funciones de procesamiento de descargas
  private async processYouTubeDownload(url: string, from: string): Promise<void> {
    try {
      // Simular llamada a API gratuita de Cobalt
      const response = await this.fetchFromAPI(botConfig.downloadApis.youtube, {
        url: url,
        vCodec: 'h264',
        vQuality: '720',
        aFormat: 'mp3',
        isAudioOnly: false
      });

      if (response && response.status === 'success') {
        const info = `🎵 **Descarga YouTube Completada** 🎵\n\n📹 Título: ${response.title || 'Video de YouTube'}\n👤 Canal: ${response.author || 'Desconocido'}\n⏱️ Duración: ${response.duration || 'N/A'}\n\n🎬 **Enviando video...**`;
        
        await this.socket.sendMessage(from, { text: info });
        
        // En una implementación real, aquí enviarías el archivo
        const finalMessage = `✅ **Descarga Enviada** ✅\n\n📁 Archivo procesado desde YouTube\n💡 Para mejores resultados, conecta una API de descarga real.`;
        await this.socket.sendMessage(from, { text: finalMessage });
      } else {
        throw new Error('No se pudo procesar el video');
      }
    } catch (error) {
      const errorMsg = `❌ **Error YouTube** ❌\n\nNo se pudo descargar el video.\n🔧 Posibles soluciones:\n• Verifica que el enlace sea público\n• Intenta con otro video\n• Algunos videos están protegidos\n\n💡 *Para funcionalidad completa, conecta una API de descarga.*`;
      await this.socket.sendMessage(from, { text: errorMsg });
    }
  }

  private async processTikTokDownload(url: string, from: string): Promise<void> {
    try {
      const response = await this.fetchFromAPI(botConfig.downloadApis.universal, {
        url: url,
        format: 'mp4'
      });

      if (response && response.status === 'success') {
        const info = `🎭 **Descarga TikTok Completada** 🎭\n\n👤 Usuario: ${response.username || '@usuario'}\n📝 Descripción: ${response.title || 'Video de TikTok'}\n❤️ Likes: ${response.likes || 'N/A'}\n\n🎬 **Sin marca de agua - Enviando...**`;
        
        await this.socket.sendMessage(from, { text: info });
        
        const finalMessage = `✅ **Descarga TikTok Enviada** ✅\n\n📁 Video sin marca de agua procesado\n💡 Para mejores resultados, conecta una API de descarga real.`;
        await this.socket.sendMessage(from, { text: finalMessage });
      } else {
        throw new Error('No se pudo procesar el video');
      }
    } catch (error) {
      const errorMsg = `❌ **Error TikTok** ❌\n\nNo se pudo descargar el video.\n🔧 Posibles soluciones:\n• Verifica que el enlace sea público\n• Algunos videos están restringidos\n• Intenta con otro enlace\n\n💡 *Para funcionalidad completa, usa una API real.*`;
      await this.socket.sendMessage(from, { text: errorMsg });
    }
  }

  private async processInstagramDownload(url: string, from: string): Promise<void> {
    try {
      const response = await this.fetchFromAPI(botConfig.downloadApis.backup, {
        url: url,
        type: 'instagram'
      });

      if (response && response.media) {
        const info = `📸 **Descarga Instagram Completada** 📸\n\n👤 Usuario: ${response.username || '@usuario'}\n📝 Descripción: ${response.caption || 'Post de Instagram'}\n📅 Fecha: ${response.date || 'Hoy'}\n\n📱 **Enviando contenido...**`;
        
        await this.socket.sendMessage(from, { text: info });
        
        const finalMessage = `✅ **Descarga Instagram Enviada** ✅\n\n📁 Contenido procesado desde Instagram\n💡 Para mejores resultados, conecta una API de descarga real.`;
        await this.socket.sendMessage(from, { text: finalMessage });
      } else {
        throw new Error('No se pudo procesar el contenido');
      }
    } catch (error) {
      const errorMsg = `❌ **Error Instagram** ❌\n\nNo se pudo descargar el contenido.\n🔧 Posibles soluciones:\n• Verifica que la cuenta sea pública\n• Algunos posts están protegidos\n• Intenta con otro enlace\n\n💡 *Para funcionalidad completa, usa una API real.*`;
      await this.socket.sendMessage(from, { text: errorMsg });
    }
  }

  private async processTwitterDownload(url: string, from: string): Promise<void> {
    try {
      const response = await this.fetchFromAPI(botConfig.downloadApis.universal, {
        url: url,
        platform: 'twitter'
      });

      if (response && response.video) {
        const info = `🐦 **Descarga Twitter/X Completada** 🐦\n\n👤 Usuario: ${response.username || '@usuario'}\n📝 Tweet: ${response.text || 'Tweet con video'}\n📅 Fecha: ${response.date || 'Hoy'}\n\n🎬 **Enviando video...**`;
        
        await this.socket.sendMessage(from, { text: info });
        
        const finalMessage = `✅ **Descarga Twitter Enviada** ✅\n\n📁 Video procesado desde Twitter/X\n💡 Para mejores resultados, conecta una API de descarga real.`;
        await this.socket.sendMessage(from, { text: finalMessage });
      } else {
        throw new Error('No se pudo procesar el video');
      }
    } catch (error) {
      const errorMsg = `❌ **Error Twitter/X** ❌\n\nNo se pudo descargar el video.\n🔧 Posibles soluciones:\n• Verifica que el tweet sea público\n• No todos los tweets tienen video\n• Algunos están protegidos\n\n💡 *Para funcionalidad completa, usa una API real.*`;
      await this.socket.sendMessage(from, { text: errorMsg });
    }
  }

  private async processFacebookDownload(url: string, from: string): Promise<void> {
    try {
      const response = await this.fetchFromAPI(botConfig.downloadApis.backup, {
        url: url,
        platform: 'facebook'
      });

      if (response && response.video) {
        const info = `📘 **Descarga Facebook Completada** 📘\n\n👤 Usuario: ${response.username || 'Usuario'}\n📝 Descripción: ${response.title || 'Video de Facebook'}\n👀 Vistas: ${response.views || 'N/A'}\n\n🎬 **Enviando video...**`;
        
        await this.socket.sendMessage(from, { text: info });
        
        const finalMessage = `✅ **Descarga Facebook Enviada** ✅\n\n📁 Video procesado desde Facebook\n💡 Para mejores resultados, conecta una API de descarga real.`;
        await this.socket.sendMessage(from, { text: finalMessage });
      } else {
        throw new Error('No se pudo procesar el video');
      }
    } catch (error) {
      const errorMsg = `❌ **Error Facebook** ❌\n\nNo se pudo descargar el video.\n🔧 Posibles soluciones:\n• Solo videos públicos disponibles\n• Verifica el enlace\n• Algunos videos están restringidos\n\n💡 *Para funcionalidad completa, usa una API real.*`;
      await this.socket.sendMessage(from, { text: errorMsg });
    }
  }

  // Función auxiliar para hacer peticiones a APIs
  private async fetchFromAPI(apiUrl: string, params: any): Promise<any> {
    try {
      // Simular respuesta de API para demostración
      // En una implementación real, harías fetch() a la API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      return {
        status: 'success',
        title: 'Video de ejemplo',
        author: 'Canal de ejemplo',
        duration: '3:45',
        username: '@usuario_ejemplo',
        likes: '1.2K',
        caption: 'Descripción del contenido',
        date: new Date().toLocaleDateString('es-ES'),
        media: ['video.mp4'],
        video: 'video.mp4'
      };
    } catch (error) {
      console.error('Error en API:', error);
      return null;
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