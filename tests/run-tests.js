/**
 * Script para ejecutar todas las pruebas de la aplicación ShieldCuisine
 * 
 * Este script ejecuta:
 * 1. Configuración de usuario de prueba
 * 2. Creación de archivos de prueba
 * 3. Ejecución de las pruebas con Playwright
 * 4. Generación de un informe de resultados
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

// Función auxiliar para ejecutar comandos
async function runCommand(command) {
  console.log(`Ejecutando: ${command}`);
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`Error al ejecutar ${command}:`, error);
    return false;
  }
}

// Función principal para ejecutar las pruebas
async function runTests() {
  console.log('=== Iniciando pruebas de MediaUploader ===');
  
  // Paso 1: Crear directorios necesarios
  const dirs = [
    'tests/screenshots',
    'tests/test-files',
    'tests/reports'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  }
  
  // Paso 2: Crear imagen de prueba
  await runCommand('node tests/create-test-image.js');
  
  // Paso 3: Configurar usuario de prueba
  await runCommand('node tests/setup-test-user.js');
  
  // Paso 4: Ejecutar las pruebas con Playwright
  const testResult = await runCommand('npx playwright test tests/media-uploader-onclose.test.js --headed --reporter=html');
  
  if (testResult) {
    console.log('\n✅ Pruebas completadas con éxito');
  } else {
    console.log('\n❌ Algunas pruebas han fallado');
  }
  
  // Paso 5: Mover el informe de resultados a una ubicación específica
  if (fs.existsSync('playwright-report')) {
    const reportDestination = path.join('tests', 'reports', `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    await runCommand(`cp -r playwright-report ${reportDestination}`);
    console.log(`\nInforme de pruebas disponible en: ${reportDestination}`);
  }
  
  console.log('\n=== Fin de las pruebas ===');
}

// Ejecutar la función principal
runTests().catch(error => {
  console.error('Error durante la ejecución de las pruebas:', error);
  process.exit(1);
});