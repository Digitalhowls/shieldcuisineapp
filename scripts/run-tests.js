#!/usr/bin/env node

/**
 * Script para ejecutar pruebas automatizadas en ShieldCuisine
 * 
 * Uso:
 *   node run-tests.js [opciones]
 * 
 * Opciones:
 *   --module NOMBRE    Probar solo un módulo específico
 *   --headless         Ejecutar sin interfaz gráfica
 *   --verbose          Mostrar logs detallados
 *   --report-path RUTA Especificar ruta para el informe
 *   --help             Mostrar esta ayuda
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parsear argumentos
const args = process.argv.slice(2);
const options = {
  module: null,
  headless: false,
  verbose: false,
  reportPath: path.join(__dirname, '../test-results/report.json'),
};

// Procesar argumentos
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--module':
      options.module = args[++i];
      break;
    case '--headless':
      options.headless = true;
      break;
    case '--verbose':
      options.verbose = true;
      break;
    case '--report-path':
      options.reportPath = args[++i];
      break;
    case '--help':
      showHelp();
      process.exit(0);
      break;
  }
}

// Mostrar ayuda
function showHelp() {
  console.log(`
Uso: node run-tests.js [opciones]

Opciones:
  --module NOMBRE    Probar solo un módulo específico
  --headless         Ejecutar sin interfaz gráfica
  --verbose          Mostrar logs detallados
  --report-path RUTA Especificar ruta para el informe
  --help             Mostrar esta ayuda

Módulos disponibles:
  Autenticación      Tests de login y registro
  APPCC              Tests del módulo APPCC
  Inventario         Tests del sistema de inventario
  Transparencia      Tests del portal de transparencia
  WooCommerce        Tests de integración con tienda
  Bancario           Tests de integración bancaria
  E-Learning         Tests de la plataforma educativa
  Compras            Tests del módulo de compras
  CMS                Tests del constructor web

Ejemplos:
  node run-tests.js --module CMS     # Probar solo el módulo CMS
  node run-tests.js --headless       # Ejecutar todos los tests sin interfaz gráfica
  `);
}

// Verificar que Playwright está instalado
function checkDependencies() {
  try {
    require.resolve('playwright');
    require.resolve('@playwright/test');
  } catch (e) {
    console.error('Error: Se requiere Playwright para ejecutar los tests');
    console.log('Instala las dependencias necesarias con:');
    console.log('npm install playwright @playwright/test');
    process.exit(1);
  }
}

// Ejecutar tests
async function runTests() {
  console.log('🧪 Iniciando pruebas automatizadas para ShieldCuisine');
  console.log('═════════════════════════════════════════════════');
  
  if (options.module) {
    console.log(`📊 Módulo a probar: ${options.module}`);
  } else {
    console.log('📊 Ejecutando pruebas en todos los módulos');
  }
  
  console.log(`🖥️  Modo: ${options.headless ? 'Sin interfaz (headless)' : 'Con interfaz gráfica'}`);
  console.log(`📝 Reporte: ${options.reportPath}`);
  console.log('═════════════════════════════════════════════════\n');
  
  // Crear directorio para reportes si no existe
  const reportDir = path.dirname(options.reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Modificar configuración del test según opciones
  const testFilePath = path.join(__dirname, 'test-automation.js');
  let testFileContent = fs.readFileSync(testFilePath, 'utf8');
  
  // Actualizar configuración en el archivo de prueba
  testFileContent = testFileContent.replace(
    /headless: false/,
    `headless: ${options.headless}`
  );
  
  if (options.module) {
    // Crear un archivo temporal modificado para ejecutar solo el módulo especificado
    const tempFilePath = path.join(__dirname, 'temp-test.js');
    
    // Modificar la función runTests para ejecutar solo el módulo especificado
    testFileContent = testFileContent.replace(
      /async function runTests\(\) {[\s\S]*?browser\.close\(\);/m,
      `async function runTests() {
  const browser = await chromium.launch({
    headless: ${options.headless},
    slowMo: config.slowMo,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: config.screenshotsDir },
  });
  
  const page = await context.newPage();
  
  try {
    // Test de autenticación siempre es necesario
    await testAuthentication(page);
    
    // Ejecutar solo el módulo especificado
    switch ('${options.module}') {
      case 'Autenticación':
        // Ya se ejecutó
        break;
      case 'APPCC':
        await testAPPCCModule(page);
        break;
      case 'Inventario':
        await testInventoryModule(page);
        break;
      case 'Transparencia':
      case 'Portal de Transparencia':
        await testTransparencyPortal(page);
        break;
      case 'WooCommerce':
        await testWooCommerceIntegration(page);
        break;
      case 'Bancario':
      case 'Integración Bancaria':
        await testBankingIntegration(page);
        break;
      case 'E-Learning':
        await testELearningPlatform(page);
        break;
      case 'Compras':
        await testPurchasingModule(page);
        break;
      case 'CMS':
        await testCMSModule(page);
        break;
      default:
        console.error(\`Módulo "\${options.module}" no reconocido\`);
        break;
    }
  } catch (error) {
    console.error('Error en la ejecución de pruebas:', error);
    await takeScreenshot(page, 'error-general');
  } finally {
    await context.close();
    await browser.close();`
    );
    
    fs.writeFileSync(tempFilePath, testFileContent);
    
    // Ejecutar el archivo temporal
    const testProcess = spawn('node', [tempFilePath], { 
      stdio: options.verbose ? 'inherit' : 'pipe'
    });
    
    await new Promise((resolve) => {
      testProcess.on('close', (code) => {
        if (code !== 0 && !options.verbose) {
          console.error(`Los tests terminaron con código de error: ${code}`);
        }
        
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          console.warn('No se pudo eliminar el archivo temporal de pruebas');
        }
        
        resolve();
      });
      
      if (!options.verbose) {
        testProcess.stdout.on('data', (data) => {
          process.stdout.write(data);
        });
        
        testProcess.stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      }
    });
  } else {
    // Ejecutar todos los tests normalmente
    const testProcess = spawn('node', [testFilePath], { 
      stdio: options.verbose ? 'inherit' : 'pipe'
    });
    
    await new Promise((resolve) => {
      testProcess.on('close', (code) => {
        if (code !== 0 && !options.verbose) {
          console.error(`Los tests terminaron con código de error: ${code}`);
        }
        resolve();
      });
      
      if (!options.verbose) {
        testProcess.stdout.on('data', (data) => {
          process.stdout.write(data);
        });
        
        testProcess.stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      }
    });
  }
  
  // Mostrar resumen si existe
  if (fs.existsSync(options.reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(options.reportPath, 'utf8'));
      
      console.log('\n\n═════════════════════════════════════════════════');
      console.log('📊 RESUMEN DE RESULTADOS');
      console.log('═════════════════════════════════════════════════');
      console.log(`✅ Pruebas exitosas: ${report.summary.passed}`);
      console.log(`❌ Pruebas fallidas: ${report.summary.failed}`);
      console.log(`⚠️ Pruebas omitidas: ${report.summary.skipped}`);
      console.log(`📊 Total ejecutadas: ${report.summary.total}`);
      
      if (report.summary.failed > 0) {
        console.log('\n❌ FALLOS DETECTADOS:');
        
        for (const [moduleName, moduleData] of Object.entries(report.modules)) {
          const failedTests = Object.entries(moduleData.tests)
            .filter(([_, test]) => test.status === 'failed');
          
          if (failedTests.length > 0) {
            console.log(`\n📋 Módulo: ${moduleName}`);
            
            failedTests.forEach(([testName, test]) => {
              console.log(`  ❌ ${testName}: ${test.error}`);
            });
          }
        }
      }
      
      console.log('\n═════════════════════════════════════════════════');
      console.log(`📁 Reporte detallado: ${options.reportPath}`);
      console.log(`📷 Capturas de pantalla: ${path.dirname(options.reportPath)}`);
      console.log('═════════════════════════════════════════════════\n');
    } catch (e) {
      console.error('Error al leer el reporte de resultados:', e);
    }
  }
}

// Ejecutar el programa
checkDependencies();
runTests().catch(console.error);