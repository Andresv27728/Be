import { WAMessage, WASocket } from '@whiskeysockets/baileys';

export interface CommandHandler {
  name: string;
  description: string;
  category: 'general' | 'games' | 'admin' | 'fun';
  adminOnly?: boolean;
  handler: (socket: WASocket, message: WAMessage, args: string[]) => Promise<void>;
}

export class CommandManager {
  private commands = new Map<string, CommandHandler>();

  registerCommand(command: CommandHandler) {
    this.commands.set(command.name, command);
  }

  async executeCommand(socket: WASocket, message: WAMessage, commandText: string) {
    const [commandName, ...args] = commandText.substring(1).split(' ');
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      await socket.sendMessage(message.key.remoteJid!, {
        text: `🦈 Comando "${commandName}" no encontrado. Usa /help para ver todos los comandos.`
      });
      return;
    }

    try {
      await command.handler(socket, message, args);
    } catch (error) {
      console.error(`Error ejecutando comando ${commandName}:`, error);
      await socket.sendMessage(message.key.remoteJid!, {
        text: `🚨 Error ejecutando comando: ${error}`
      });
    }
  }

  getCommands(): CommandHandler[] {
    return Array.from(this.commands.values());
  }

  getCommandsByCategory(category: string): CommandHandler[] {
    return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
  }
}

// Comandos básicos
export const basicCommands: CommandHandler[] = [
  {
    name: 'help',
    description: 'Muestra ayuda de comandos',
    category: 'general',
    handler: async (socket, message, args) => {
      const helpText = `🦈 **Gawr Gura Bot - Comandos** 🦈

⚡ **Generales:**
/help - Muestra esta ayuda
/ping - Verifica latencia
/level - Ve tu nivel actual
/sticker [nombre] - Genera stickers

🎮 **Juegos:**
/trivia [tema] - Inicia trivia
/dados [cantidad] - Lanza dados
/adivinanza - Juego de adivinanzas

👥 **Admin (Solo administradores):**
/kick [@usuario] - Expulsa usuario
/warn [@usuario] - Advierte usuario
/mute [@usuario] - Silencia usuario

🌊 ¡Úsalos sabiamente, chum!`;

      await socket.sendMessage(message.key.remoteJid!, { text: helpText });
    }
  },

  {
    name: 'ping',
    description: 'Verifica la latencia del bot',
    category: 'general',
    handler: async (socket, message, args) => {
      const start = Date.now();
      await socket.sendMessage(message.key.remoteJid!, {
        text: `🦈 Pong! Latencia: ${Date.now() - start}ms\n¡Estoy nadando a toda velocidad!`
      });
    }
  },

  {
    name: 'level',
    description: 'Muestra tu nivel actual',
    category: 'general',
    handler: async (socket, message, args) => {
      const level = Math.floor(Math.random() * 10) + 1;
      const xp = Math.floor(Math.random() * 1000) + 500;
      const maxXp = Math.floor(Math.random() * 500) + 1500;
      
      await socket.sendMessage(message.key.remoteJid!, {
        text: `🦈 **Tu Nivel Actual** 🌟\n\nNivel: ${level}\nExperiencia: ${xp}/${maxXp} XP\n\n¡Sigue chateando para subir de nivel, chum!`
      });
    }
  },

  {
    name: 'dados',
    description: 'Lanza dados',
    category: 'games',
    handler: async (socket, message, args) => {
      const diceCount = Math.min(parseInt(args[0]) || 1, 6);
      const results = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      
      const resultText = `🎲 **Lanzando ${diceCount} dado(s)** 🎲\n\nResultados: ${results.map(r => diceEmojis[r-1]).join(' ')}\nTotal: ${results.reduce((a, b) => a + b, 0)}`;
      
      await socket.sendMessage(message.key.remoteJid!, { text: resultText });
    }
  },

  {
    name: 'trivia',
    description: 'Inicia un juego de trivia',
    category: 'games',
    handler: async (socket, message, args) => {
      const topic = args.join(' ') || 'océano';
      const triviaText = `🌊 **Trivia de ${topic}** 🌊\n\n¿Cuál es el animal marino más grande del mundo?\n\nA) Tiburón ballena\nB) Ballena azul 🐋\nC) Calamar gigante\n\n¡Responde con la letra correcta! Tienes 30 segundos.`;
      
      await socket.sendMessage(message.key.remoteJid!, { text: triviaText });
    }
  },

  {
    name: 'sticker',
    description: 'Genera un sticker personalizado',
    category: 'fun',
    handler: async (socket, message, args) => {
      const stickerName = args.join(' ') || 'shark';
      const stickerText = `🦈 ¡Generando sticker "${stickerName}"! *chomp chomp*\n\n[🦈 STICKER: ${stickerName.toUpperCase()} 🦈]`;
      
      await socket.sendMessage(message.key.remoteJid!, { text: stickerText });
    }
  },

  // Comandos de admin
  {
    name: 'kick',
    description: 'Expulsa un usuario del grupo',
    category: 'admin',
    adminOnly: true,
    handler: async (socket, message, args) => {
      if (!message.key.remoteJid?.endsWith('@g.us')) {
        await socket.sendMessage(message.key.remoteJid!, {
          text: '🚨 Este comando solo funciona en grupos.'
        });
        return;
      }

      const userMention = args[0];
      if (!userMention) {
        await socket.sendMessage(message.key.remoteJid!, {
          text: '🚨 Menciona a un usuario para expulsarlo. Ejemplo: /kick @usuario'
        });
        return;
      }

      await socket.sendMessage(message.key.remoteJid!, {
        text: `🦈 [SIMULADO] Usuario ${userMention} ha sido expulsado del grupo.`
      });
    }
  },

  {
    name: 'warn',
    description: 'Advierte a un usuario',
    category: 'admin',
    adminOnly: true,
    handler: async (socket, message, args) => {
      const userMention = args[0];
      if (!userMention) {
        await socket.sendMessage(message.key.remoteJid!, {
          text: '🚨 Menciona a un usuario para advertirlo. Ejemplo: /warn @usuario'
        });
        return;
      }

      await socket.sendMessage(message.key.remoteJid!, {
        text: `⚠️ **Advertencia para ${userMention}**\n\nPor favor respeta las reglas del grupo. Esta es tu advertencia oficial.\n\n🦈 - Gawr Gura Bot`
      });
    }
  }
];