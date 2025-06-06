import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn }) => {
  // Saludos de Gawr Gura
  const saludos = [
    "¡A! ¡Hola!",
    "¡Domo! Same desu!",
    "¡Shaaaaaaark! ¡Hola!",
    "¡Wah! ¡Qué bueno verte!",
    "¡Hola! ¿Has tenido pensamientos de tiburón hoy?",
    "¡Bloop! ¡Hola!",
    "¡Tiburón feliz de verte!",
    "¡Hora de nadar juntos!",
    "¡Un tiburón te saluda!",
    "¡Apex depredador a tu servicio!"
  ]
  
  // Seleccionar un saludo aleatorio
  const saludoAleatorio = saludos[Math.floor(Math.random() * saludos.length)]
  
  // Responde con un saludo personalizado
  let name = m.pushName || conn.getName(m.sender)
  let response = `${saludoAleatorio}\n\n¡Hola ${name}! 🦈\n\nSoy *Gawr Gura Bot*, un bot de WhatsApp temático de la VTuber Gawr Gura.\n\nPuedes usar el comando *!menu* para ver todas mis funciones.\n\na~`
  
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
      
      await conn.sendFile(m.chat, imagePath, 'gura.jpg', response, m)
    } else {
      // Si no hay imágenes, enviar solo texto
      await conn.reply(m.chat, response, m)
    }
  } catch (e) {
    console.error(e)
    // Si hay error, enviar solo texto
    await conn.reply(m.chat, response, m)
  }
}

handler.help = ['hola', 'hi', 'hello']
handler.tags = ['main']
handler.command = ['hola', 'hi', 'hello', 'a'] 

export default handler

