import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let handler = async (m, { conn, args }) => {
  // Verificar si el usuario está vinculado
  const isLinked = global.db.data.users[m.sender].linked || false
  
  if (!isLinked) {
    return m.reply(`🦈 *Acceso denegado*\n\nNecesitas estar vinculado para usar este comando.\n\nPara vincularte, solicita un código al propietario del bot y luego usa el comando:\n!vincular <código>`)
  }
  
  // Información sobre Gawr Gura
  const info = `🦈 *GAWR GURA* 🦈

*Nombre:* Gawr Gura (がうる・ぐら)
*Debut:* 13 de septiembre de 2020
*Afiliación:* Hololive English - Myth
*Especie:* Tiburón (Atlante)
*Altura:* 141 cm
*Cumpleaños:* 20 de junio

*Descripción:*
Gawr Gura es una descendiente de la Ciudad Perdida de Atlantis, que nadó hasta la Tierra diciendo "¡Es muy aburrido allá abajo LOLOLOL!". Le encanta hablar con la vida marina en su tiempo libre.

*Frase característica:*
"Domo!! Sa-me desu!! ¿Has tenido pensamientos de tiburón hoy?"

*Curiosidades:*
• Es la VTuber más suscrita del mundo, con más de 4 millones de suscriptores
• Su canción original "REFLECT" fue un gran éxito
• Le encanta jugar videojuegos, especialmente los de terror
• Su símbolo es un tridente con forma de ancla
• Su mascota es un tiburón de peluche llamado Bloop
• Es conocida por su famoso "A" que se volvió viral

*Redes sociales:*
• YouTube: Gawr Gura Ch. hololive-EN
• Twitter: @gawrgura

a~`

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
      
      await conn.sendFile(m.chat, imagePath, 'gura.jpg', info, m)
    } else {
      // Si no hay imágenes, enviar solo texto
      m.reply(info)
    }
  } catch (e) {
    console.error(e)
    // Si hay error, enviar solo texto
    m.reply(info)
  }
}

handler.help = ['gura']
handler.tags = ['info']
handler.command = ['gura', 'gawrgura', 'infogura'] 

export default handler

