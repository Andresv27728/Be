let handler = async (m, { conn, isOwner }) => {
  // Solo el propietario puede ver los códigos
  if (!isOwner) return m.reply('🦈 Este comando solo puede ser utilizado por el propietario del bot.')
  
  // Verificar si hay códigos en la base de datos
  if (!global.db.data.codes || Object.keys(global.db.data.codes).length === 0) {
    return m.reply('🦈 No hay códigos de vinculación generados.')
  }
  
  // Crear una lista de códigos
  let codeList = '🦈 *Lista de códigos de vinculación*\n\n'
  
  for (const [code, data] of Object.entries(global.db.data.codes)) {
    const createdAt = new Date(data.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const validUntil = new Date(data.validUntil).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const isValid = data.validUntil > Date.now() && !data.used
    const status = isValid ? '✅ Válido' : (data.used ? '❌ Usado' : '⏱️ Expirado')
    
    codeList += `*Código:* ${code}\n`
    codeList += `*Estado:* ${status}\n`
    codeList += `*Creado:* ${createdAt}\n`
    codeList += `*Válido hasta:* ${validUntil}\n`
    
    if (data.used) {
      const usedAt = new Date(data.usedAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      codeList += `*Usado por:* ${data.usedBy}\n`
      codeList += `*Usado el:* ${usedAt}\n`
    }
    
    codeList += '\n'
  }
  
  m.reply(codeList)
}

handler.help = ['listcodigos']
handler.tags = ['owner']
handler.command = ['listcodigos', 'listcodes', 'codelist'] 
handler.owner = true

export default handler

