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

### Archivo de Lanzamiento Principal
El bot incluye un archivo `start.js` que maneja el despliegue automáticamente:
```bash
node start.js
```

### Plataformas Soportadas

#### 🟢 Render (Recomendado)
1. Conecta tu repositorio en [render.com](https://render.com)
2. El archivo `render.yaml` configurará todo automáticamente
3. Variables de entorno necesarias:
   - `NODE_ENV=production`
   - `ADMIN_PASSWORD=gawr2024`

#### 🟡 Railway
1. Conecta tu repositorio en [railway.app](https://railway.app)
2. El archivo `railway.toml` configurará todo automáticamente
3. Se auto-desplegará con el comando: `node start.js`

#### 🟠 Vercel 
1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. El archivo `vercel.json` ya está configurado
3. Funciona como aplicación serverless

#### 🔵 Netlify
1. Conecta tu repositorio en [netlify.com](https://netlify.com)
2. El archivo `netlify.toml` configurará todo automáticamente

#### 🖥️ Servidor VPS/Dedicado
```bash
# Clonar repositorio
git clone <tu-repo>
cd gawr-gura-bot

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Iniciar bot
node start.js
```

#### 🐳 Docker
```bash
# Construir imagen
docker build -t gawr-gura-bot .

# Ejecutar contenedor
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e ADMIN_PASSWORD=gawr2024 \
  -v ./auth_info:/app/auth_info \
  gawr-gura-bot
```

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo con recarga automática
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar versión de producción
- `node start.js` - **Lanzador principal del bot** (recomendado)
- `npm run check` - Verificar tipos TypeScript

### Variables de Entorno Importantes

```bash
NODE_ENV=production          # Modo de ejecución
PORT=5000                   # Puerto del servidor
ADMIN_PASSWORD=gawr2024     # Contraseña del dashboard
```

## 🔒 Seguridad

- Separación cliente/servidor
- Autenticación para dashboard
- Variables de entorno para secrets
- Gitignore configurado para archivos sensibles

## 🚀 Inicio Rápido para Despliegue

### Opción 1: Lanzamiento Automático
```bash
node start.js
```

### Opción 2: Despliegue en Render (Más fácil)
1. Haz fork del repositorio
2. Ve a [render.com](https://render.com) y conecta tu repo
3. Render detectará automáticamente el `render.yaml`
4. El bot se desplegará automáticamente

### Opción 3: Despliegue Manual
```bash
git clone <tu-repositorio>
cd gawr-gura-bot
npm install
npm run build
NODE_ENV=production node start.js
```

## 🆘 Soporte y Solución de Problemas

### Problemas Comunes

**Error: tsx not found**
```bash
npm install
```

**Puerto ocupado**
```bash
export PORT=3000
node start.js
```

**Bot no conecta**
1. Verifica que auth_info/ tenga permisos de escritura
2. Usa el código QR o PIN desde el dashboard
3. Revisa los logs para errores específicos

**Estadísticas no actualizan**
- Las estadísticas se actualizan cada 10 segundos automáticamente
- Verifica la conexión WebSocket en el navegador

### Logs y Monitoreo
El archivo `start.js` incluye logs detallados que te ayudarán a identificar problemas.