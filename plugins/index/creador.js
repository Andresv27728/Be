let handler = async (m, { conn }) => {
  let text = `
*≡ CREADOR*

*Simple Bot* fue creado como un proyecto de ejemplo para mostrar cómo crear un bot de WhatsApp utilizando Node.js.

Si tienes alguna pregunta o sugerencia, puedes contactar al desarrollador.

*Desarrollado por:* Simple Bot
*Versión:* ${global.vs}
*Año:* ${global.copy}
`
  
  conn.reply(m.chat, text, m)
}

handler.help = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.command = ['creador', 'owner', 'creator'] 

export default handler

