/**
 * Script para ejecutar pruebas de autenticación
 * 
 * Este script ejecuta específicamente las pruebas de autenticación
 * para verificar que la funcionalidad de login esté operando correctamente
 */
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

// Función principal para ejecutar las pruebas de autenticación
async function runAuthTests() {
  console.log('=== Iniciando pruebas de autenticación ===');
  
  // Paso 1: Crear directorios necesarios
  const dirs = [
    'tests/screenshots',
    'tests/reports'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  }
  
  // Paso 2: Ejecutar las pruebas de autenticación con Playwright
  const testResult = await runCommand('npx playwright test tests/auth.spec.js --headed --reporter=html');
  
  if (testResult) {
    console.log('\n✅ Pruebas de autenticación completadas con éxito');
  } else {
    console.log('\n❌ Algunas pruebas de autenticación han fallado');
  }
  
  // Paso 3: Mover el informe de resultados a una ubicación específica
  if (fs.existsSync('playwright-report')) {
    const reportDestination = path.join('tests', 'reports', `auth-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    await runCommand(`cp -r playwright-report ${reportDestination}`);
    console.log(`\nInforme de pruebas disponible en: ${reportDestination}`);
  }
  
  console.log('\n=== Fin de las pruebas de autenticación ===');
}

// Ejecutar la función principal
runAuthTests().catch(error => {
  console.error('Error durante la ejecución de las pruebas de autenticación:', error);
  process.exit(1);
});