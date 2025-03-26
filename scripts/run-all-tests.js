#!/usr/bin/env node

/**
 * Script para ejecutar todas las pruebas de ShieldCuisine en secuencia
 * 
 * Este script ejecuta todos los test individuales y genera un informe
 * consolidado con los resultados de todas las pruebas.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  reportsDir: path.join(__dirname, '../test-results'),
  finalReportPath: path.join(__dirname, '../test-results/complete-report.json'),
  htmlReportPath: path.join(__dirname, '../test-results/complete-report.html'),
  headless: false,  // Cambiar a true para ejecutar sin interfaz gráfica
  moduleTimeoutMinutes: 10,  // Tiempo máximo para cada módulo de pruebas
  testsToRun: [
    {
      name: 'Pruebas Generales',
      script: 'test-automation.js',
      description: 'Pruebas básicas de todos los módulos de la aplicación'
    },
    {
      name: 'Pruebas de CMS',
      script: 'test-cms-module.js',
      description: 'Pruebas detalladas del módulo CMS y sus funcionalidades'
    },
    {
      name: 'Pruebas de Editor de Bloques',
      script: 'test-block-editor.js',
      description: 'Pruebas específicas del editor de bloques y sus capacidades'
    }
  ]
};

// Asegurar que existe el directorio para reportes
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

// Objeto para almacenar resultados
const testResults = {
  timestamp: new Date().toISOString(),
  modules: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

/**
 * Ejecuta un script de prueba individual
 */
