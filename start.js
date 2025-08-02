#!/usr/bin/env node

/**
 * Script de lanzamiento para el Bot de WhatsApp Gawr Gura
 * Compatible con Render, Vercel, y servidores en general
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración del entorno
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log(`
════════════════════════════════════════════════════════════
    ██████╗  █████╗ ██╗    ██╗██████╗     ██████╗ ██╗   ██╗██████╗  █████╗ 
    ██╔══██╗██╔══██╗██║    ██║██╔══██╗    ██╔════╝ ██║   ██║██╔══██╗██╔══██╗
    ██████╔╝███████║██║ █╗ ██║██████╔╝    ██║  ███╗██║   ██║██████╔╝███████║
    ██╔══██╗██╔══██║██║███╗██║██╔══██╗    ██║   ██║██║   ██║██╔══██╗██╔══██║
    ██████╔╝██║  ██║╚███╔███╔╝██║  ██║    ╚██████╔╝╚██████╔╝██║  ██║██║  ██║
    ╚═════╝ ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
    🦈 WhatsApp Bot Dashboard v2.1 - Iniciando Bot
════════════════════════════════════════════════════════════
`);

// Verificar archivos necesarios
const requiredFiles = [
  'package.json',
  'server/index.ts',
  'server/whatsapp-working.ts',
  'client/src/main.tsx'
];

console.log('🔍 Verificando archivos del proyecto...');
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ Error: Archivo requerido no encontrado: ${file}`);
    process.exit(1);
  }
}
console.log('✅ Todos los archivos necesarios están presentes');

// Configurar variables de entorno por defecto
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Crear directorio de autenticación si no existe
const authDir = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log('📁 Directorio de autenticación creado');
}

console.log(`🚀 Iniciando en modo: ${process.env.NODE_ENV}`);
console.log(`🌐 Puerto configurado: ${process.env.PORT}`);

// Función para ejecutar comandos
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Ejecutando: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código: ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Función principal
async function startBot() {
  try {
    // En producción, usar el build ya compilado
    if (isProduction) {
      console.log('🏗️ Modo producción: Usando archivos compilados');
      
      // Verificar si existe el directorio dist
      if (!fs.existsSync(path.join(__dirname, 'dist'))) {
        console.log('📦 Compilando proyecto para producción...');
        await runCommand('npm', ['run', 'build']);
      }
      
      // Ejecutar la versión compilada
      await runCommand('node', ['dist/index.js']);
    } else {
      // En desarrollo, usar tsx directamente
      console.log('🛠️ Modo desarrollo: Usando tsx con recarga automática');
      await runCommand('npx', ['tsx', 'server/index.ts']);
    }
  } catch (error) {
    console.error('❌ Error iniciando el bot:', error.message);
    
    // Intentar instalar dependencias si faltan
    console.log('🔧 Intentando instalar dependencias...');
    try {
      await runCommand('npm', ['install']);
      console.log('✅ Dependencias instaladas correctamente');
      
      // Reintentar iniciar
      console.log('🔄 Reintentando iniciar el bot...');
      if (isProduction) {
        await runCommand('npm', ['run', 'build']);
        await runCommand('node', ['dist/index.js']);
      } else {
        await runCommand('npx', ['tsx', 'server/index.ts']);
      }
    } catch (installError) {
      console.error('❌ Error crítico:', installError.message);
      console.log(`
═══════════════════════════════════════════════════════════════
❌ ERROR CRÍTICO - El bot no pudo iniciarse
═══════════════════════════════════════════════════════════════

Posibles soluciones:
1. Verifica que Node.js esté instalado (versión 18 o superior)
2. Ejecuta: npm install
3. Verifica las variables de entorno
4. Revisa los logs anteriores para más detalles

Para soporte, revisa el README.md o contacta al desarrollador.
═══════════════════════════════════════════════════════════════
      `);
      process.exit(1);
    }
  }
}

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando bot...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida, cerrando bot...');
  process.exit(0);
});

// Iniciar el bot
startBot().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});