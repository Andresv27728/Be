import { exec } from 'child_process'
import speed from 'performance-now'

let handler = async (m, { conn }) => {
  let timestamp = speed()
  let latensi = speed() - timestamp
  
  m.reply(`🚀 *Velocidad*: ${latensi.toFixed(4)} ms`)
}

handler.help = ['ping', 'speed']
handler.tags = ['info']
handler.command = ['ping', 'speed'] 

export default handler

