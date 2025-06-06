let handler = async (m, { conn }) => {
  // Verificar si el usuario está en la base de datos
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  
  // Verificar si el usuario está vinculado
  const isLinked = global.db.data.users[m.sender].linked || false
  
  if (isLinked) {
    const linkedAt = new Date(global.db.data.users[m.sender].linkedAt)
    const formattedDate = linkedAt.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    m.reply(`🦈 *Estado de vinculación*\n\n✅ Tu cuenta está vinculada al bot Gawr Gura.\nFecha de vinculación: ${formattedDate}\n\nTienes acceso a todas las funciones del bot.`)
  } else {
    m.reply(`🦈 *Estado de vinculación*\n\n❌ Tu cuenta no está vinculada al bot Gawr Gura.\n\nPara vincularte, necesitas un código de vinculación. Solicita uno al propietario del bot y luego usa el comando:\n!vincular <código>`)
  }
}

handler.help = ['estadovinculacion']
handler.tags = ['main']
handler.command = ['estadovinculacion', 'linkstatus', 'checklink'] 

export default handler

