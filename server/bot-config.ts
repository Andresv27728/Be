// Configuración de prefijos del bot
export const botConfig = {
  // Prefijos de comandos disponibles
  prefixes: ['/', '!', '.', '#', '$'],
  
  // Prefijo principal (usado por defecto)
  defaultPrefix: '/',
  
  // Configuración de vinculación por PIN
  pairingConfig: {
    enabled: true,
    timeout: 300000, // 5 minutos en milisegundos
    maxAttempts: 3,
  },
  
  // Información del bot
  botInfo: {
    name: 'Gawr Gura Bot',
    version: '2.1.0',
    description: 'Bot avanzado de WhatsApp con tema Gawr Gura',
    author: 'Yo Soy Yo',
  },
  
  // APIs gratuitas para descargas
  downloadApis: {
    // API gratuita para YouTube - usa yt-dlp público
    youtube: 'https://api.cobalt.tools/api/json',
    // API alternativa para múltiples plataformas
    universal: 'https://api.savetext.me/v1',
    // API de respaldo
    backup: 'https://api.downloadgram.org/media',
  },
  
  // Comandos disponibles con sus prefijos
  commands: {
    help: {
      aliases: ['ayuda', 'comandos'],
      description: 'Muestra la lista de comandos disponibles',
      category: 'general',
    },
    ping: {
      aliases: ['latencia'],
      description: 'Verifica la latencia del bot',
      category: 'general',
    },
    info: {
      aliases: ['informacion', 'about'],
      description: 'Información del bot',
      category: 'general',
    },
    menu: {
      aliases: ['inicio', 'start'],
      description: 'Muestra el menú principal',
      category: 'general',
    },
  }
};

// Función para verificar si un texto es un comando válido
export function isValidCommand(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  const firstChar = text.charAt(0);
  return botConfig.prefixes.includes(firstChar);
}

// Función para extraer el comando del texto
export function extractCommand(text: string): { prefix: string; command: string; args: string[] } | null {
  if (!isValidCommand(text)) return null;
  
  const prefix = text.charAt(0);
  const parts = text.substring(1).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  return { prefix, command, args };
}

// Función para formatear la lista de comandos
export function formatCommandList(): string {
  const categories = new Set(Object.values(botConfig.commands).map(cmd => cmd.category));
  let helpText = `╔═══════════════════╗\n`;
  helpText += `║  🦈 **${botConfig.botInfo.name}** 🦈  ║\n`;
  helpText += `╚═══════════════════╝\n\n`;
  helpText += `📝 **Prefijos:** ${botConfig.prefixes.join(' ')}\n\n`;
  
  categories.forEach(category => {
    const categoryCommands = Object.entries(botConfig.commands)
      .filter(([_, cmd]) => cmd.category === category);
    
    if (categoryCommands.length > 0) {
      helpText += `✨ **MENÚ PRINCIPAL** ✨\n`;
      
      categoryCommands.forEach(([name, cmd]) => {
        helpText += `> ⚡ *${botConfig.defaultPrefix}${name}*\n`;
        helpText += `  └ ${cmd.description}\n`;
      });
      helpText += '\n';
    }
  });
  
  helpText += `👤 **Prop: ${botConfig.botInfo.author}**\n`;
  helpText += `🌊 ¡Disfruta del bot, chum!`;
  return helpText;
}

export default botConfig;