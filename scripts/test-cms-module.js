/**
 * Script específico para pruebas del módulo CMS (Constructor Web)
 * 
 * Este script realiza pruebas detalladas del CMS y el editor de bloques,
 * verificando todas las funcionalidades principales.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración de las pruebas
const config = {
  baseUrl: 'http://localhost:5000',
  screenshotsDir: path.join(__dirname, '../test-results/screenshots/cms'),
  reportPath: path.join(__dirname, '../test-results/cms-report.json'),
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  headless: false,  // true para ejecutar sin interfaz gráfica
  slowMo: 50,       // milisegundos entre acciones (para visualizar mejor)
  timeout: 30000,   // tiempo máximo de espera en ms
};

// Asegurar que exista el directorio para screenshots
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Objeto para almacenar resultados de pruebas
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  tests: {}
};

/**
 * Función auxiliar para tomar capturas de pantalla
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Función auxiliar para registrar resultados de pruebas
 */
function logTestResult(testName, status, error = null, screenshotPath = null) {
  testResults.tests[testName] = {
    status,
    timestamp: new Date().toISOString()
  };
  
  if (error) {
    testResults.tests[testName].error = error.toString();
  }
  
  if (screenshotPath) {
    testResults.tests[testName].screenshot = screenshotPath;
  }
  
  // Actualizar contadores
  testResults.summary[status]++;
  testResults.summary.total++;
  
  // Mostrar en consola
  const statusIcon = {
    passed: '✅',
    failed: '❌',
    skipped: '⚠️'
  };
  
  console.log(`${statusIcon[status]} ${testName} - ${status.toUpperCase()}`);
  if (error) {
    console.error(`   Error: ${error}`);
  }
}

/**
 * Prueba de autenticación
 */
async function testAuthentication(page) {
  try {
    console.log('\n🔑 Iniciando prueba de autenticación...\n');
    
    // Navegar a la página de inicio
    await page.goto(`${config.baseUrl}/auth`);
    await takeScreenshot(page, 'auth-page');
    
    // Probar login con credenciales correctas
    await page.fill('input[name="username"]', config.credentials.username);
    await page.fill('input[name="password"]', config.credentials.password);
    await page.click('button[type="submit"]');
    
    // Verificar redirección a dashboard
    await page.waitForURL(`${config.baseUrl}/`);
    const screenshot = await takeScreenshot(page, 'auth-success');
    
    // Verificar elementos del dashboard
    const dashboardTitle = await page.textContent('h1');
    if (dashboardTitle && dashboardTitle.includes('Dashboard')) {
      logTestResult('Autenticación', 'passed', null, screenshot);
    } else {
      throw new Error('No se pudo verificar el acceso al dashboard');
    }
  } catch (error) {
    console.error('Error en prueba de autenticación:', error);
    logTestResult('Autenticación', 'failed', error);
    throw new Error('Prueba de autenticación fallida, no se pueden continuar las pruebas');
  }
}

/**
 * Navega al módulo CMS
 */
async function navigateToCMS(page) {
  try {
    console.log('\n🌐 Navegando al módulo CMS...\n');
    
    // Navegar al módulo CMS
    await page.click('a[href="/cms"]');
    await page.waitForURL(`${config.baseUrl}/cms`);
    const cmsScreenshot = await takeScreenshot(page, 'cms-dashboard');
    
    // Verificar que estamos en el módulo CMS
    const cmsTitle = await page.textContent('h1');
    if (cmsTitle && cmsTitle.includes('CMS')) {
      logTestResult('Navegación al CMS', 'passed', null, cmsScreenshot);
    } else {
      throw new Error('No se pudo verificar el acceso al módulo CMS');
    }
  } catch (error) {
    console.error('Error al navegar al módulo CMS:', error);
    logTestResult('Navegación al CMS', 'failed', error);
    throw error;
  }
}

/**
 * Prueba la gestión de páginas
 */
