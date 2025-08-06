#!/usr/bin/env node

/**
 * Production Launcher for Gawr Gura WhatsApp Bot
 * Compatible with Render, Heroku, Railway, and other cloud platforms
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detectar plataforma y configurar variables
const platform = process.env.RENDER ? 'render' :
                 process.env.HEROKU_APP_NAME ? 'heroku' :
                 process.env.RAILWAY_ENVIRONMENT ? 'railway' :
                 process.env.VERCEL ? 'vercel' :
                 'other';

console.log(`🚀 Iniciando Gawr Gura Bot en plataforma: ${platform}`);

// Configurar puerto dinámico
const PORT = process.env.PORT || process.env.RENDER_PORT || 5000;
process.env.PORT = PORT;

// Configurar host para acceso externo
process.env.HOST = '0.0.0.0';

// Crear directorio de autenticación si no existe
const authDir = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log('📁 Directorio de autenticación creado');
}

// Configurar variables de entorno para producción
process.env.NODE_ENV = 'production';

// Función para ejecutar el servidor
function startServer() {
  console.log(`🦈 Iniciando servidor en puerto ${PORT}...`);
  
  const serverProcess = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Servidor cerrado con código: ${code}`);
      
      // Auto-reinicio en caso de fallo
      setTimeout(() => {
        console.log('🔄 Reiniciando servidor...');
        startServer();
      }, 5000);
    }
  });

  // Manejar señales de cierre
  process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    serverProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    serverProcess.kill('SIGINT');
  });
}

// Mostrar información de la plataforma
console.log('═══════════════════════════════════════════════════════════');
console.log('    🦈 GAWR GURA WHATSAPP BOT - PRODUCCIÓN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`📡 Plataforma: ${platform.toUpperCase()}`);
console.log(`🌐 Puerto: ${PORT}`);
console.log(`🔧 Modo: ${process.env.NODE_ENV}`);
console.log('═══════════════════════════════════════════════════════════');

// Iniciar el servidor
startServer();