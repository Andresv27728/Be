# 🚀 Guía de Despliegue - Bot WhatsApp Gawr Gura

## Inicio Súper Rápido

```bash
# 1. Clonar y entrar al directorio
git clone <tu-repositorio>
cd gawr-gura-bot

# 2. Instalar dependencias
npm install

# 3. Lanzar el bot (automático)
node start.js
```

¡Ya está! El bot se ejecutará en http://localhost:5000

## Despliegue en la Nube (1 clic)

### 🟢 Render (Recomendado)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

1. Haz fork del repositorio
2. Conecta tu fork en Render
3. Render detectará automáticamente `render.yaml`
4. ¡Bot desplegado!

### 🟡 Railway  
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Clic en "Deploy on Railway"
2. Conecta tu repositorio
3. Railway usará `railway.toml` automáticamente

### 🟠 Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

1. Clic en "Deploy with Vercel"
2. Importa tu repositorio
3. Vercel usará `vercel.json` automáticamente

## Variables de Entorno

Configura estas variables en tu plataforma:

```bash
NODE_ENV=production
PORT=5000  # o el puerto que asigne tu plataforma
ADMIN_PASSWORD=gawr2024  # cambia por uno seguro
```

## Verificación

Una vez desplegado, verifica:

✅ Bot responde en la URL principal
✅ Dashboard accesible 
✅ WebSocket conecta (estadísticas actualizándose)
✅ Conexión WhatsApp disponible

## Problemas Comunes

**Bot no inicia**: Verifica que Node.js 18+ esté disponible
**Puerto ocupado**: La plataforma asignará uno automáticamente
**Auth falló**: Verifica permisos de escritura en `auth_info/`

## Soporte

- Revisa logs con: `node start.js`
- Consulta README.md para detalles técnicos
- Las estadísticas se actualizan cada 10 segundos