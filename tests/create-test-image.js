/**
 * Script para crear una imagen de prueba para usar en las pruebas automatizadas
 */

import fs from 'fs';
import path from 'path';

// Crear directorio de archivos de prueba si no existe
const testFilesDir = path.join('tests', 'test-files');
if (!fs.existsSync(testFilesDir)) {
  fs.mkdirSync(testFilesDir, { recursive: true });
}

// Crear una imagen de prueba simple (1x1 pixel PNG)
const createTestImage = () => {
  // Datos base64 de un PNG de 1x1 pixel negro
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC';
  const imageBuffer = Buffer.from(base64Data, 'base64');
  
  // Ruta del archivo
  const imagePath = path.join(testFilesDir, 'test-image.png');
  
  // Escribir el archivo
  fs.writeFileSync(imagePath, imageBuffer);
  
  console.log(`Imagen de prueba creada en: ${imagePath}`);
};

// Ejecutar la función
createTestImage();