import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { storage } from '../storage';

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
      const helpText = `╔═══════════════════╗
║  🦈 **Gawr Gura Bot** 🦈  ║
╚═══════════════════╝

✨ **MENÚ PRINCIPAL** ✨
> ⚡ */help*
  └ Muestra esta ayuda
> ⚡ */ping*
  └ Verifica latencia
> ⚡ */info*
  └ Información del bot
> ⚡ */menu*
  └ Muestra el menú principal

👤 **Prop: Yo Soy Yo**
🌊 ¡Disfruta del bot, chum!`;

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
    name: 'info',
    description: 'Información del bot',
    category: 'general',
    handler: async (socket, message, args) => {
      const infoText = `🦈 **Gawr Gura Bot**
📱 Estado: Conectado
👨‍💻 Prop: Yo Soy Yo
🌊 ¡Usa /help para ver comandos!`;
      await socket.sendMessage(message.key.remoteJid!, { text: infoText });
    }
  },

  {
    name: 'menu',
    description: 'Muestra el menú principal',
    category: 'general',
    handler: async (socket, message, args) => {
      const menuText = `╔═══════════════════╗
║  🦈 **Gawr Gura Bot** 🦈  ║
╚═══════════════════╝

✨ **MENÚ PRINCIPAL** ✨
> ⚡ */help*
  └ Muestra esta ayuda
> ⚡ */ping*
  └ Verifica latencia
> ⚡ */info*
  └ Información del bot
> ⚡ */menu*
  └ Muestra el menú principal

👤 **Prop: Yo Soy Yo**
🌊 ¡Disfruta del bot, chum!`;
      await socket.sendMessage(message.key.remoteJid!, { text: menuText });
    }
  }
];