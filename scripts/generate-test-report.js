#!/usr/bin/env node

/**
 * Script para generar un informe visual de resultados de pruebas
 * 
 * Este script toma el archivo JSON de resultados y genera un informe HTML
 * con estadísticas, gráficos y detalles de cada prueba ejecutada.
 * 
 * Uso:
 *   node generate-test-report.js [ruta-del-informe-json] [ruta-destino-html]
 */

const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  inputPath: process.argv[2] || path.join(__dirname, '../test-results/report.json'),
  outputPath: process.argv[3] || path.join(__dirname, '../test-results/report.html'),
  title: 'Informe de Pruebas Automatizadas - ShieldCuisine'
};

// Verificar que existe el archivo de resultados
if (!fs.existsSync(config.inputPath)) {
  console.error(`Error: No se encontró el archivo de resultados en ${config.inputPath}`);
  process.exit(1);
}

// Leer resultados
const testResults = JSON.parse(fs.readFileSync(config.inputPath, 'utf8'));

// Generar contenido HTML
function generateHTML(results) {
  // Calcular estadísticas
  const { summary } = results;
  const successRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
  
  // Preparar datos para gráficos
  const moduleData = Object.entries(results.modules).map(([name, data]) => {
    return {
      name,
      passed: data.passed || 0,
      failed: data.failed || 0,
      skipped: data.skipped || 0,
      total: (data.passed || 0) + (data.failed || 0) + (data.skipped || 0)
    };
  });
  
  // Generar HTML
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
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
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
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
    
    .screenshot {
      max-width: 200px;
      max-height: 150px;
      border: 1px solid var(--border);
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    .error-message {
      background-color: rgba(220, 38, 38, 0.05);
      border-left: 3px solid var(--danger);
      padding: 0.75rem;
      font-family: monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      max-height: 150px;
      overflow-y: auto;
    }
    
    footer {
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      margin-top: 2rem;
      color: var(--text-light);
      font-size: 0.875rem;
      text-align: center;
    }
    
    /* Estilos para el modal de imagen */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }
    
    .modal-content {
      max-width: 90%;
      max-height: 90%;
    }
    
    .modal-close {
      position: absolute;
      top: 20px;
      right: 30px;
      color: white;
      font-size: 30px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${config.title}</h1>
      <div class="timestamp">Generado el ${new Date().toLocaleString()} • Pruebas ejecutadas el ${new Date(results.timestamp).toLocaleString()}</div>
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
      
      ${moduleData.map(module => {
        // Obtener pruebas del módulo
        const moduleTests = results.modules[module.name].tests;
        const moduleTestsArray = Object.entries(moduleTests).map(([name, data]) => {
          return { name, ...data };
        });
        
        return `
        <div class="module-section">
          <div class="module-header">
            <h3>${module.name}</h3>
            <div class="module-stats">
              <div class="module-stat passed">✓ ${module.passed}</div>
              <div class="module-stat failed">✗ ${module.failed}</div>
              <div class="module-stat skipped">⚠ ${module.skipped}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Prueba</th>
                <th>Estado</th>
                <th>Tiempo</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              ${moduleTestsArray.map(test => `
                <tr>
                  <td>${test.name}</td>
                  <td>
                    <span class="status-badge ${test.status}">
                      ${test.status}
                    </span>
                  </td>
                  <td>${formatTimestamp(test.timestamp)}</td>
                  <td>
                    ${test.screenshot ? `
                      <img 
                        src="../${test.screenshot.replace(/^\.\.\//, '')}" 
                        alt="Screenshot de ${test.name}" 
                        class="screenshot"
                        onclick="openModal('../${test.screenshot.replace(/^\.\.\//, '')}')"
                      />
                    ` : ''}
                    
                    ${test.error ? `
                      <div class="error-message">${test.error}</div>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
      }).join('')}
    </section>
  </div>
  
  <footer>
    <div class="container">
      <p>ShieldCuisine Automation Testing Framework</p>
      <p>© ${new Date().getFullYear()} Shield Cuisine. Todos los derechos reservados.</p>
    </div>
  </footer>
  
  <!-- Modal para visualizar capturas -->
  <div class="modal" id="imageModal">
    <span class="modal-close" onclick="closeModal()">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>
  
  <script>
    // Funciones para el modal de imagen
    function openModal(imgSrc) {
      const modal = document.getElementById('imageModal');
      const modalImg = document.getElementById('modalImage');
      modal.style.display = 'flex';
      modalImg.src = imgSrc;
    }
    
    function closeModal() {
      document.getElementById('imageModal').style.display = 'none';
    }
    
    // Cerrar modal al hacer clic fuera de la imagen
    window.onclick = function(event) {
      const modal = document.getElementById('imageModal');
      if (event.target === modal) {
        closeModal();
      }
    }
  </script>
</body>
</html>
  `;
  
  return html;
}

// Función para formatear timestamps
function formatTimestamp(isoTimestamp) {
  const date = new Date(isoTimestamp);
  return date.toLocaleTimeString();
}

// Escribir el archivo de salida
try {
  const htmlContent = generateHTML(testResults);
  fs.writeFileSync(config.outputPath, htmlContent);
  console.log(`✅ Informe HTML generado correctamente en: ${config.outputPath}`);
} catch (error) {
  console.error('❌ Error al generar el informe HTML:', error);
  process.exit(1);
}