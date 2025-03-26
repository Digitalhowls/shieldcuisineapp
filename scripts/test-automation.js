/**
 * Script de automatización de pruebas para ShieldCuisine
 * 
 * Este script permite ejecutar pruebas automatizadas en todos los módulos
 * de la aplicación, simulando las acciones de un usuario real.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const moduleTests = require('./modules-test-index');

// Configuración de las pruebas
const config = {
  baseUrl: 'http://localhost:5000',
  screenshotsDir: path.join(__dirname, '../test-results/screenshots'),
  reportPath: path.join(__dirname, '../test-results/report.json'),
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
  modules: {}
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
function logTestResult(module, testName, status, error = null, screenshotPath = null) {
  if (!testResults.modules[module]) {
    testResults.modules[module] = {
      tests: {},
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }
  
  testResults.modules[module].tests[testName] = {
    status,
    timestamp: new Date().toISOString()
  };
  
  if (error) {
    testResults.modules[module].tests[testName].error = error.toString();
  }
  
  if (screenshotPath) {
    testResults.modules[module].tests[testName].screenshot = screenshotPath;
  }
  
  // Actualizar contadores
  testResults.modules[module][status]++;
  testResults.summary[status]++;
  testResults.summary.total++;
  
  // Mostrar en consola
  const statusIcon = {
    passed: '✅',
    failed: '❌',
    skipped: '⚠️'
  };
  
  console.log(`${statusIcon[status]} [${module}] ${testName} - ${status.toUpperCase()}`);
  if (error) {
    console.error(`   Error: ${error}`);
  }
}

/**
 * Prueba de autenticación
 */
async function testAuthentication(page) {
  const moduleName = 'Autenticación';
  console.log(`\n🔑 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
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
      logTestResult(moduleName, 'Login con credenciales correctas', 'passed', null, screenshot);
    } else {
      throw new Error('No se pudo verificar el acceso al dashboard');
    }
    
    // Probar logout
    await page.click('button[aria-label="Cerrar sesión"]');
    await page.waitForURL(`${config.baseUrl}/auth`);
    const logoutScreenshot = await takeScreenshot(page, 'auth-logout');
    logTestResult(moduleName, 'Cierre de sesión', 'passed', null, logoutScreenshot);
    
    // Iniciar sesión de nuevo para el resto de pruebas
    await page.fill('input[name="username"]', config.credentials.username);
    await page.fill('input[name="password"]', config.credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${config.baseUrl}/`);
    
  } catch (error) {
    console.error('Error en prueba de autenticación:', error);
    logTestResult(moduleName, 'Login con credenciales correctas', 'failed', error);
    throw new Error('Prueba de autenticación fallida, no se pueden continuar las pruebas');
  }
}

/**
 * Prueba del módulo APPCC
 */
