# Guía de Instalación y Uso de Simple Bot

## Requisitos del Sistema

Antes de instalar Simple Bot, asegúrate de tener instalados los siguientes requisitos:

1. **Node.js** (versión 16.x o superior)
   - Descarga: [https://nodejs.org/](https://nodejs.org/)
   - Verifica la instalación con: `node -v`

2. **npm** (viene incluido con Node.js)
   - Verifica la instalación con: `npm -v`

3. **Git** (opcional, para clonar el repositorio)
   - Descarga: [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Verifica la instalación con: `git --version`

## Instalación Paso a Paso

### Método 1: Usando Git

1. Abre una terminal o línea de comandos
2. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/simple-bot.git
   ```
3. Navega al directorio del proyecto:
   ```bash
   cd simple-bot
   ```
4. Instala las dependencias:
   ```bash
   npm install
   ```

### Método 2: Descarga Manual

1. Descarga el archivo ZIP del proyecto
2. Extrae el contenido en la ubicación deseada
3. Abre una terminal o línea de comandos
4. Navega al directorio extraído:
   ```bash
   cd ruta/a/simple-bot
   ```
5. Instala las dependencias:
   ```bash
   npm install
   ```

## Configuración

Antes de ejecutar el bot, debes configurar algunos parámetros:

1. Abre el archivo `config.js` con un editor de texto
2. Modifica la siguiente información:
   - `global.owner`: Cambia el número de teléfono por el tuyo (incluye el código de país)
   - `global.botname`: Personaliza el nombre del bot si lo deseas
   - `global.packname` y `global.author`: Personaliza la información para los stickers

Ejemplo:
```javascript
global.owner = [['5491123456789', 'TU NOMBRE', true]]
global.botname = 'Simple Bot'
global.packname = 'Simple Bot'
global.author = 'Tu Nombre'
```

## Ejecución

### En Windows

1. Haz doble clic en el archivo `run.bat`
2. O abre una terminal y ejecuta:
   ```bash
   npm start
   ```

### En Linux/Mac

1. Abre una terminal
2. Navega al directorio del proyecto
3. Ejecuta:
   ```bash
   npm start
   ```

## Conexión con WhatsApp

1. Al iniciar el bot, se generará un código QR en la terminal
2. Abre WhatsApp en tu teléfono
3. Ve a Configuración > Dispositivos vinculados > Vincular un dispositivo
4. Escanea el código QR mostrado en la terminal
5. Espera a que se complete la conexión (verás un mensaje de confirmación)

## Comandos Disponibles

Una vez conectado, puedes usar los siguientes comandos en cualquier chat:

- `!menu` - Muestra el menú principal con todos los comandos
- `!hola` - El bot te saluda
- `!ping` - Comprueba la velocidad de respuesta
- `!infobot` - Muestra información sobre el bot
- `!estado` - Muestra el estado del sistema
- `!creador` - Muestra información sobre el creador

## Solución de Problemas

### El código QR no se muestra correctamente

- Asegúrate de que tu terminal soporta caracteres Unicode
- Intenta ampliar la ventana de la terminal
- Usa la opción de conexión por código numérico

### Error de conexión

- Verifica tu conexión a internet
- Asegúrate de que WhatsApp esté actualizado en tu teléfono
- Elimina la carpeta `Simple-BotSession` y vuelve a iniciar el bot

### Dependencias faltantes

Si encuentras errores relacionados con módulos faltantes:
```bash
npm install --force
```

## Mantenimiento

- La sesión se guarda automáticamente en la carpeta `Simple-BotSession`
- Para cerrar sesión, elimina esta carpeta y reinicia el bot
- Los archivos temporales se limpian automáticamente cada 3 minutos

## Personalización Avanzada

Para añadir nuevas funcionalidades, puedes crear plugins personalizados:

1. Crea un nuevo archivo en la carpeta `plugins/index/`
2. Usa la siguiente estructura básica:

```javascript
let handler = async (m, { conn, args }) => {
  // Tu código aquí
  m.reply('¡Respuesta del comando!')
}

handler.help = ['nombrecomando']
handler.tags = ['categoria']
handler.command = ['nombrecomando', 'alias1', 'alias2'] 

export default handler
```

3. Reinicia el bot para cargar el nuevo plugin

