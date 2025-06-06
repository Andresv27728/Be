let handler = async (m, { conn, args, text }) => {
  // Verificar si se proporcionó un código
  if (!text) return m.reply('🦈 Por favor, proporciona el código de vinculación.\n\nEjemplo: !vincular ABC123')
  
  // Convertir a mayúsculas para evitar problemas de coincidencia
  const code = text.trim().toUpperCase()
  
  // Verificar si el código existe
  if (!global.db.data.codes) global.db.data.codes = {}
  if (!global.db.data.codes[code]) return m.reply('🦈 El código proporcionado no es válido o ha expirado.')
  
  // Verificar si el código ya fue usado
  if (global.db.data.codes[code].used) return m.reply('🦈 Este código ya ha sido utilizado.')
  
  // Verificar si el código ha expirado
  if (global.db.data.codes[code].validUntil < Date.now()) return m.reply('🦈 Este código ha expirado.')
  
  // Marcar el código como usado
  global.db.data.codes[code].used = true
  global.db.data.codes[code].usedBy = m.sender
  global.db.data.codes[code].usedAt = Date.now()
  
  // Registrar al usuario como vinculado
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  global.db.data.users[m.sender].linked = true
  global.db.data.users[m.sender].linkedAt = Date.now()
  global.db.data.users[m.sender].linkedCode = code
  
  // Enviar mensaje de confirmación
  m.reply(`🦈 *¡Vinculación exitosa!*\n\nAhora tienes acceso a todas las funciones del bot Gawr Gura.\n\n¡Gracias por vincularte! a~`)
}

handler.help = ['vincular <código>']
handler.tags = ['main']
handler.command = ['vincular', 'link', 'verify'] 

export default handler

