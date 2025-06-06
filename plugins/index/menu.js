import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  // Verificar si el usuario está vinculado
  const isLinked = global.db.data.users[m.sender].linked || false
  
  const sections = [
    {
      title: '🦈 Comandos de Gawr Gura',
      rows: [
        {title: '🦈 Info Gura', description: 'Muestra información sobre Gawr Gura', rowId: `${usedPrefix}gura`},
        {title: '💬 Frase Gura', description: 'Muestra una frase aleatoria de Gawr Gura', rowId: `${usedPrefix}frasegura`}
      ]
    },
    {
      title: '📋 Comandos Básicos',
      rows: [
        {title: '🤖 Info Bot', description: 'Muestra información sobre el bot', rowId: `${usedPrefix}infobot`},
        {title: '👋 Saludar', description: 'El bot te saluda', rowId: `${usedPrefix}hola`},
        {title: '🔍 Ping', description: 'Comprueba la velocidad del bot', rowId: `${usedPrefix}ping`}
      ]
    },
    {
      title: '📝 Info',
      rows: [
        {title: '📊 Estado', description: 'Muestra el estado del bot', rowId: `${usedPrefix}estado`},
        {title: '👑 Creador', description: 'Muestra información del creador', rowId: `${usedPrefix}creador`}
      ]
    }
  ]
  
  // Si el usuario no está vinculado, agregar sección de vinculación
  if (!isLinked) {
    sections.unshift({
      title: '🔐 Vinculación',
      rows: [
        {title: '🔑 Estado Vinculación', description: 'Verifica tu estado de vinculación', rowId: `${usedPrefix}estadovinculacion`},
        {title: '🔗 Vincular', description: 'Vincula tu cuenta con un código', rowId: `${usedPrefix}vincular`}
      ]
    })
  }
  
  // Si es propietario, agregar sección de administración
  if (isOwner) {
    sections.push({
      title: '👑 Comandos de Propietario',
      rows: [
        {title: '🔑 Generar Código', description: 'Genera un código de vinculación', rowId: `${usedPrefix}generarcodigo`},
        {title: '📋 Listar Códigos', description: 'Lista todos los códigos generados', rowId: `${usedPrefix}listcodigos`}
      ]
    })
  }
  
  // Enviar mensaje con imagen
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const resourcesDir = path.join(__dirname, '../../resources')
  
  try {
    // Intentar enviar con imagen
    const files = await fs.readdir(resourcesDir)
    const imageFiles = files.filter(file => 
      file.toLowerCase().includes('gura') && 
      (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
    )
    
    let listMessage = {
      text: `*Gawr Gura Bot* 🦈\n\n¡Hola ${m.pushName}!\nAquí tienes el menú de comandos disponibles.\n\n${!isLinked ? '⚠️ *No estás vinculado*. Algunos comandos requieren vinculación.' : '✅ *Estás vinculado*. Tienes acceso a todos los comandos.'}`,
      footer: 'Gawr Gura Bot - 2025',
      title: null,
      buttonText: "Selecciona una opción",
      sections
    }
    
    if (imageFiles.length > 0) {
      // Seleccionar una imagen aleatoria
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
      const imagePath = path.join(resourcesDir, randomImage)
      
      return conn.sendMessage(m.chat, { 
        image: { url: imagePath }, 
        caption: listMessage.text,
        footer: listMessage.footer,
        title: listMessage.title,
        buttonText: listMessage.buttonText,
        sections: listMessage.sections
      }, { quoted: m })
    } else {
      // Si no hay imágenes, enviar solo texto
      return conn.sendMessage(m.chat, listMessage, { quoted: m })
    }
  } catch (e) {
    console.error(e)
    // Si hay error, enviar solo texto
    const listMessage = {
      text: `*Gawr Gura Bot* 🦈\n\n¡Hola ${m.pushName}!\nAquí tienes el menú de comandos disponibles.\n\n${!isLinked ? '⚠️ *No estás vinculado*. Algunos comandos requieren vinculación.' : '✅ *Estás vinculado*. Tienes acceso a todos los comandos.'}`,
      footer: 'Gawr Gura Bot - 2025',
      title: null,
      buttonText: "Selecciona una opción",
      sections
    }
    
    return conn.sendMessage(m.chat, listMessage, { quoted: m })
  }
}

handler.help = ['menu', 'help', 'comandos']
handler.tags = ['main']
handler.command = ['menu', 'help', 'comandos'] 

export default handler

