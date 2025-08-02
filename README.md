# Bot de WhatsApp - Gawr Gura 🦈

Un bot de WhatsApp completo con dashboard web para gestión y monitoreo en tiempo real.

## 🚀 Inicio Rápido

### Archivo Principal
- **Servidor**: `server/index.ts` - Punto de entrada principal de la aplicación
- **Frontend**: `client/src/main.tsx` - Aplicación React del dashboard

### Ejecutar el Proyecto
```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5000

## 📋 Características

- **Dashboard Web**: Interfaz moderna para gestionar el bot
- **Conexión WhatsApp**: Soporte para código QR y PIN de 8 dígitos
- **Comandos Personalizados**: Más de 15 comandos configurables
- **Chat en Tiempo Real**: WebSocket para mensajes en vivo
- **Analytics**: Estadísticas de uso y rendimiento
- **Auto-reconexión**: Sistema inteligente de reconexión automática

## 🛠️ Comandos del Bot

### Entretenimiento
- `/meme` - Genera memes aleatorios
- `/joke` - Cuenta chistes
- `/trivia` - Juego de preguntas y respuestas
- `/sticker` - Convierte imágenes en stickers

### Utilidades
- `/weather <ciudad>` - Clima actual
- `/time` - Hora actual
- `/help` - Lista de comandos disponibles
- `/ping` - Verifica conexión

### Administración
- `/stats` - Estadísticas del bot
- `/users` - Lista de usuarios activos
- `/groups` - Información de grupos

## 🔧 Configuración

### Prefijos de Comandos
El bot acepta múltiples prefijos: `/`, `!`, `.`, `#`, `$`

### Autenticación Dashboard
- Usuario: admin
- Contraseña: gawr2024

## 📁 Estructura del Proyecto

```
├── server/           # Backend Express.js
│   ├── index.ts     # Archivo principal del servidor
│   ├── routes.ts    # Rutas de la API
│   ├── whatsapp.ts  # Integración WhatsApp
│   └── storage.ts   # Gestión de datos
├── client/          # Frontend React
│   └── src/
│       ├── main.tsx # Entrada de la aplicación
│       ├── App.tsx  # Componente principal
│       └── pages/   # Páginas del dashboard
├── shared/          # Esquemas compartidos
└── auth_info/       # Sesiones WhatsApp (ignorado en git)
```

## 🌐 Despliegue

El proyecto está configurado para desplegarse en:
- **Replit**: Listo para usar
- **Vercel**: Configuración incluida
- **Render**: Docker disponible

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo con recarga automática
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar versión de producción
- `npm run check` - Verificar tipos TypeScript

## 🔒 Seguridad

- Separación cliente/servidor
- Autenticación para dashboard
- Variables de entorno para secrets
- Gitignore configurado para archivos sensibles

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las dependencias estén instaladas
2. Revisa los logs en la consola
3. El bot se reconecta automáticamente en caso de desconexión