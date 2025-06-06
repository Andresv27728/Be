// Middleware para verificar si un usuario está vinculado
// Este archivo debe ser importado en los plugins que requieran vinculación

export default function requireLink(m, { command }) {
  // Verificar si el usuario está en la base de datos
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  
  // Verificar si el usuario está vinculado
  const isLinked = global.db.data.users[m.sender].linked || false
  
  // Si no está vinculado, enviar mensaje de error
  if (!isLinked) {
    m.reply(`🦈 *Acceso denegado*\n\nNecesitas estar vinculado para usar este comando.\n\nPara vincularte, solicita un código al propietario del bot y luego usa el comando:\n!vincular <código>`)
    return false // Detener la ejecución del comando
  }
  
  return true // Permitir que el comando continúe
}

