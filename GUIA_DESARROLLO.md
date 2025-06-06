# Guía para Desarrolladores de Simple Bot

Esta guía está diseñada para desarrolladores que deseen extender las funcionalidades de Simple Bot o entender su estructura interna.

## Estructura del Proyecto

```
simple-bot/
├── lib/                  # Bibliotecas y utilidades
├── plugins/              # Plugins y comandos
│   └── index/            # Comandos individuales
├── tmp/                  # Archivos temporales
├── Simple-BotSession/    # Datos de sesión (generado automáticamente)
├── config.js             # Configuración global
├── handler.js            # Manejador de mensajes
├── index.js              # Punto de entrada
├── main.js               # Lógica principal
├── package.json          # Dependencias
├── README.md             # Documentación general
└── server.js             # Servidor web (opcional)
```

## Arquitectura del Bot

Simple Bot está construido sobre la biblioteca [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys), que proporciona una interfaz para interactuar con la API de WhatsApp Web.

El flujo de ejecución es el siguiente:

1. `index.js` inicia el bot y configura el entorno
2. `main.js` establece la conexión con WhatsApp y carga los plugins
3. `handler.js` procesa los mensajes entrantes y los dirige a los plugins correspondientes
4. Los plugins en `plugins/index/` implementan comandos específicos

## Sistema de Plugins

Los plugins son la forma principal de extender las funcionalidades del bot. Cada plugin es un módulo ES que exporta un objeto `handler` con métodos específicos.

### Estructura Básica de un Plugin

```javascript
let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Lógica del comando
  m.reply('Respuesta al comando')
}

// Metadatos para el sistema de ayuda
handler.help = ['comando']          // Nombre para el menú de ayuda
handler.tags = ['categoría']        // Categoría del comando
handler.command = ['cmd', 'alias']  // Comandos que activan este handler
handler.premium = false             // Si es solo para usuarios premium
handler.group = false               // Si es solo para grupos
handler.private = false             // Si es solo para chats privados
handler.admin = false               // Si es solo para admins de grupo
handler.botAdmin = false            // Si requiere que el bot sea admin
handler.fail = null                 // Función a ejecutar si falla
handler.exp = 0                     // EXP a dar al usuario
handler.limit = false               // Si consume límites del usuario

export default handler
```

### Objeto de Contexto

El objeto `m` contiene información sobre el mensaje recibido:

- `m.chat`: ID del chat
- `m.sender`: ID del remitente
- `m.text`: Texto del mensaje
- `m.reply()`: Función para responder al mensaje
- `m.quoted`: Mensaje citado (si existe)
- `m.mentionedJid`: Usuarios mencionados

El segundo parámetro es un objeto desestructurado con utilidades:

- `conn`: Instancia principal del bot
- `args`: Argumentos del comando (array)
- `usedPrefix`: Prefijo usado (ej: "!")
- `command`: Comando usado
- `text`: Texto completo después del comando

### Ejemplos de Plugins

#### Comando Simple

```javascript
let handler = async (m, { conn }) => {
  m.reply('¡Hola Mundo!')
}

handler.help = ['hola']
handler.tags = ['main']
handler.command = ['hola', 'hi', 'hello'] 

export default handler
```

#### Comando con Argumentos

```javascript
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('¡Ingresa un número!')
  
  let num = parseInt(args[0])
  m.reply(`El cuadrado de ${num} es ${num * num}`)
}

handler.help = ['cuadrado <número>']
handler.tags = ['tools']
handler.command = ['cuadrado', 'square'] 

export default handler
```

#### Comando con Restricciones

```javascript
let handler = async (m, { conn }) => {
  m.reply('Este comando solo funciona en grupos y requiere que seas administrador')
}

handler.help = ['admincmd']
handler.tags = ['admin']
handler.command = ['admincmd'] 
handler.group = true    // Solo en grupos
handler.admin = true    // Solo para admins

export default handler
```

## API del Bot

### Enviar Mensajes

```javascript
// Responder al mensaje actual
m.reply('Texto de respuesta')

// Enviar mensaje a un chat específico
conn.sendMessage(chatId, { text: 'Mensaje' })

// Enviar imagen
conn.sendFile(m.chat, 'ruta/a/imagen.jpg', 'imagen.jpg', 'Descripción', m)

// Enviar sticker
conn.sendSticker(m.chat, 'ruta/a/sticker.webp', m, { packname: 'Pack', author: 'Autor' })

// Enviar botones
const buttons = [
  {buttonId: 'id1', buttonText: {displayText: 'Botón 1'}, type: 1},
  {buttonId: 'id2', buttonText: {displayText: 'Botón 2'}, type: 1}
]
conn.sendMessage(m.chat, { buttons, text: 'Selecciona una opción' }, { quoted: m })
```

### Gestión de Grupos

```javascript
// Obtener información del grupo
const groupMetadata = await conn.groupMetadata(m.chat)
const participants = groupMetadata.participants

// Añadir participante
conn.groupParticipantsUpdate(m.chat, [userId], 'add')

// Eliminar participante
conn.groupParticipantsUpdate(m.chat, [userId], 'remove')

// Promover a admin
conn.groupParticipantsUpdate(m.chat, [userId], 'promote')

// Degradar de admin
conn.groupParticipantsUpdate(m.chat, [userId], 'demote')
```

### Base de Datos

Simple Bot utiliza LowDB para almacenar datos:

```javascript
// Acceder a datos de usuario
let user = global.db.data.users[m.sender]
if (!user) global.db.data.users[m.sender] = {}

// Modificar datos
user.points = (user.points || 0) + 1

// Guardar cambios (se hace automáticamente cada 30 segundos)
// Para guardar manualmente:
await global.db.write()
```

## Depuración

Para depurar plugins, puedes usar:

```javascript
// Imprimir en consola
console.log('Valor:', variable)

// Enviar debug al chat
m.reply(util.format(variable))
```

## Mejores Prácticas

1. **Modularidad**: Mantén cada plugin enfocado en una sola funcionalidad
2. **Manejo de Errores**: Usa try/catch para capturar errores
3. **Validación**: Valida siempre los inputs del usuario
4. **Rendimiento**: Evita operaciones pesadas que puedan bloquear el hilo principal
5. **Seguridad**: No ejecutes código arbitrario del usuario
6. **Documentación**: Documenta tus plugins con comentarios claros

## Recursos Adicionales

- [Documentación de Baileys](https://github.com/WhiskeySockets/Baileys)
- [Guía de Node.js](https://nodejs.org/en/docs/guides/)
- [Documentación de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/api/reference)

