# Gawr Gura - Bot de WhatsApp

Gawr Gura es un bot de WhatsApp basado en Node.js que proporciona funcionalidades temáticas de la VTuber Gawr Gura para interactuar con usuarios en chats individuales y grupos.

## Características

- Temática completa de Gawr Gura, la popular VTuber de Hololive
- Sistema de vinculación por código para mayor seguridad
- Responde a comandos básicos como !hola, !menu, !ping
- Muestra información del sistema y estado del bot
- Fácil de personalizar y extender con nuevos plugins
- Basado en la biblioteca @whiskeysockets/baileys

## Sobre Gawr Gura

Gawr Gura (がうる・ぐら) es una VTuber que debutó en 2020 como parte de Hololive English - Myth. Es una descendiente de la Ciudad Perdida de Atlantis, que nadó hasta la Tierra diciendo "¡Es muy aburrido allá abajo LOLOLOL!". Le encanta hablar con la vida marina en su tiempo libre.

Su frase característica es: "Domo!! Sa-me desu!! ¿Has tenido pensamientos de tiburón hoy?"

## Requisitos previos

- Node.js 16.x o superior
- npm (viene con Node.js)
- Un dispositivo o emulador con WhatsApp instalado para escanear el código QR

## Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/gawr-gura-bot.git
cd gawr-gura-bot
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura el bot:
   - Abre el archivo `config.js` y modifica los valores según tus necesidades
   - Especialmente, actualiza el número de propietario en `global.owner`

4. Inicia el bot:
```bash
npm start
```

5. Escanea el código QR que aparece en la consola con tu WhatsApp para iniciar sesión.

## Uso

Una vez que el bot esté conectado, puedes usar los siguientes comandos en cualquier chat:

- `!menu` - Muestra el menú principal con todos los comandos disponibles
- `!hola` - El bot te saluda
- `!ping` - Comprueba la velocidad de respuesta del bot
- `!infobot` - Muestra información sobre el bot
- `!estado` - Muestra el estado del sistema
- `!creador` - Muestra información sobre el creador del bot
- `!gura` - Muestra información sobre Gawr Gura

## Vinculación por Código

Este bot incluye un sistema de vinculación por código para mayor seguridad:

1. El administrador genera un código con `!generarcodigo`
2. Comparte el código con los usuarios autorizados
3. Los usuarios se vinculan usando `!vincular [código]`
4. Solo los usuarios vinculados pueden usar ciertos comandos

## Personalización

### Añadir nuevos comandos

Para añadir nuevos comandos, crea un archivo JavaScript en la carpeta `plugins/index/` con la siguiente estructura:

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

### Modificar el menú

Puedes modificar el menú editando el archivo `plugins/index/menu.js`.

## Mantenimiento

- El bot guarda la sesión en la carpeta `Gawr-Gura-Session`
- Para cerrar sesión, elimina esta carpeta y reinicia el bot
- Los archivos temporales se limpian automáticamente

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Agradecimientos

- Basado en el repositorio [Anime-bot](https://github.com/Andresv27728/Anime-bot.git)
- Utiliza la biblioteca [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
- Imágenes y concepto de Gawr Gura pertenecen a Hololive/Cover Corp.

---

Creado con 🦈 por Gawr Gura Bot

