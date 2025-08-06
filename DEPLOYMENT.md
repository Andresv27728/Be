# 🚀 Guía de Despliegue - Gawr Gura WhatsApp Bot

Esta guía te ayudará a desplegar el bot en plataformas externas como Render, Heroku, Railway, etc.

## 📋 Requisitos Previos

- Git instalado
- Cuenta en la plataforma de despliegue (Render, Heroku, etc.)
- Node.js 18+ (se instala automáticamente en la mayoría de plataformas)

## 🌐 Despliegue en Render

### Opción 1: Desde GitHub

1. **Sube el código a GitHub:**
   ```bash
   git clone <tu-repositorio>
   cd gawr-gura-bot
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Conecta con Render:**
   - Ve a [render.com](https://render.com) y crea una cuenta
   - Clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Name:** `gawr-gura-bot`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

### Opción 2: Deploy Directo

1. **Crea un nuevo Web Service en Render**
2. **Configura las siguientes variables:**

```bash
# Configuración de Render
Name: gawr-gura-bot
Environment: Node
Build Command: npm install
Start Command: npm start
```

3. **Variables de entorno (opcional):**
```bash
NODE_ENV=production
PORT=10000
```

## 🚂 Despliegue en Railway

1. **Conecta con Railway:**
   ```bash
   npx @railway/cli login
   npx @railway/cli init
   npx @railway/cli up
   ```

2. **O desde la web:**
   - Ve a [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio

## 🔧 Despliegue en Heroku

1. **Instala Heroku CLI:**
   ```bash
   # En tu terminal
   heroku login
   heroku create gawr-gura-bot
   ```

2. **Configura el proyecto:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 📁 Archivos Importantes para Despliegue

### `start-production.js`
Este archivo maneja el inicio en producción y es compatible con todas las plataformas.

### `ecosystem.config.js`
Configuración para PM2 (opcional, para servidores VPS).

### `render.yaml`
Configuración específica para Render (ya incluida).

## 🌍 Variables de Entorno

El bot funciona sin variables adicionales, pero puedes configurar:

```bash
# Opcional
NODE_ENV=production
PORT=5000  # Se detecta automáticamente
```

## 🔗 Después del Despliegue

1. **Obtén tu URL:** Cada plataforma te dará una URL como:
   - Render: `https://gawr-gura-bot.onrender.com`
   - Railway: `https://gawr-gura-bot.up.railway.app`
   - Heroku: `https://gawr-gura-bot.herokuapp.com`

2. **Accede al dashboard:** Ve a tu URL y usa la página de conexión

3. **Conecta WhatsApp:** Usa el código QR o PIN para conectar tu bot

## 🔄 Bot Independiente (Sin Dashboard)

Si quieres ejecutar solo el bot sin la interfaz web:

1. **Crea un archivo `bot-only.js`:**
```javascript
// Ejecutar solo el bot sin interfaz web
const bot = require('./server/whatsapp-clean.ts');
bot.connect();
```

2. **Modifica el comando de inicio:**
```bash
# En lugar de: npm start
# Usar: node bot-only.js
```

## 🛠️ Solución de Problemas

### Error: "makeWASocket is not a function"
- ✅ **Solucionado:** Ya incluimos la fix en el código

### Error de puertos
- ✅ **Solucionado:** El launcher detecta automáticamente el puerto

### Error de permisos
- Asegúrate de que el directorio `auth_info` tenga permisos de escritura

### Bot no se conecta
- Verifica que no haya firewall bloqueando puertos
- Revisa los logs de la plataforma

## 📞 URLs de Ejemplo

Después del despliegue, tu bot estará disponible en:

```
https://tu-app.onrender.com       # Render
https://tu-app.railway.app        # Railway  
https://tu-app.herokuapp.com      # Heroku
```

## 🔐 Seguridad

- Los archivos de autenticación se crean automáticamente
- No subas el directorio `auth_info` a Git (ya está en .gitignore)
- El bot se auto-reconecta si se desconecta

## ✅ Lista de Verificación

- [ ] Código subido a GitHub/Git
- [ ] Servicio creado en la plataforma elegida
- [ ] Build exitoso
- [ ] URL funcionando
- [ ] Dashboard accesible
- [ ] Bot conectado con QR/PIN

¡Tu bot está listo para funcionar en cualquier plataforma! 🦈