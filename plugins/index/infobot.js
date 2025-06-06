import os from 'os'
import util from 'util'
import sizeFormatter from 'human-readable'
import { performance } from 'perf_hooks'
import { cpus as _cpus, totalmem, freemem } from 'os'

let format = sizeFormatter.partial({
  decimalPlaces: 0,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

let handler = async (m, { conn }) => {
  const used = process.memoryUsage()
  const cpus = _cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  })
  
  let old = performance.now()
  await m.reply('_Procesando información..._')
  let neww = performance.now()
  let speed = neww - old
  
  let infobt = `
*≡ INFO BOT*
  
*ESTADO*
• *${speed.toFixed(4)}* ms
• *${format(totalmem() - freemem())}* / *${format(totalmem())}*
• *${freemem() / totalmem() * 100}%* RAM libre

*PLATAFORMA*
• *${os.platform()}*
• *${os.hostname()}*
• *${os.version()}*

*SIMPLE BOT*
• *Versión:* ${global.vs}
• *Desarrollado por:* ${global.dev}
`
  
  m.reply(infobt)
}

handler.help = ['infobot']
handler.tags = ['main']
handler.command = ['infobot', 'botinfo', 'info'] 

export default handler

