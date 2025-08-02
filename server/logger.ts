import pino from 'pino';

// Colores ANSI para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colores de texto
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Colores de fondo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Emojis para diferentes tipos de log
const icons = {
  info: '🦈',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  debug: '🔍',
  message: '💬',
  command: '⚡',
  connection: '🔌',
  qr: '📱',
  pin: '🔗',
};

class CustomLogger {
  private logger: any;

  constructor() {
    // Simplificar el logger para evitar problemas de dependencias
    this.logger = pino({
      level: 'info',
    });
  }

  private formatMessage(level: string, message: string, icon?: string): string {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    const levelColor = this.getLevelColor(level);
    const iconStr = icon || icons[level as keyof typeof icons] || '📋';
    
    return `${colors.dim}${timestamp}${colors.reset} ${iconStr} ${levelColor}${message}${colors.reset}`;
  }

  private getLevelColor(level: string): string {
    switch (level) {
      case 'info': return colors.cyan;
      case 'success': return colors.green;
      case 'warning': return colors.yellow;
      case 'error': return colors.red;
      case 'debug': return colors.magenta;
      case 'message': return colors.blue;
      case 'command': return colors.yellow + colors.bright;
      default: return colors.white;
    }
  }

  // Métodos de logging mejorados
  info(message: string, data?: any) {
    console.log(this.formatMessage('info', message));
    if (data) this.logger.info(data);
  }

  success(message: string, data?: any) {
    console.log(this.formatMessage('success', message));
    if (data) this.logger.info(data);
  }

  warning(message: string, data?: any) {
    console.log(this.formatMessage('warning', message));
    if (data) this.logger.warn(data);
  }

  error(message: string, error?: any) {
    console.log(this.formatMessage('error', message));
    if (error) this.logger.error(error);
  }

  debug(message: string, data?: any) {
    console.log(this.formatMessage('debug', message));
    if (data) this.logger.debug(data);
  }

  // Métodos específicos para WhatsApp
  botMessage(from: string, content: string, type: 'incoming' | 'outgoing' = 'incoming') {
    const arrow = type === 'incoming' ? '📥' : '📤';
    const typeText = type === 'incoming' ? 'Recibido' : 'Enviado';
    const fromFormatted = from.replace('@s.whatsapp.net', '').replace('@g.us', ' (Grupo)');
    
    console.log(this.formatMessage('message', `${typeText} de ${fromFormatted}: ${content}`, arrow));
  }

  botCommand(command: string, from: string, success: boolean = true) {
    const statusIcon = success ? '⚡' : '❌';
    const fromFormatted = from.replace('@s.whatsapp.net', '').replace('@g.us', ' (Grupo)');
    
    console.log(this.formatMessage('command', `Comando "${command}" ejecutado por ${fromFormatted}`, statusIcon));
  }

  botConnection(status: 'connecting' | 'connected' | 'disconnected' | 'error', details?: string) {
    const statusMessages = {
      connecting: 'Conectando a WhatsApp...',
      connected: '¡Conectado exitosamente a WhatsApp!',
      disconnected: 'Desconectado de WhatsApp',
      error: 'Error de conexión'
    };
    
    const message = details ? `${statusMessages[status]} - ${details}` : statusMessages[status];
    const level = status === 'connected' ? 'success' : status === 'error' ? 'error' : 'info';
    
    console.log(this.formatMessage(level, message, icons.connection));
  }

  qrCode(message: string = 'Código QR generado para escanear') {
    console.log(this.formatMessage('info', message, icons.qr));
  }

  pairingCode(code: string, phoneNumber: string) {
    console.log(this.formatMessage('info', `Código de vinculación generado: ${code} para ${phoneNumber}`, icons.pin));
  }

  // Separador visual
  separator(title?: string) {
    const line = '═'.repeat(60);
    if (title) {
      const titlePadded = ` ${title} `;
      const totalPadding = line.length - titlePadded.length;
      const leftPadding = '═'.repeat(Math.floor(totalPadding / 2));
      const rightPadding = '═'.repeat(Math.ceil(totalPadding / 2));
      console.log(`${colors.cyan}${leftPadding}${titlePadded}${rightPadding}${colors.reset}`);
    } else {
      console.log(`${colors.dim}${line}${colors.reset}`);
    }
  }

  // Banner de inicio
  startupBanner() {
    console.clear();
    this.separator();
    console.log(`${colors.cyan}${colors.bright}
    ██████╗  █████╗ ██╗    ██╗██████╗     ██████╗ ██╗   ██╗██████╗  █████╗ 
    ██╔══██╗██╔══██╗██║    ██║██╔══██╗    ██╔════╝ ██║   ██║██╔══██╗██╔══██╗
    ██████╔╝███████║██║ █╗ ██║██████╔╝    ██║  ███╗██║   ██║██████╔╝███████║
    ██╔══██╗██╔══██║██║███╗██║██╔══██╗    ██║   ██║██║   ██║██╔══██╗██╔══██║
    ██████╔╝██║  ██║╚███╔███╔╝██║  ██║    ╚██████╔╝╚██████╔╝██║  ██║██║  ██║
    ╚═════╝ ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                                                             
    🦈 WhatsApp Bot Dashboard v2.1 - Desarrollado con amor por Replit
    ${colors.reset}`);
    this.separator();
    this.info('Iniciando sistema...');
  }
}

export const logger = new CustomLogger();
export default logger;