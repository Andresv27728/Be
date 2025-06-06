import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn, args }) => {
  // Verificar si el usuario está vinculado
  const isLinked = global.db.data.users[m.sender].linked || false
  
  if (!isLinked) {
    return m.reply(`🦈 *Acceso denegado*\n\nNecesitas estar vinculado para usar este comando.\n\nPara vincularte, solicita un código al propietario del bot y luego usa el comando:\n!vincular <código>`)
  }
  
  // Frases de Gawr Gura
  const frases = [
    "¡A!",
    "Domo! Same desu!",
    "¿Has tenido pensamientos de tiburón hoy?",
    "¡Shaaaaaaark!",
    "¡Estoy no muerta, solo cansada!",
    "¡Hydrodynamic!",
    "¡Wah!",
    "¡No soy pequeña, soy compacta!",
    "¡Bloop!",
    "¡Estoy en peligro!",
    "¡Eres muy amable!",
    "¡Gracias por tu apoyo!",
    "¡Estoy nadando hacia ti!",
    "¡Tiburón va brrr!",
    "¡Apex depredador!",
    "¡Tiburón hambriento!",
    "¡Hora de nadar!",
    "¡Soy un tiburón, no un pez!",
    "¡Atlantis está sobrevalorada!",
    "¡Necesito agua!",
    "¡Eso es muy kawaii!",
    "¡Hora de jugar!",
    "¡Estoy teniendo pensamientos de tiburón!",
    "¡Soy un tiburón inteligente!",
    "¡Hora de cantar!",
    "¡Tiburón con ritmo!",
    "¡Tiburón con hambre!",
    "¡Tiburón con sueño!",
    "¡Tiburón confundido!",
    "¡Tiburón feliz!"
  ]
  
  // Seleccionar una frase aleatoria
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)]
  
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
    
    if (imageFiles.length > 0) {
      // Seleccionar una imagen aleatoria
      const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
      const imagePath = path.join(resourcesDir, randomImage)
      
      await conn.sendFile(m.chat, imagePath, 'gura.jpg', `🦈 *Gawr Gura dice:*\n\n"${fraseAleatoria}"\n\na~`, m)
    } else {
      // Si no hay imágenes, enviar solo texto
      m.reply(`🦈 *Gawr Gura dice:*\n\n"${fraseAleatoria}"\n\na~`)
    }
  } catch (e) {
    console.error(e)
    // Si hay error, enviar solo texto
    m.reply(`🦈 *Gawr Gura dice:*\n\n"${fraseAleatoria}"\n\na~`)
  }
}

handler.help = ['frasegura']
handler.tags = ['fun']
handler.command = ['frasegura', 'gurafrase', 'gurafrases'] 

export default handler

