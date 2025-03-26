// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // Carpeta donde se guardarán las capturas de pantalla, vídeos y trazas
  outputDir: './test-results',

  // Configuración del navegador
  use: {
    // Navegador a utilizar. Opciones: 'chromium', 'firefox', 'webkit'
    browserName: 'chromium',
    
    // Mostrar navegador durante la ejecución (headless: false) o no (headless: true)
    headless: false,
    
    // Ralentizar la ejecución para que sea más visible (en milisegundos)
    slowMo: 50,
    
    // Tamaño de la ventana del navegador
    viewport: { width: 1280, height: 720 },
    
    // Grabar vídeo de las pruebas
    video: 'on-first-retry',
    
    // Grabar trazas de las pruebas
    trace: 'on-first-retry',
    
    // Capturas de pantalla al fallar
    screenshot: 'only-on-failure',
  },

  // Configuración de la ejecución de los tests
  testDir: './scripts',
  testMatch: 'test-automation.js',
  timeout: 60000,
  
  // Número de reintentos en caso de fallo
  retries: 1,
  
  // Número de trabajadores en paralelo (1 para evitar problemas de estado)
  workers: 1,
  
  // Gestión de metadatos de informes
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['json', { outputFile: './test-results/report.json' }],
    ['list']
  ],
};

module.exports = config;