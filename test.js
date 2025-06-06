import { spawn } from 'child_process'
import { join } from 'path'

console.log('Iniciando test de Simple Bot...')
let isRunning = false

function start() {
  if (isRunning) return
  isRunning = true
  
  let args = [join(__dirname, 'index.js'), ...process.argv.slice(2)]
  console.log('Comando:', 'node', args)
  
  let p = spawn('node', args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  
  p.on('message', data => {
    console.log('[ RECIBIDO ]', data)
    switch (data) {
      case 'reset':
        p.kill()
        isRunning = false
        start()
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })
  
  p.on('exit', code => {
    isRunning = false
    console.error('Proceso de prueba finalizado con código:', code)
    
    if (code === 0) return
    
    start()
  })
}

start()