async function testAPPCCModule(page) {
  const moduleName = 'APPCC';
  console.log(`\n🔍 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar al módulo APPCC
    await page.click('a[href="/appcc"]');
    await page.waitForURL(`${config.baseUrl}/appcc`);
    const menuScreenshot = await takeScreenshot(page, 'appcc-menu');
    
    // Verificar listado de controles
    const controlsList = await page.locator('table tbody tr').count();
    if (controlsList > 0) {
      logTestResult(moduleName, 'Listado de controles', 'passed', null, menuScreenshot);
    } else {
      logTestResult(moduleName, 'Listado de controles', 'skipped', 'No hay controles para mostrar');
    }
    
    // Crear nuevo control
    await page.click('button:has-text("Nuevo Control")');
    await page.waitForSelector('form[data-test="control-form"]');
    await page.fill('input[name="name"]', 'Control de Temperaturas Automatizado');
    await page.selectOption('select[name="type"]', 'checklist');
    await page.fill('textarea[name="description"]', 'Control creado mediante prueba automatizada');
    await page.click('button[type="submit"]');
    
    // Verificar creación
    await page.waitForSelector('div.toast:has-text("Control creado")');
    const createScreenshot = await takeScreenshot(page, 'appcc-create');
    logTestResult(moduleName, 'Creación de nuevo control', 'passed', null, createScreenshot);
    
    // Completar control
    await page.click('table tbody tr:first-child button:has-text("Completar")');
    await page.waitForSelector('form[data-test="complete-control"]');
    
    // Llenar secciones del control
    await page.locator('form[data-test="complete-control"] input[type="checkbox"]').first().check();
    await page.fill('form[data-test="complete-control"] textarea:first-of-type', 'Observación de prueba automatizada');
    await page.click('form[data-test="complete-control"] button[type="submit"]');
    
    // Verificar completado
    await page.waitForSelector('div.toast:has-text("Control completado")');
    const completeScreenshot = await takeScreenshot(page, 'appcc-complete');
    logTestResult(moduleName, 'Completar un control', 'passed', null, completeScreenshot);
    
  } catch (error) {
    console.error('Error en prueba de APPCC:', error);
    const errorScreenshot = await takeScreenshot(page, 'appcc-error');
    logTestResult(moduleName, 'Pruebas APPCC', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba del módulo de Inventario
 */
async function testInventoryModule(page) {
  const moduleName = 'Inventario';
  console.log(`\n📦 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar al módulo de Inventario
    await page.click('a[href="/almacen"]');
    await page.waitForURL(`${config.baseUrl}/almacen`);
    const menuScreenshot = await takeScreenshot(page, 'inventory-menu');
    
    // Verificar listado de productos
    const productsList = await page.locator('table tbody tr').count();
    if (productsList > 0) {
      logTestResult(moduleName, 'Listado de productos', 'passed', null, menuScreenshot);
    } else {
      // Si no hay productos, intentar crear uno
      logTestResult(moduleName, 'Listado de productos', 'skipped', 'No hay productos para mostrar');
    }
    
    // Añadir nuevo producto
    await page.click('button:has-text("Nuevo Producto")');
    await page.waitForSelector('form[data-test="product-form"]');
    await page.fill('input[name="name"]', 'Producto de Prueba Automatizado');
    await page.fill('input[name="sku"]', 'AUTO-' + Date.now().toString().slice(-5));
    await page.fill('input[name="price"]', '10.99');
    await page.selectOption('select[name="category"]', '1'); // Primera categoría
    await page.fill('textarea[name="description"]', 'Producto creado mediante prueba automatizada');
    await page.click('button[type="submit"]');
    
    // Verificar creación
    await page.waitForSelector('div.toast:has-text("Producto creado")');
    const createScreenshot = await takeScreenshot(page, 'inventory-create');
    logTestResult(moduleName, 'Añadir nuevo producto', 'passed', null, createScreenshot);
    
    // Actualizar stock
    await page.click('table tbody tr:first-child button:has-text("Ajustar Stock")');
    await page.waitForSelector('form[data-test="stock-form"]');
    await page.fill('input[name="quantity"]', '25');
    await page.fill('textarea[name="notes"]', 'Actualización mediante prueba automatizada');
    await page.click('form[data-test="stock-form"] button[type="submit"]');
    
    // Verificar actualización
    await page.waitForSelector('div.toast:has-text("Stock actualizado")');
    const updateScreenshot = await takeScreenshot(page, 'inventory-update');
    logTestResult(moduleName, 'Actualizar stock', 'passed', null, updateScreenshot);
    
  } catch (error) {
    console.error('Error en prueba de Inventario:', error);
    const errorScreenshot = await takeScreenshot(page, 'inventory-error');
    logTestResult(moduleName, 'Pruebas Inventario', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba del Portal de Transparencia
 */
async function testTransparencyPortal(page) {
  const moduleName = 'Transparencia';
  console.log(`\n🔎 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar a la configuración del portal
    await page.click('a[href="/transparencia"]');
    await page.waitForURL(`${config.baseUrl}/transparencia`);
    const portalScreenshot = await takeScreenshot(page, 'transparency-portal');
    
    // Verificar existencia de controles compartidos
    const sharedControls = await page.locator('table tbody tr').count();
    
    if (sharedControls > 0) {
      logTestResult(moduleName, 'Visualización de controles APPCC', 'passed', null, portalScreenshot);
    } else {
      // Intentar compartir un control si no hay ninguno
      logTestResult(moduleName, 'Visualización de controles APPCC', 'skipped', 'No hay controles compartidos');
      
      // Ir a la sección de compartir
      await page.click('button:has-text("Compartir Control")');
      await page.waitForSelector('form[data-test="share-form"]');
      await page.selectOption('select[name="controlId"]', '1'); // Primer control
      await page.click('input[name="isPublic"]');
      await page.click('button[type="submit"]');
      
      // Verificar compartido
      await page.waitForSelector('div.toast:has-text("Control compartido")');
      const shareScreenshot = await takeScreenshot(page, 'transparency-share');
      logTestResult(moduleName, 'Compartir control', 'passed', null, shareScreenshot);
    }
    
    // Probar acceso al portal público
    await page.goto(`${config.baseUrl}/cliente/portal`);
    await page.waitForSelector('h1:has-text("Portal de Transparencia")');
    const clientScreenshot = await takeScreenshot(page, 'transparency-client');
    logTestResult(moduleName, 'Acceso al portal', 'passed', null, clientScreenshot);
    
    // Volver al dashboard
    await page.goto(`${config.baseUrl}/`);
    
  } catch (error) {
    console.error('Error en prueba de Portal de Transparencia:', error);
    const errorScreenshot = await takeScreenshot(page, 'transparency-error');
    logTestResult(moduleName, 'Pruebas Transparencia', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba de la integración con WooCommerce
 */
async function testWooCommerceIntegration(page) {
  const moduleName = 'WooCommerce';
  console.log(`\n🛒 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar a la configuración de WooCommerce
    await page.click('a[href="/integraciones"]');
    await page.waitForURL(`${config.baseUrl}/integraciones`);
    await page.click('a:has-text("WooCommerce")');
    await page.waitForSelector('h1:has-text("Integración WooCommerce")');
    const wooScreenshot = await takeScreenshot(page, 'woocommerce-config');
    
    // Verificar estado de conexión
    const connectionStatus = await page.textContent('div[data-test="connection-status"]');
    if (connectionStatus && connectionStatus.includes('Conectado')) {
      logTestResult(moduleName, 'Conexión con WooCommerce', 'passed', null, wooScreenshot);
      
      // Probar sincronización
      await page.click('button:has-text("Sincronizar Productos")');
      await page.waitForSelector('div.toast:has-text("Sincronización iniciada")');
      const syncScreenshot = await takeScreenshot(page, 'woocommerce-sync');
      logTestResult(moduleName, 'Sincronización de productos', 'passed', null, syncScreenshot);
      
    } else {
      // Si no está conectado, intentar configurar
      logTestResult(moduleName, 'Conexión con WooCommerce', 'skipped', 'WooCommerce no está configurado');
      
      // Llenar formulario de conexión
      await page.fill('input[name="url"]', 'https://ejemplotienda.com');
      await page.fill('input[name="consumerKey"]', 'ck_test');
      await page.fill('input[name="consumerSecret"]', 'cs_test');
      await page.click('button[type="submit"]:has-text("Guardar")');
      
      // Asumir que falló porque no son credenciales reales
      const configScreenshot = await takeScreenshot(page, 'woocommerce-config-attempt');
      logTestResult(moduleName, 'Configuración de WooCommerce', 'skipped', 'Requiere credenciales reales', configScreenshot);
    }
    
  } catch (error) {
    console.error('Error en prueba de WooCommerce:', error);
    const errorScreenshot = await takeScreenshot(page, 'woocommerce-error');
    logTestResult(moduleName, 'Pruebas WooCommerce', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba de la integración bancaria
 */
async function testBankingIntegration(page) {
  const moduleName = 'Bancario';
  console.log(`\n💰 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar a la sección bancaria
    await page.click('a[href="/banca"]');
    await page.waitForURL(`${config.baseUrl}/banca`);
    const bankingScreenshot = await takeScreenshot(page, 'banking-dashboard');
    
    // Verificar estado de conexión
    const connectionStatus = await page.textContent('div[data-test="banking-status"]');
    if (connectionStatus && connectionStatus.includes('Conectado')) {
      logTestResult(moduleName, 'Conexión con API bancaria', 'passed', null, bankingScreenshot);
      
      // Ver transacciones
      await page.click('a:has-text("Transacciones")');
      await page.waitForSelector('table tbody');
      const transactionsScreenshot = await takeScreenshot(page, 'banking-transactions');
      logTestResult(moduleName, 'Listado de transacciones', 'passed', null, transactionsScreenshot);
      
    } else {
      // Si no está conectado, intentar configurar
      logTestResult(moduleName, 'Conexión con API bancaria', 'skipped', 'API bancaria no configurada');
      
      // Llenar formulario de conexión
      await page.click('button:has-text("Conectar Banco")');
      await page.waitForSelector('form[data-test="banking-form"]');
      await page.fill('input[name="apiUrl"]', 'https://ejemplo-banco-api.com');
      await page.fill('input[name="clientId"]', 'client_test');
      await page.fill('input[name="clientSecret"]', 'secret_test');
      await page.click('button[type="submit"]:has-text("Conectar")');
      
      // Asumir que falló porque no son credenciales reales
      const configScreenshot = await takeScreenshot(page, 'banking-config-attempt');
      logTestResult(moduleName, 'Configuración bancaria', 'skipped', 'Requiere credenciales reales', configScreenshot);
    }
    
  } catch (error) {
    console.error('Error en prueba de Integración Bancaria:', error);
    const errorScreenshot = await takeScreenshot(page, 'banking-error');
    logTestResult(moduleName, 'Pruebas Bancario', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba de la plataforma E-Learning
 */
async function testELearningPlatform(page) {
  const moduleName = 'E-Learning';
  console.log(`\n📚 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar a la plataforma e-learning
    await page.click('a[href="/e-learning"]');
    await page.waitForURL(`${config.baseUrl}/e-learning`);
    const elearningScreenshot = await takeScreenshot(page, 'elearning-dashboard');
    
    // Verificar listado de cursos
    const coursesList = await page.locator('div[data-test="course-card"]').count();
    if (coursesList > 0) {
      logTestResult(moduleName, 'Listado de cursos', 'passed', null, elearningScreenshot);
      
      // Ver detalle de un curso
      await page.click('div[data-test="course-card"]:first-child a');
      await page.waitForSelector('h1.course-title');
      const courseScreenshot = await takeScreenshot(page, 'elearning-course');
      logTestResult(moduleName, 'Visualización de lecciones', 'passed', null, courseScreenshot);
      
    } else {
      // Si no hay cursos, intentar crear uno
      logTestResult(moduleName, 'Listado de cursos', 'skipped', 'No hay cursos disponibles');
      
      // Ir a sección de creación
      await page.click('a:has-text("Gestionar Cursos")');
      await page.waitForSelector('button:has-text("Nuevo Curso")');
      await page.click('button:has-text("Nuevo Curso")');
      
      // Llenar formulario de curso
      await page.waitForSelector('form[data-test="course-form"]');
      await page.fill('input[name="title"]', 'Curso de Prueba Automatizado');
      await page.fill('textarea[name="description"]', 'Curso creado mediante prueba automatizada');
      await page.selectOption('select[name="level"]', 'principiante');
      await page.fill('input[name="duration"]', '60');
      await page.click('button[type="submit"]');
      
      // Verificar creación
      await page.waitForSelector('div.toast:has-text("Curso creado")');
      const createScreenshot = await takeScreenshot(page, 'elearning-create');
      logTestResult(moduleName, 'Creación de cursos', 'passed', null, createScreenshot);
    }
    
  } catch (error) {
    console.error('Error en prueba de E-Learning:', error);
    const errorScreenshot = await takeScreenshot(page, 'elearning-error');
    logTestResult(moduleName, 'Pruebas E-Learning', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba del módulo de Compras
 */
async function testPurchasingModule(page) {
  const moduleName = 'Compras';
  console.log(`\n🛍️ Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar al módulo de compras
    await page.click('a[href="/compras"]');
    await page.waitForURL(`${config.baseUrl}/compras`);
    const purchasingScreenshot = await takeScreenshot(page, 'purchasing-dashboard');
    
    // Verificar listado de pedidos
    const ordersList = await page.locator('table tbody tr').count();
    if (ordersList > 0) {
      logTestResult(moduleName, 'Listado de pedidos', 'passed', null, purchasingScreenshot);
    } else {
      logTestResult(moduleName, 'Listado de pedidos', 'skipped', 'No hay pedidos para mostrar');
    }
    
    // Verificar proveedores
    await page.click('a:has-text("Proveedores")');
    await page.waitForURL(`${config.baseUrl}/compras/proveedores`);
    const suppliersScreenshot = await takeScreenshot(page, 'purchasing-suppliers');
    
    const suppliersList = await page.locator('table tbody tr').count();
    if (suppliersList > 0) {
      logTestResult(moduleName, 'Gestión de proveedores', 'passed', null, suppliersScreenshot);
      
      // Crear nuevo pedido
      await page.click('a:has-text("Pedidos")');
      await page.waitForURL(`${config.baseUrl}/compras`);
      await page.click('button:has-text("Nuevo Pedido")');
      
      // Llenar formulario de pedido
      await page.waitForSelector('form[data-test="order-form"]');
      await page.selectOption('select[name="supplierId"]', '1'); // Primer proveedor
      await page.fill('input[name="reference"]', 'PED-AUTO-' + Date.now().toString().slice(-5));
      
      // Añadir producto al pedido
      await page.click('button:has-text("Añadir Producto")');
      await page.selectOption('select[name="products.0.productId"]', '1'); // Primer producto
      await page.fill('input[name="products.0.quantity"]', '10');
      await page.fill('input[name="products.0.price"]', '15.99');
      
      await page.click('button[type="submit"]');
      
      // Verificar creación
      await page.waitForSelector('div.toast:has-text("Pedido creado")');
      const createOrderScreenshot = await takeScreenshot(page, 'purchasing-create-order');
      logTestResult(moduleName, 'Creación de pedidos', 'passed', null, createOrderScreenshot);
      
    } else {
      // Si no hay proveedores, crear uno
      logTestResult(moduleName, 'Gestión de proveedores', 'skipped', 'No hay proveedores disponibles');
      
      await page.click('button:has-text("Nuevo Proveedor")');
      await page.waitForSelector('form[data-test="supplier-form"]');
      await page.fill('input[name="name"]', 'Proveedor Automático');
      await page.fill('input[name="contactName"]', 'Contacto Prueba');
      await page.fill('input[name="email"]', 'proveedor@test.com');
      await page.fill('input[name="phone"]', '123456789');
      await page.click('button[type="submit"]');
      
      // Verificar creación
      await page.waitForSelector('div.toast:has-text("Proveedor creado")');
      const createSupplierScreenshot = await takeScreenshot(page, 'purchasing-create-supplier');
      logTestResult(moduleName, 'Creación de proveedor', 'passed', null, createSupplierScreenshot);
    }
    
    // Probar análisis de IA
    await page.click('a:has-text("Análisis")');
    await page.waitForURL(`${config.baseUrl}/compras/analisis`);
    const analysisScreenshot = await takeScreenshot(page, 'purchasing-analysis');
    logTestResult(moduleName, 'Análisis de compras con IA', 'passed', null, analysisScreenshot);
    
  } catch (error) {
    console.error('Error en prueba de Compras:', error);
    const errorScreenshot = await takeScreenshot(page, 'purchasing-error');
    logTestResult(moduleName, 'Pruebas Compras', 'failed', error, errorScreenshot);
  }
}

/**
 * Prueba del módulo CMS
 */
async function testCMSModule(page) {
  const moduleName = 'CMS';
  console.log(`\n🌐 Iniciando pruebas de ${moduleName}...\n`);
  
  try {
    // Navegar al módulo CMS
    await page.click('a[href="/cms"]');
    await page.waitForURL(`${config.baseUrl}/cms`);
    await page.click('a:has-text("Páginas")');
    await page.waitForURL(`${config.baseUrl}/cms/paginas`);
    const cmsScreenshot = await takeScreenshot(page, 'cms-pages');
    
    // Verificar listado de páginas
    const pagesList = await page.locator('table tbody tr').count();
    if (pagesList > 0) {
      logTestResult(moduleName, 'Gestión de páginas', 'passed', null, cmsScreenshot);
    } else {
      logTestResult(moduleName, 'Gestión de páginas', 'skipped', 'No hay páginas para mostrar');
    }
    
    // Crear nueva página
    await page.click('button:has-text("Nueva Página")');
    await page.waitForSelector('form[data-test="page-form"]');
    await page.fill('input[name="title"]', 'Página de Prueba Automatizada');
    await page.fill('input[name="slug"]', 'pagina-prueba-' + Date.now().toString().slice(-5));
    
    // Interactuar con el editor de bloques
    await page.locator('div[data-test="block-editor"]').click();
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Encabezado")');
    
    // Editar contenido del bloque
    await page.fill('div[data-test="block-editor"] h2[contenteditable="true"]', 'Encabezado de prueba');
    
    // Agregar otro bloque
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Párrafo")');
    await page.fill('div[data-test="block-editor"] p[contenteditable="true"]', 'Este es un párrafo de prueba creado automáticamente.');
    
    // Guardar página
    await page.click('button[type="submit"]:has-text("Guardar")');
    
    // Verificar creación
    await page.waitForSelector('div.toast:has-text("Página guardada")');
    const createPageScreenshot = await takeScreenshot(page, 'cms-create-page');
    logTestResult(moduleName, 'Creación de página', 'passed', null, createPageScreenshot);
    
    // Probar biblioteca de medios
    await page.click('a:has-text("Medios")');
    await page.waitForURL(`${config.baseUrl}/cms/medios`);
    const mediaScreenshot = await takeScreenshot(page, 'cms-media');
    logTestResult(moduleName, 'Biblioteca de medios', 'passed', null, mediaScreenshot);
    
    // Probar sección de branding
    await page.click('a:has-text("Branding")');
    await page.waitForURL(`${config.baseUrl}/cms/branding`);
    const brandingScreenshot = await takeScreenshot(page, 'cms-branding');
    logTestResult(moduleName, 'Personalización de marca', 'passed', null, brandingScreenshot);
    
  } catch (error) {
    console.error('Error en prueba de CMS:', error);
    const errorScreenshot = await takeScreenshot(page, 'cms-error');
    logTestResult(moduleName, 'Pruebas CMS', 'failed', error, errorScreenshot);
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
    console.log('\n🧪 INICIANDO PRUEBAS AUTOMATIZADAS DE SHIELDCUISINE 🧪');
    console.log('==================================================\n');
    
    // Prueba de autenticación (necesaria para todas las demás)
    await testAuthentication(page);
    
    // Pruebas de módulos individuales
    await testAPPCCModule(page);
    await testInventoryModule(page);
    await testTransparencyPortal(page);
    await testWooCommerceIntegration(page);
    await testBankingIntegration(page);
    await testELearningPlatform(page);
    await testPurchasingModule(page);
    await testCMSModule(page);
    
    console.log('\n==================================================');
    console.log('🏆 TODAS LAS PRUEBAS COMPLETADAS 🏆\n');
    
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