async function runTestScript(testScript) {
  console.log(`\n==================================================`);
  console.log(`🧪 EJECUTANDO: ${testScript.name}`);
  console.log(`🔍 ${testScript.description}`);
  console.log(`==================================================\n`);
  
  // Añadir argumento para modo headless si está configurado
  const args = [path.join(__dirname, testScript.script)];
  if (config.headless) {
    args.push('--headless');
  }
  
  // Crear proceso para ejecutar el script
  const testProcess = spawn('node', args, { stdio: 'inherit' });
  
  // Esperar a que termine el proceso
  const exitCode = await new Promise((resolve) => {
    // Establecer timeout para el proceso
    const timeout = setTimeout(() => {
      console.error(`❌ Timeout: El proceso ${testScript.name} ha tardado más de ${config.moduleTimeoutMinutes} minutos`);
      testProcess.kill();
      resolve(1);
    }, config.moduleTimeoutMinutes * 60 * 1000);
    
    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
  
  // Cargar resultados del archivo generado (si existe)
  const resultFileName = testScript.script.replace('.js', '-report.json');
  const resultFilePath = path.join(config.reportsDir, resultFileName);
  
  let moduleResults = null;
  try {
    if (fs.existsSync(resultFilePath)) {
      moduleResults = JSON.parse(fs.readFileSync(resultFilePath, 'utf8'));
      console.log(`✅ Resultados cargados desde ${resultFilePath}`);
    } else {
      console.warn(`⚠️ No se encontró el archivo de resultados ${resultFilePath}`);
    }
  } catch (error) {
    console.error(`❌ Error al leer resultados: ${error.message}`);
  }
  
  return {
    name: testScript.name,
    exitCode,
    results: moduleResults
  };
}

/**
 * Consolida los resultados de todos los módulos
 */
function consolidateResults(moduleResults) {
  // Procesar cada módulo
  moduleResults.forEach(module => {
    if (!module.results) {
      // Si no hay resultados (error, timeout, etc.)
      testResults.modules[module.name] = {
        status: 'error',
        error: `Código de salida: ${module.exitCode}`,
        timestamp: new Date().toISOString()
      };
      testResults.summary.failed++;
      testResults.summary.total++;
      return;
    }
    
    // Agregar resultados del módulo
    testResults.modules[module.name] = {
      status: 'completed',
      timestamp: module.results.timestamp,
      summary: module.results.summary || { total: 0, passed: 0, failed: 0, skipped: 0 },
      tests: {}
    };
    
    // Agregar pruebas individuales del módulo
    if (module.results.tests) {
      testResults.modules[module.name].tests = module.results.tests;
    } else if (module.results.modules) {
      // Si el módulo tiene resultados por submódulos (como en test-automation.js)
      Object.entries(module.results.modules).forEach(([submoduleName, submoduleData]) => {
        if (submoduleData.tests) {
          Object.entries(submoduleData.tests).forEach(([testName, testData]) => {
            const fullTestName = `${submoduleName}: ${testName}`;
            testResults.modules[module.name].tests[fullTestName] = testData;
          });
        }
      });
    }
    
    // Actualizar contadores del resumen general
    testResults.summary.total += module.results.summary?.total || 0;
    testResults.summary.passed += module.results.summary?.passed || 0;
    testResults.summary.failed += module.results.summary?.failed || 0;
    testResults.summary.skipped += module.results.summary?.skipped || 0;
  });
}

/**
 * Genera un informe HTML con todos los resultados
 */
function generateHtmlReport() {
  // Calcular estadísticas
  const { summary } = testResults;
  const successRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
  
  // Generar HTML
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe Completo de Pruebas - ShieldCuisine</title>
  <style>
    :root {
      --primary: #2563eb;
      --success: #16a34a;
      --warning: #ca8a04;
      --danger: #dc2626;
      --background: #ffffff;
      --text: #18181b;
      --text-light: #a1a1aa;
      --border: #e4e4e7;
      --card: #f4f4f5;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: var(--text);
      background-color: var(--background);
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    header {
      background-color: var(--primary);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }
    
    header .container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    h1, h2, h3, h4 {
      margin: 0;
    }
    
    .timestamp {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .card {
      background-color: var(--card);
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .card-label {
      font-size: 0.875rem;
      color: var(--text-light);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .card-value {
      font-size: 2rem;
      font-weight: bold;
    }
    
    .card-value.success {
      color: var(--success);
    }
    
    .card-value.warning {
      color: var(--warning);
    }
    
    .card-value.danger {
      color: var(--danger);
    }
    
    .progress-bar {
      height: 8px;
      background-color: var(--border);
      border-radius: 4px;
      margin-top: 0.5rem;
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      background-color: var(--primary);
      border-radius: 4px;
    }
    
    .module-section {
      margin-bottom: 3rem;
    }
    
    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    
    .module-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }
    
    .module-stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .module-stat.passed {
      color: var(--success);
    }
    
    .module-stat.failed {
      color: var(--danger);
    }
    
    .module-stat.skipped {
      color: var(--warning);
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status-badge.passed {
      background-color: rgba(22, 163, 74, 0.1);
      color: var(--success);
    }
    
    .status-badge.failed {
      background-color: rgba(220, 38, 38, 0.1);
      color: var(--danger);
    }
    
    .status-badge.skipped {
      background-color: rgba(202, 138, 4, 0.1);
      color: var(--warning);
    }
    
    .status-badge.error {
      background-color: rgba(220, 38, 38, 0.1);
      color: var(--danger);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    th {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 2px solid var(--border);
      font-weight: 600;
    }
    
    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    
    tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .error-message {
      background-color: rgba(220, 38, 38, 0.05);
      border-left: 3px solid var(--danger);
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      max-height: 100px;
      overflow-y: auto;
    }
    
    .tab-container {
      margin-bottom: 2rem;
    }
    
    .tab-buttons {
      display: flex;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    
    .tab-button {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: var(--text-light);
    }
    
    .tab-button.active {
      border-bottom-color: var(--primary);
      color: var(--primary);
      font-weight: 600;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    footer {
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      margin-top: 2rem;
      color: var(--text-light);
      font-size: 0.875rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Informe Completo de Pruebas - ShieldCuisine</h1>
      <div class="timestamp">Generado el ${new Date().toLocaleString()}</div>
    </div>
  </header>
  
  <div class="container">
    <section class="summary-section">
      <h2>Resumen de pruebas</h2>
      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Pruebas totales</div>
          <div class="card-value">${summary.total}</div>
        </div>
        <div class="card">
          <div class="card-label">Exitosas</div>
          <div class="card-value success">${summary.passed}</div>
        </div>
        <div class="card">
          <div class="card-label">Fallidas</div>
          <div class="card-value danger">${summary.failed}</div>
        </div>
        <div class="card">
          <div class="card-label">Omitidas</div>
          <div class="card-value warning">${summary.skipped}</div>
        </div>
        <div class="card">
          <div class="card-label">Tasa de éxito</div>
          <div class="card-value ${successRate > 80 ? 'success' : successRate > 60 ? 'warning' : 'danger'}">${successRate}%</div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${successRate}%"></div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="modules-section">
      <h2>Resultados por módulo</h2>
      
      <div class="tab-container">
        <div class="tab-buttons">
          ${Object.keys(testResults.modules).map((moduleName, index) => `
            <button class="tab-button ${index === 0 ? 'active' : ''}" onclick="openTab(event, '${moduleName.replace(/\s+/g, '')}')">${moduleName}</button>
          `).join('')}
        </div>
        
        ${Object.entries(testResults.modules).map(([moduleName, moduleData], index) => `
          <div id="${moduleName.replace(/\s+/g, '')}" class="tab-content ${index === 0 ? 'active' : ''}">
            <div class="module-header">
              <h3>${moduleName}</h3>
              ${moduleData.status === 'error' ? `
                <span class="status-badge error">Error</span>
              ` : `
                <div class="module-stats">
                  <div class="module-stat passed">✓ ${moduleData.summary?.passed || 0}</div>
                  <div class="module-stat failed">✗ ${moduleData.summary?.failed || 0}</div>
                  <div class="module-stat skipped">⚠ ${moduleData.summary?.skipped || 0}</div>
                </div>
              `}
            </div>
            
            ${moduleData.status === 'error' ? `
              <div class="error-message">${moduleData.error || 'Error desconocido'}</div>
            ` : `
              <table>
                <thead>
                  <tr>
                    <th>Prueba</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(moduleData.tests || {}).map(([testName, testData]) => `
                    <tr>
                      <td>${testName}</td>
                      <td>
                        <span class="status-badge ${testData.status}">
                          ${testData.status}
                        </span>
                      </td>
                      <td>
                        ${testData.error ? `
                          <div class="error-message">${testData.error}</div>
                        ` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        `).join('')}
      </div>
    </section>
  </div>
  
  <footer>
    <div class="container">
      <p>ShieldCuisine Automation Testing Framework</p>
      <p>© ${new Date().getFullYear()} Shield Cuisine. Todos los derechos reservados.</p>
    </div>
  </footer>
  
  <script>
    function openTab(evt, tabName) {
      // Ocultar todos los contenidos de pestañas
      var tabContents = document.getElementsByClassName("tab-content");
      for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
      }
      
      // Desactivar todos los botones
      var tabButtons = document.getElementsByClassName("tab-button");
      for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
      }
      
      // Mostrar el contenido de la pestaña actual y activar el botón
      document.getElementById(tabName).classList.add("active");
      evt.currentTarget.classList.add("active");
    }
  </script>
</body>
</html>  
  `;
  
  fs.writeFileSync(config.htmlReportPath, html);
  console.log(`✅ Informe HTML generado en: ${config.htmlReportPath}`);
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function runAllTests() {
  console.log('\n🧪 INICIANDO PRUEBAS COMPLETAS DE SHIELDCUISINE 🧪');
  console.log('==================================================');
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🖥️ Modo: ${config.headless ? 'Sin interfaz (headless)' : 'Con interfaz gráfica'}`);
  console.log('==================================================\n');
  
  const startTime = Date.now();
  
  // Ejecutar todos los scripts de prueba secuencialmente
  const results = [];
  for (const testScript of config.testsToRun) {
    const result = await runTestScript(testScript);
    results.push(result);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Consolidar resultados
  consolidateResults(results);
  
  // Guardar resultados
  fs.writeFileSync(config.finalReportPath, JSON.stringify(testResults, null, 2));
  
  // Generar informe HTML
  generateHtmlReport();
  
  // Mostrar resumen
  console.log('\n==================================================');
  console.log('📊 RESULTADOS FINALES:');
  console.log('==================================================');
  console.log(`✅ Pruebas exitosas: ${testResults.summary.passed}`);
  console.log(`❌ Pruebas fallidas: ${testResults.summary.failed}`);
  console.log(`⚠️ Pruebas omitidas: ${testResults.summary.skipped}`);
  console.log(`📊 Total ejecutadas: ${testResults.summary.total}`);
  console.log(`⏱️ Tiempo total: ${formatTime(totalTime)}`);
  console.log(`📁 Reporte JSON: ${config.finalReportPath}`);
  console.log(`📄 Reporte HTML: ${config.htmlReportPath}`);
  console.log('==================================================\n');
  
  // Determinar código de salida según resultados
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

/**
 * Formatea tiempo en milisegundos a formato legible
 */
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

// Ejecutar todas las pruebas
runAllTests().catch(error => {
  console.error('❌ Error al ejecutar las pruebas:', error);
  process.exit(1);
});