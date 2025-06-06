import crypto from 'crypto'

let handler = async (m, { conn, args, isOwner }) => {
  // Solo el propietario puede generar códigos
  if (!isOwner) return m.reply('🦈 Este comando solo puede ser utilizado por el propietario del bot.')
  
  // Generar un código aleatorio de 6 caracteres
  const code = crypto.randomBytes(3).toString('hex').toUpperCase()
  
  // Guardar el código en la base de datos
  if (!global.db.data.codes) global.db.data.codes = {}
  
  // Establecer la validez del código (24 horas)
  const validUntil = Date.now() + (24 * 60 * 60 * 1000)
  global.db.data.codes[code] = {
    createdAt: Date.now(),
    validUntil: validUntil,
    createdBy: m.sender,
    used: false,
    usedBy: null
  }
  
  // Enviar el código al propietario
  m.reply(`🦈 *Código de vinculación generado*\n\nCódigo: *${code}*\n\nEste código es válido por 24 horas.\nCompártelo con las personas que deseas que puedan usar el bot.\nPara vincularse, deben usar el comando: !vincular ${code}`)
}

handler.help = ['generarcodigo']
handler.tags = ['owner']
handler.command = ['generarcodigo', 'gencode', 'createcode'] 
handler.owner = true

export default handler

