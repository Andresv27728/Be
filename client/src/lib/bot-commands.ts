export interface BotCommand {
  name: string;
  description: string;
  usage: string;
  category: "general" | "admin" | "fun" | "games";
  response?: string;
}

export const defaultCommands: BotCommand[] = [
  {
    name: "help",
    description: "Muestra la lista de comandos disponibles",
    usage: "/help",
    category: "general",
    response: "🦈 ¡Hola chummm! Aquí están mis comandos súper geniales:\n\n⚡ **Comandos Generales:**\n/help - Muestra esta ayuda\n/sticker [nombre] - Genera stickers\n/level - Ve tu nivel actual\n\n🎮 **Juegos:**\n/trivia [tema] - Inicia trivia\n/dados - Lanza dados\n\n👥 **Admin:**\n/kick [@usuario] - Expulsa usuario\n/warn [@usuario] - Advierte usuario\n\n🌊 ¡Úsalos sabiamente, chum!"
  },
  {
    name: "sticker",
    description: "Genera y envía stickers personalizados",
    usage: "/sticker [nombre]",
    category: "fun",
    response: "🦈 ¡Sticker enviado! *chomp chomp*"
  },
  {
    name: "trivia",
    description: "Inicia juegos de trivia interactivos",
    usage: "/trivia [tema]",
    category: "games",
    response: "🌊 **Trivia del Océano** 🌊\n\n¿Cuál es el animal marino más grande del mundo?\n\nA) Tiburón ballena\nB) Ballena azul 🐋\nC) Calamar gigante\n\n¡Responde con la letra correcta! Tienes 30 segundos."
  },
  {
    name: "level",
    description: "Muestra tu nivel y experiencia actual",
    usage: "/level",
    category: "general",
    response: "🦈 ¡Tu nivel actual es 5! 🌟\nExperiencia: 1250/1500 XP\n¡Sigue chateando para subir de nivel, chum!"
  },
  {
    name: "dados",
    description: "Lanza dados virtuales",
    usage: "/dados [cantidad]",
    category: "games",
    response: "🎲 ¡Lanzando dados! 🎲\n\nResultado: ⚅ 6\n\n¡Genial! ¿Quieres lanzar otra vez?"
  },
  {
    name: "ping",
    description: "Verifica la latencia del bot",
    usage: "/ping",
    category: "general",
    response: "🦈 ¡Pong! Latencia: 42ms\n¡Estoy nadando a toda velocidad!"
  }
];

export function processCommand(input: string): { command: string; args: string[] } | null {
  if (!input.startsWith('/')) {
    return null;
  }

  const parts = input.slice(1).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

export function getCommandResponse(commandName: string, args: string[] = []): string {
  const command = defaultCommands.find(cmd => cmd.name === commandName);
  
  if (!command) {
    return "🦈 ¡Ese comando no existe, chum! Usa /help para ver todos los comandos disponibles.";
  }

  // Special handling for certain commands
  switch (commandName) {
    case "sticker":
      const stickerName = args.join(" ") || "shark";
      return `🦈 ¡Generando sticker "${stickerName}"! *chomp chomp*\n\n[🦈 STICKER: ${stickerName.toUpperCase()} 🦈]`;
    
    case "dados":
      const diceCount = Math.min(parseInt(args[0]) || 1, 6);
      const results = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      return `🎲 ¡Lanzando ${diceCount} dado(s)! 🎲\n\nResultados: ${results.map(r => diceEmojis[r-1]).join(' ')}\nTotal: ${results.reduce((a, b) => a + b, 0)}`;
    
    case "trivia":
      const topic = args.join(" ") || "océano";
      return `🌊 **Trivia de ${topic}** 🌊\n\n¿Cuál es el animal marino más grande del mundo?\n\nA) Tiburón ballena\nB) Ballena azul 🐋\nC) Calamar gigante\n\n¡Responde con la letra correcta! Tienes 30 segundos.`;
    
    default:
      return command.response || "🦈 Comando ejecutado exitosamente!";
  }
}
