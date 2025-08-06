#!/bin/bash

# Gawr Gura WhatsApp Bot - External Deployment Script
# Automates deployment to various platforms

set -e

echo "🦈 Gawr Gura WhatsApp Bot - External Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    log_info "Inicializando repositorio Git..."
    git init
    git add .
    git commit -m "Initial commit - Gawr Gura WhatsApp Bot"
    log_success "Repositorio Git inicializado"
fi

# Show deployment options
echo ""
log_info "Selecciona plataforma de despliegue:"
echo "1) Render (Recomendado)"
echo "2) Railway"
echo "3) Heroku"
echo "4) Docker (VPS/Local)"
echo "5) Manual (Solo archivos)"

read -p "Opción (1-5): " platform

case $platform in
    1)
        log_info "Preparando despliegue para Render..."
        
        # Check if render.yaml exists
        if [ ! -f "render.yaml" ]; then
            cp render-deploy.yaml render.yaml
            log_success "Archivo render.yaml creado"
        fi
        
        echo ""
        log_success "Configuración para Render completada!"
        echo ""
        log_info "Pasos siguientes:"
        echo "1. Sube tu código a GitHub:"
        echo "   git remote add origin <tu-repositorio-github>"
        echo "   git push -u origin main"
        echo ""
        echo "2. Ve a render.com y crea un nuevo Web Service"
        echo "3. Conecta tu repositorio de GitHub"
        echo "4. Render detectará automáticamente la configuración"
        echo ""
        ;;
        
    2)
        log_info "Preparando despliegue para Railway..."
        
        echo ""
        log_success "Configuración para Railway completada!"
        echo ""
        log_info "Pasos siguientes:"
        echo "1. Instala Railway CLI: npm install -g @railway/cli"
        echo "2. Ejecuta: railway login"
        echo "3. Ejecuta: railway init"
        echo "4. Ejecuta: railway up"
        echo ""
        ;;
        
    3)
        log_info "Preparando despliegue para Heroku..."
        
        echo ""
        log_success "Configuración para Heroku completada!"
        echo ""
        log_info "Pasos siguientes:"
        echo "1. Instala Heroku CLI"
        echo "2. Ejecuta: heroku login"
        echo "3. Ejecuta: heroku create gawr-gura-bot"
        echo "4. Ejecuta: git push heroku main"
        echo ""
        ;;
        
    4)
        log_info "Preparando despliegue con Docker..."
        
        if [ ! -f "Dockerfile" ]; then
            cp docker-deploy/Dockerfile .
            cp docker-deploy/docker-compose.yml .
            log_success "Archivos Docker creados"
        fi
        
        echo ""
        log_success "Configuración Docker completada!"
        echo ""
        log_info "Pasos siguientes:"
        echo "1. Construir imagen: docker build -t gawr-gura-bot ."
        echo "2. Ejecutar contenedor: docker run -p 5000:5000 gawr-gura-bot"
        echo "3. O usar Docker Compose: docker-compose up"
        echo ""
        ;;
        
    5)
        log_info "Preparando archivos para despliegue manual..."
        
        # Create deployment package
        mkdir -p deploy-package
        
        # Copy essential files
        cp -r server deploy-package/
        cp -r client deploy-package/
        cp -r shared deploy-package/
        cp package.json deploy-package/
        cp start-production.js deploy-package/
        cp *.md deploy-package/
        cp *.config.* deploy-package/
        
        # Create simple start script
        cat > deploy-package/start.sh << 'EOF'
#!/bin/bash
echo "🦈 Instalando dependencias..."
npm install
echo "🚀 Iniciando Gawr Gura Bot..."
npm start
EOF
        
        chmod +x deploy-package/start.sh
        
        log_success "Paquete de despliegue creado en ./deploy-package/"
        echo ""
        log_info "Pasos siguientes:"
        echo "1. Sube la carpeta deploy-package a tu servidor"
        echo "2. Ejecuta: ./start.sh"
        echo "3. Accede a http://tu-servidor:5000"
        echo ""
        ;;
        
    *)
        log_error "Opción inválida"
        exit 1
        ;;
esac

# General tips
echo ""
log_info "💡 Consejos generales:"
echo "• El bot funciona en cualquier plataforma que soporte Node.js"
echo "• Asegúrate de que el puerto 5000 esté disponible"
echo "• Los archivos de WhatsApp se guardan automáticamente"
echo "• Puedes usar el dashboard web para conectar el bot"
echo ""

log_success "¡Despliegue configurado exitosamente! 🎉"