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
    author: 'Replit Team',
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
    dados: {
      aliases: ['dice', 'roll'],
      description: 'Lanza dados (1-6)',
      category: 'juegos',
    },
    moneda: {
      aliases: ['coin', 'flip'],
      description: 'Lanza una moneda',
      category: 'juegos',
    },
    menu: {
      aliases: ['inicio', 'start'],
      description: 'Muestra el menú principal',
      category: 'general',
    },
    clima: {
      aliases: ['weather', 'tiempo'],
      description: 'Obtiene información del clima',
      category: 'utilidades',
    },
    meme: {
      aliases: ['memes', 'random'],
      description: 'Genera un meme aleatorio',
      category: 'diversión',
    },
    traducir: {
      aliases: ['translate', 'tr'],
      description: 'Traduce texto a otro idioma',
      category: 'utilidades',
    },
    calc: {
      aliases: ['calculadora', 'math'],
      description: 'Calcula operaciones matemáticas',
      category: 'utilidades',
    },
    perfil: {
      aliases: ['profile', 'yo'],
      description: 'Muestra tu perfil de usuario',
      category: 'usuario',
    },
    registro: {
      aliases: ['reg', 'register'],
      description: 'Registra tu perfil en el bot',
      category: 'usuario',
    },
    top: {
      aliases: ['ranking', 'leaderboard'],
      description: 'Muestra el ranking de usuarios',
      category: 'usuario',
    },
    trivia: {
      aliases: ['pregunta', 'quiz'],
      description: 'Inicia un juego de trivia',
      category: 'juegos',
    },
    adivinanza: {
      aliases: ['guess', 'adivina'],
      description: 'Juego de adivinanzas',
      category: 'juegos',
    },
    bola8: {
      aliases: ['8ball', 'pregunta'],
      description: 'Pregunta a la bola mágica',
      category: 'diversión',
    },
    cita: {
      aliases: ['quote', 'frase'],
      description: 'Muestra una cita inspiradora',
      category: 'diversión',
    },
    gato: {
      aliases: ['cat', 'kitty'],
      description: 'Muestra una imagen de gato',
      category: 'diversión',
    },
    perro: {
      aliases: ['dog', 'puppy'],
      description: 'Muestra una imagen de perro',
      category: 'diversión',
    },
    musica: {
      aliases: ['music', 'song'],
      description: 'Busca información de música',
      category: 'entretenimiento',
    },
    horario: {
      aliases: ['time', 'hora'],
      description: 'Muestra la hora actual',
      category: 'utilidades',
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
  let helpText = `🦈 **${botConfig.botInfo.name} v${botConfig.botInfo.version}** 🦈\n\n`;
  helpText += `📝 **Prefijos disponibles:** ${botConfig.prefixes.join(', ')}\n\n`;
  
  categories.forEach(category => {
    const categoryCommands = Object.entries(botConfig.commands)
      .filter(([_, cmd]) => cmd.category === category);
    
    if (categoryCommands.length > 0) {
      helpText += `📂 **${category.toUpperCase()}:**\n`;
      categoryCommands.forEach(([name, cmd]) => {
        helpText += `${botConfig.defaultPrefix}${name} - ${cmd.description}\n`;
        if (cmd.aliases.length > 0) {
          helpText += `   └ Alias: ${cmd.aliases.map(alias => `${botConfig.defaultPrefix}${alias}`).join(', ')}\n`;
        }
      });
      helpText += '\n';
    }
  });
  
  helpText += `🌊 ¡Usa cualquier prefijo para ejecutar comandos, chum!`;
  return helpText;
}

export default botConfig;