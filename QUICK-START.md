# 🚀 Guía Rápida - Gawr Gura WhatsApp Bot

## 🎯 Despliegue Inmediato en Render

### Opción 1: Fork y Deploy (Más Rápido)

1. **Haz Fork de este repositorio en GitHub**
2. **Ve a [render.com](https://render.com) y crea cuenta**
3. **Nuevo Web Service:**
   - Repository: Tu fork
   - Name: `gawr-gura-bot`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Deploy automático** - ¡Listo en 3-5 minutos!

### Opción 2: Clonar y Subir

```bash
# Clona el repositorio
git clone <este-repositorio>
cd gawr-gura-bot

# Sube a tu GitHub
git remote set-url origin <tu-nuevo-repositorio>
git push -u origin main

# Conecta con Render siguiendo Opción 1
```

## 📱 Conectar WhatsApp

1. **Accede a tu URL de Render:** `https://gawr-gura-bot.onrender.com`
2. **Ve a la página "Conectar"**
3. **Elige método:**
   - **QR Code:** Escanea desde WhatsApp Web
   - **PIN:** Ingresa tu número y usa el código de 8 dígitos

## ⚡ Comandos Disponibles

Una vez conectado, tu bot responderá a:

```
/ping - Test de conexión
/help - Lista de comandos
/info - Información del bot
/joke - Chiste aleatorio
/time - Hora actual
/weather - Clima (requiere configuración)
/sticker - Crear sticker de imagen
```

## 🔧 Configuración Avanzada

### Variables de Entorno (Opcional)
```bash
NODE_ENV=production
PORT=10000  # Render usa automáticamente este puerto
```

### Comandos Personalizados
Usa el dashboard web para agregar nuevos comandos sin código.

## 🛠️ Otras Plataformas

### Railway
```bash
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

### Heroku
```bash
heroku create gawr-gura-bot
git push heroku main
```

### VPS/Docker
```bash
./external-deploy.sh
# Selecciona opción 4 (Docker)
```

## 🔄 Modo Bot Standalone

Para ejecutar solo el bot sin interfaz web:

```bash
node bot-standalone.js
```

## 📊 Dashboard Features

- **Tiempo Real:** Estadísticas actualizadas cada 10 segundos
- **Gestión de Comandos:** Agregar/editar/eliminar comandos
- **Monitor de Mensajes:** Ver actividad en vivo
- **Conexión Flexible:** QR Code o PIN
- **Auto-Reconexión:** El bot se reconecta automáticamente
- **Limpieza Automática:** Elimina archivos corruptos y regenera códigos

## 🚨 Solución de Problemas

### Bot no conecta
- Usa el botón "🔄 Reiniciar" para limpiar sesión
- Genera nuevo código QR o PIN

### Dashboard no carga
- Verifica que el puerto esté abierto (5000 por defecto)
- Revisa logs de la plataforma

### Comandos no funcionan
- Verifica conexión del bot (debe estar verde)
- Usa el dashboard para agregar/editar comandos

## 📞 URLs de Ejemplo

Después del despliegue:
- **Render:** `https://gawr-gura-bot.onrender.com`
- **Railway:** `https://gawr-gura-bot.up.railway.app`
- **Heroku:** `https://gawr-gura-bot.herokuapp.com`

## 🎉 ¡Listo!

Tu bot estará disponible 24/7 y se reconectará automáticamente. 
Usa el dashboard web para monitorearlo y configurarlo.

**¿Necesitas ayuda?** Revisa `DEPLOYMENT.md` para instrucciones detalladas.