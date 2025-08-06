#!/usr/bin/env node

/**
 * Gawr Gura WhatsApp Bot - Modo Standalone
 * Ejecuta solo el bot sin interfaz web (para servidores dedicados)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🦈 Gawr Gura WhatsApp Bot - Modo Standalone');
console.log('═══════════════════════════════════════════');

// Crear directorio de autenticación
const authDir = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log('📁 Directorio de autenticación creado');
}

// Configurar variables de entorno
process.env.NODE_ENV = 'production';
process.env.BOT_ONLY = 'true';

// Crear archivo de configuración para bot standalone
const standaloneConfig = `
import CleanWhatsAppBot from './server/whatsapp-clean.ts';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bot = new CleanWhatsAppBot();

console.log('🚀 Iniciando bot en modo standalone...');

// Configurar eventos del bot
bot.on('qr', (qrCode) => {
  console.log('📱 Código QR generado. Escanea desde WhatsApp Web:');
  console.log(qrCode);
});

bot.on('connected', () => {
  console.log('✅ Bot conectado exitosamente');
});

bot.on('disconnected', () => {
  console.log('❌ Bot desconectado');
});

bot.on('message_received', (data) => {
  console.log('📥 Mensaje recibido:', data.content.slice(0, 50));
});

bot.on('command_executed', (data) => {
  console.log('⚡ Comando ejecutado:', data.command);
});

bot.on('error', (error) => {
  console.error('🚨 Error del bot:', error.message);
});

// Iniciar bot
bot.connect().catch(error => {
  console.error('❌ Error iniciando bot:', error);
  process.exit(1);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando bot...');
  bot.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando bot...');
  bot.disconnect();
  process.exit(0);
});
`;

// Escribir archivo temporal
fs.writeFileSync(path.join(__dirname, 'bot-temp.mjs'), standaloneConfig);

// Ejecutar bot standalone
const botProcess = spawn('node', ['bot-temp.mjs'], {
  stdio: 'inherit',
  env: { ...process.env }
});

botProcess.on('error', (error) => {
  console.error('❌ Error ejecutando bot standalone:', error);
  process.exit(1);
});

botProcess.on('close', (code) => {
  // Limpiar archivo temporal
  try {
    fs.unlinkSync(path.join(__dirname, 'bot-temp.mjs'));
  } catch (e) {}
  
  if (code !== 0) {
    console.log(`⚠️ Bot cerrado con código: ${code}`);
  }
});