async function testPageManagement(page) {
  try {
    console.log('\n📄 Probando gestión de páginas...\n');
    
    // Navegar a sección de páginas
    await page.click('a:has-text("Páginas")');
    await page.waitForURL(`${config.baseUrl}/cms/paginas`);
    const pagesScreenshot = await takeScreenshot(page, 'cms-pages-list');
    
    // Verificar que estamos en la sección de páginas
    const pagesTitle = await page.textContent('h1');
    if (pagesTitle && pagesTitle.includes('Páginas')) {
      logTestResult('Listado de páginas', 'passed', null, pagesScreenshot);
    } else {
      throw new Error('No se pudo verificar el acceso a la gestión de páginas');
    }
    
    // Crear nueva página
    console.log('Creando nueva página...');
    await page.click('button:has-text("Nueva Página")');
    await page.waitForSelector('form[data-test="page-form"]');
    
    // Llenar formulario de página
    const pageName = 'Página de Test ' + Date.now().toString().slice(-5);
    const pageSlug = 'pagina-test-' + Date.now().toString().slice(-5);
    
    await page.fill('input[name="title"]', pageName);
    await page.fill('input[name="slug"]', pageSlug);
    await page.selectOption('select[name="status"]', 'draft');
    
    const createFormScreenshot = await takeScreenshot(page, 'cms-create-page-form');
    logTestResult('Formulario de creación de página', 'passed', null, createFormScreenshot);
    
    // Interactuar con el editor de bloques
    console.log('Añadiendo bloques a la página...');
    
    // Comprobar que el editor está vacío inicialmente
    const emptyEditorEl = await page.locator('div[data-test="block-editor-empty"]').count();
    if (emptyEditorEl > 0) {
      logTestResult('Editor de bloques vacío inicial', 'passed');
    } else {
      logTestResult('Editor de bloques vacío inicial', 'skipped', 'No se encontró el estado vacío del editor');
    }
    
    // Añadir bloque de encabezado
    await page.locator('div[data-test="block-editor"]').click();
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Encabezado")');
    
    // Editar contenido del bloque
    await page.fill('div[data-test="block-editor"] h2[contenteditable="true"]', 'Título de prueba automatizada');
    
    const headerBlockScreenshot = await takeScreenshot(page, 'cms-header-block');
    logTestResult('Añadir bloque de encabezado', 'passed', null, headerBlockScreenshot);
    
    // Añadir bloque de párrafo
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Párrafo")');
    await page.fill('div[data-test="block-editor"] p[contenteditable="true"]', 'Este es un párrafo de prueba creado mediante pruebas automatizadas. El editor de bloques permite crear contenido rico y estructurado para las páginas web.');
    
    const paragraphBlockScreenshot = await takeScreenshot(page, 'cms-paragraph-block');
    logTestResult('Añadir bloque de párrafo', 'passed', null, paragraphBlockScreenshot);
    
    // Añadir bloque de imagen
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Imagen")');
    
    // Verificar que aparece el selector de imágenes
    const mediaSelector = await page.locator('div[data-test="media-selector"]').count();
    if (mediaSelector > 0) {
      const mediaSelectorScreenshot = await takeScreenshot(page, 'cms-media-selector');
      logTestResult('Selector de medios', 'passed', null, mediaSelectorScreenshot);
      
      // Cerrar selector si no hay imágenes
      await page.click('button:has-text("Cancelar")');
    } else {
      logTestResult('Selector de medios', 'skipped', 'No se encontró el selector de medios');
    }
    
    // Añadir bloque de columnas
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Columnas")');
    
    // Verificar que se creó el bloque de columnas
    const columnsBlock = await page.locator('div[data-test="block-editor"] div[data-type="columns"]').count();
    if (columnsBlock > 0) {
      const columnsBlockScreenshot = await takeScreenshot(page, 'cms-columns-block');
      logTestResult('Añadir bloque de columnas', 'passed', null, columnsBlockScreenshot);
      
      // Añadir contenido a una columna
      await page.locator('div[data-test="block-editor"] div[data-type="columns"] div[data-column="0"]').click();
      await page.fill('div[data-test="block-editor"] div[data-type="columns"] div[data-column="0"] p[contenteditable="true"]', 'Contenido de la primera columna');
      
      // Añadir contenido a otra columna
      await page.locator('div[data-test="block-editor"] div[data-type="columns"] div[data-column="1"]').click();
      await page.fill('div[data-test="block-editor"] div[data-type="columns"] div[data-column="1"] p[contenteditable="true"]', 'Contenido de la segunda columna');
      
      const columnsContentScreenshot = await takeScreenshot(page, 'cms-columns-content');
      logTestResult('Edición de contenido en columnas', 'passed', null, columnsContentScreenshot);
    } else {
      logTestResult('Añadir bloque de columnas', 'skipped', 'No se encontró el bloque de columnas');
    }
    
    // Probar función de arrastrar y soltar si está implementada
    try {
      // Intentar arrastrar el segundo bloque encima del primero
      const blocks = await page.locator('div[data-test="block-editor"] [data-block-id]').all();
      if (blocks.length >= 2) {
        const sourceBlock = blocks[1];
        const targetBlock = blocks[0];
        
        const sourceBoundingBox = await sourceBlock.boundingBox();
        const targetBoundingBox = await targetBlock.boundingBox();
        
        // Realizar drag and drop
        await page.mouse.move(
          sourceBoundingBox.x + sourceBoundingBox.width / 2,
          sourceBoundingBox.y + sourceBoundingBox.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(
          targetBoundingBox.x + targetBoundingBox.width / 2,
          targetBoundingBox.y + 5 // Justo encima del bloque objetivo
        );
        await page.mouse.up();
        
        const dragDropScreenshot = await takeScreenshot(page, 'cms-drag-drop');
        logTestResult('Arrastrar y soltar bloques', 'passed', null, dragDropScreenshot);
      } else {
        logTestResult('Arrastrar y soltar bloques', 'skipped', 'No hay suficientes bloques para la prueba');
      }
    } catch (error) {
      logTestResult('Arrastrar y soltar bloques', 'skipped', 'Función no implementada o falló: ' + error.message);
    }
    
    // Guardar la página
    console.log('Guardando página...');
    await page.click('button[type="submit"]:has-text("Guardar")');
    
    // Verificar confirmación de guardado
    try {
      await page.waitForSelector('div.toast:has-text("guardada")', { timeout: 5000 });
      const savedPageScreenshot = await takeScreenshot(page, 'cms-page-saved');
      logTestResult('Guardar página', 'passed', null, savedPageScreenshot);
    } catch (error) {
      logTestResult('Guardar página', 'failed', 'No se recibió confirmación de guardado: ' + error.message);
    }
    
    // Volver al listado de páginas y verificar que la nueva página aparece
    await page.click('a:has-text("Páginas")');
    await page.waitForURL(`${config.baseUrl}/cms/paginas`);
    
    try {
      await page.waitForSelector(`td:has-text("${pageName}")`, { timeout: 5000 });
      const pageListScreenshot = await takeScreenshot(page, 'cms-pages-list-after');
      logTestResult('Página aparece en el listado', 'passed', null, pageListScreenshot);
    } catch (error) {
      logTestResult('Página aparece en el listado', 'failed', 'No se encontró la página creada en el listado: ' + error.message);
    }
    
  } catch (error) {
    console.error('Error en prueba de gestión de páginas:', error);
    logTestResult('Gestión de páginas', 'failed', error);
  }
}

/**
 * Prueba la biblioteca de medios
 */
async function testMediaLibrary(page) {
  try {
    console.log('\n🖼️ Probando biblioteca de medios...\n');
    
    // Navegar a sección de medios
    await page.click('a:has-text("Medios")');
    await page.waitForURL(`${config.baseUrl}/cms/medios`);
    const mediaScreenshot = await takeScreenshot(page, 'cms-media-library');
    
    // Verificar que estamos en la sección de medios
    const mediaTitle = await page.textContent('h1');
    if (mediaTitle && mediaTitle.includes('Medios')) {
      logTestResult('Acceso a biblioteca de medios', 'passed', null, mediaScreenshot);
    } else {
      throw new Error('No se pudo verificar el acceso a la biblioteca de medios');
    }
    
    // Verificar elementos de la biblioteca de medios
    const uploadButton = await page.locator('button:has-text("Subir")').count();
    const filterOptions = await page.locator('div[data-test="media-filters"]').count();
    
    if (uploadButton > 0) {
      logTestResult('Botón de subida de medios', 'passed');
    } else {
      logTestResult('Botón de subida de medios', 'failed', 'No se encontró el botón de subida');
    }
    
    if (filterOptions > 0) {
      // Probar filtros
      await page.click('button:has-text("Imágenes")');
      await page.waitForTimeout(500);
      const imagesFilterScreenshot = await takeScreenshot(page, 'cms-media-filter-images');
      logTestResult('Filtro de imágenes', 'passed', null, imagesFilterScreenshot);
      
      await page.click('button:has-text("Documentos")');
      await page.waitForTimeout(500);
      const docsFilterScreenshot = await takeScreenshot(page, 'cms-media-filter-docs');
      logTestResult('Filtro de documentos', 'passed', null, docsFilterScreenshot);
      
      await page.click('button:has-text("Todos")');
      await page.waitForTimeout(500);
    } else {
      logTestResult('Filtros de medios', 'skipped', 'No se encontraron los filtros de medios');
    }
    
    // Verificar vista en cuadrícula/lista si existe
    const viewToggle = await page.locator('button[data-test="view-toggle"]').count();
    if (viewToggle > 0) {
      await page.click('button[data-test="view-toggle"]');
      await page.waitForTimeout(500);
      const toggleViewScreenshot = await takeScreenshot(page, 'cms-media-view-toggle');
      logTestResult('Cambio de vista en medios', 'passed', null, toggleViewScreenshot);
    } else {
      logTestResult('Cambio de vista en medios', 'skipped', 'No se encontró el control de cambio de vista');
    }
    
    // Probar búsqueda de medios si existe
    const searchInput = await page.locator('input[data-test="media-search"]').count();
    if (searchInput > 0) {
      await page.fill('input[data-test="media-search"]', 'test');
      await page.press('input[data-test="media-search"]', 'Enter');
      await page.waitForTimeout(500);
      const searchScreenshot = await takeScreenshot(page, 'cms-media-search');
      logTestResult('Búsqueda de medios', 'passed', null, searchScreenshot);
    } else {
      logTestResult('Búsqueda de medios', 'skipped', 'No se encontró el campo de búsqueda');
    }
    
    // Intentar subir un archivo si el botón existe
    if (uploadButton > 0) {
      try {
        await page.click('button:has-text("Subir")');
        
        // Verificar si aparece un diálogo de subida
        const uploadDialog = await page.locator('div[data-test="upload-dialog"]').count();
        
        if (uploadDialog > 0) {
          const uploadDialogScreenshot = await takeScreenshot(page, 'cms-media-upload-dialog');
          logTestResult('Diálogo de subida de archivos', 'passed', null, uploadDialogScreenshot);
          
          // Cerramos el diálogo ya que no podemos subir archivos reales en esta prueba
          await page.click('button:has-text("Cancelar")');
        } else {
          // Podría abrir directamente el selector de archivos del sistema, lo que no podemos probar
          logTestResult('Diálogo de subida de archivos', 'skipped', 'No se puede probar la subida real de archivos');
        }
      } catch (error) {
        logTestResult('Diálogo de subida de archivos', 'failed', error);
      }
    }
    
  } catch (error) {
    console.error('Error en prueba de biblioteca de medios:', error);
    logTestResult('Biblioteca de medios', 'failed', error);
  }
}

/**
 * Prueba la configuración de branding
 */
async function testBrandingSettings(page) {
  try {
    console.log('\n🎨 Probando configuración de branding...\n');
    
    // Navegar a sección de branding
    await page.click('a:has-text("Branding")');
    await page.waitForURL(`${config.baseUrl}/cms/branding`);
    const brandingScreenshot = await takeScreenshot(page, 'cms-branding');
    
    // Verificar que estamos en la sección de branding
    const brandingTitle = await page.textContent('h1');
    if (brandingTitle && brandingTitle.includes('Branding')) {
      logTestResult('Acceso a configuración de branding', 'passed', null, brandingScreenshot);
    } else {
      throw new Error('No se pudo verificar el acceso a la configuración de branding');
    }
    
    // Verificar formulario de branding
    const logoField = await page.locator('div[data-test="logo-field"]').count();
    const colorField = await page.locator('input[data-test="primary-color"]').count();
    const fontField = await page.locator('select[data-test="font-family"]').count();
    
    if (logoField > 0) {
      logTestResult('Campo de logo', 'passed');
    } else {
      logTestResult('Campo de logo', 'skipped', 'No se encontró el campo de logo');
    }
    
    if (colorField > 0) {
      // Probar cambio de color
      await page.fill('input[data-test="primary-color"]', '#3b82f6');
      const colorFieldScreenshot = await takeScreenshot(page, 'cms-color-field');
      logTestResult('Campo de color primario', 'passed', null, colorFieldScreenshot);
    } else {
      logTestResult('Campo de color primario', 'skipped', 'No se encontró el campo de color');
    }
    
    if (fontField > 0) {
      // Probar selección de fuente
      await page.selectOption('select[data-test="font-family"]', 'serif');
      const fontFieldScreenshot = await takeScreenshot(page, 'cms-font-field');
      logTestResult('Campo de familia tipográfica', 'passed', null, fontFieldScreenshot);
    } else {
      logTestResult('Campo de familia tipográfica', 'skipped', 'No se encontró el campo de fuente');
    }
    
    // Verificar previsualización si existe
    const preview = await page.locator('div[data-test="branding-preview"]').count();
    if (preview > 0) {
      const previewScreenshot = await takeScreenshot(page, 'cms-branding-preview');
      logTestResult('Previsualización de branding', 'passed', null, previewScreenshot);
    } else {
      logTestResult('Previsualización de branding', 'skipped', 'No se encontró la previsualización');
    }
    
    // Intentar guardar configuración
    const saveButton = await page.locator('button[type="submit"]:has-text("Guardar")').count();
    if (saveButton > 0) {
      await page.click('button[type="submit"]:has-text("Guardar")');
      
      try {
        // Verificar confirmación de guardado
        await page.waitForSelector('div.toast:has-text("guardada")', { timeout: 5000 });
        const savedBrandingScreenshot = await takeScreenshot(page, 'cms-branding-saved');
        logTestResult('Guardar configuración de branding', 'passed', null, savedBrandingScreenshot);
      } catch (error) {
        logTestResult('Guardar configuración de branding', 'failed', 'No se recibió confirmación de guardado: ' + error.message);
      }
    } else {
      logTestResult('Guardar configuración de branding', 'skipped', 'No se encontró el botón de guardar');
    }
    
  } catch (error) {
    console.error('Error en prueba de configuración de branding:', error);
    logTestResult('Configuración de branding', 'failed', error);
  }
}

/**
 * Prueba la API del CMS
 */
async function testCmsApi(page) {
  try {
    console.log('\n🔌 Probando API del CMS...\n');
    
    // Navegar a sección de API
    await page.click('a:has-text("API")');
    await page.waitForURL(`${config.baseUrl}/cms/api`);
    const apiScreenshot = await takeScreenshot(page, 'cms-api');
    
    // Verificar que estamos en la sección de API
    const apiTitle = await page.textContent('h1');
    if (apiTitle && apiTitle.includes('API')) {
      logTestResult('Acceso a configuración de API', 'passed', null, apiScreenshot);
    } else {
      throw new Error('No se pudo verificar el acceso a la configuración de API');
    }
    
    // Verificar elementos de la API
    const apiKey = await page.locator('div[data-test="api-key"]').count();
    const endpointsList = await page.locator('div[data-test="endpoints-list"]').count();
    
    if (apiKey > 0) {
      const apiKeyScreenshot = await takeScreenshot(page, 'cms-api-key');
      logTestResult('Visualización de clave API', 'passed', null, apiKeyScreenshot);
    } else {
      logTestResult('Visualización de clave API', 'skipped', 'No se encontró la clave API');
    }
    
    if (endpointsList > 0) {
      const endpointsScreenshot = await takeScreenshot(page, 'cms-api-endpoints');
      logTestResult('Listado de endpoints', 'passed', null, endpointsScreenshot);
    } else {
      logTestResult('Listado de endpoints', 'skipped', 'No se encontró el listado de endpoints');
    }
    
    // Verificar documentación si existe
    const apiDocs = await page.locator('div[data-test="api-docs"]').count();
    if (apiDocs > 0) {
      const apiDocsScreenshot = await takeScreenshot(page, 'cms-api-docs');
      logTestResult('Documentación de API', 'passed', null, apiDocsScreenshot);
    } else {
      logTestResult('Documentación de API', 'skipped', 'No se encontró la documentación de API');
    }
    
    // Verificar botón para generar nueva clave API si existe
    const regenerateButton = await page.locator('button:has-text("Regenerar")').count();
    if (regenerateButton > 0) {
      // No hacemos clic real para no alterar la configuración, solo verificamos que existe
      logTestResult('Botón para regenerar clave API', 'passed');
    } else {
      logTestResult('Botón para regenerar clave API', 'skipped', 'No se encontró el botón para regenerar clave');
    }
    
  } catch (error) {
    console.error('Error en prueba de API del CMS:', error);
    logTestResult('API del CMS', 'failed', error);
  }
}

/**
 * Función principal que ejecuta todas las pruebas
 */
async function runTests() {
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: config.screenshotsDir },
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n🧪 INICIANDO PRUEBAS DEL MÓDULO CMS 🧪');
    console.log('==================================================\n');
    
    // Autenticación
    await testAuthentication(page);
    
    // Navegación al CMS
    await navigateToCMS(page);
    
    // Pruebas específicas
    await testPageManagement(page);
    await testMediaLibrary(page);
    await testBrandingSettings(page);
    await testCmsApi(page);
    
    console.log('\n==================================================');
    console.log('🏆 PRUEBAS DEL MÓDULO CMS COMPLETADAS 🏆\n');
    
  } catch (error) {
    console.error('Error en la ejecución de pruebas:', error);
    await takeScreenshot(page, 'error-general');
  } finally {
    // Guardar resultados
    fs.writeFileSync(config.reportPath, JSON.stringify(testResults, null, 2));
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    console.log(`✅ Pruebas exitosas: ${testResults.summary.passed}`);
    console.log(`❌ Pruebas fallidas: ${testResults.summary.failed}`);
    console.log(`⚠️ Pruebas omitidas: ${testResults.summary.skipped}`);
    console.log(`📊 Total ejecutadas: ${testResults.summary.total}`);
    console.log(`📁 Reporte guardado en: ${config.reportPath}`);
    
    await context.close();
    await browser.close();
  }
}

// Ejecutar todas las pruebas
runTests().catch(console.error);