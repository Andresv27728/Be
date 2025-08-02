// Función serverless para Vercel
const path = require('path');

// Importar la aplicación principal
const app = require('../dist/index.js');

module.exports = (req, res) => {
  // Configurar variables de entorno para serverless
  process.env.NODE_ENV = 'production';
  process.env.PORT = process.env.PORT || '3000';
  
  // Ejecutar la aplicación
  return app(req, res);
};