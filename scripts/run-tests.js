#!/usr/bin/env node

/**
 * Script para ejecutar pruebas de Playwright con varias opciones
 * de configuración y generación de informes.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtener __dirname en un entorno de módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const TEST_DIR = path.join(__dirname, '..', 'tests');
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

// Asegurar que el directorio de resultados existe
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Opciones de comando
const args = process.argv.slice(2);
const testFile = args.find(arg => arg.endsWith('.spec.js'));
const showReport = args.includes('--show-report');
const verbose = args.includes('--verbose');
const debug = args.includes('--debug');

// Función para ejecutar los tests
function runTests() {
  try {
    console.log('🧪 Ejecutando pruebas automatizadas...');
    
    // Construir el comando base
    let command = 'npx playwright test';
    
    // Añadir archivo específico si se proporcionó
    if (testFile) {
      command += ` "${path.join(TEST_DIR, testFile)}"`;
    }
    
    // Añadir opciones adicionales
    if (debug) {
      command += ' --debug';
    }
    
    if (verbose) {
      command += ' --verbose';
    }
    
    // Ejecutar las pruebas
    console.log(`Ejecutando: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    // Mostrar resultados
    console.log('✅ Pruebas completadas');
    
    // Mostrar el informe HTML si se solicita
    if (showReport) {
      console.log('🔍 Abriendo informe de pruebas...');
      execSync('npx playwright show-report test-results/html-report', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('❌ Ocurrió un error durante la ejecución de las pruebas:', error.message);
    process.exit(1);
  }
}

// Mostrar modo de uso si se especifica --help
if (args.includes('--help')) {
  console.log(`
Uso: node ${path.basename(__filename)} [opciones] [archivo-de-test.spec.js]

Opciones:
  --show-report    Abre el informe HTML después de la ejecución
  --verbose        Muestra información detallada durante la ejecución
  --debug          Ejecuta las pruebas en modo debug
  --help           Muestra esta ayuda

Ejemplos:
  node ${path.basename(__filename)}                      # Ejecuta todas las pruebas
  node ${path.basename(__filename)} auth.spec.js         # Ejecuta solo las pruebas de autenticación
  node ${path.basename(__filename)} --show-report        # Ejecuta todas las pruebas y muestra el informe
  `);
  process.exit(0);
}

// Ejecutar las pruebas
runTests();