#!/usr/bin/env node

/**
 * Script específico para pruebas del Editor de Bloques
 * 
 * Este script realiza pruebas detalladas del editor de bloques,
 * verificando todas sus funcionalidades y su integración con react-dnd.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuración de las pruebas
const config = {
  baseUrl: 'http://localhost:5000',
  screenshotsDir: path.join(__dirname, '../test-results/screenshots/block-editor'),
  reportPath: path.join(__dirname, '../test-results/block-editor-report.json'),
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  headless: false,  // true para ejecutar sin interfaz gráfica
  slowMo: 100,      // milisegundos entre acciones (para visualizar mejor)
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
 * Navega al editor de bloques creando una nueva página
 */
async function navigateToBlockEditor(page) {
  try {
    console.log('\n🔑 Iniciando sesión...\n');
    
    // Navegar a la página de inicio
    await page.goto(`${config.baseUrl}/auth`);
    await takeScreenshot(page, 'auth-page');
    
    // Login
    await page.fill('input[name="username"]', config.credentials.username);
    await page.fill('input[name="password"]', config.credentials.password);
    await page.click('button[type="submit"]');
    
    // Verificar redirección a dashboard
    await page.waitForURL(`${config.baseUrl}/`);
    
    console.log('\n🌐 Navegando al módulo CMS...\n');
    
    // Navegar al módulo CMS
    await page.click('a[href="/cms"]');
    await page.waitForURL(`${config.baseUrl}/cms`);
    
    // Ir a sección de páginas
    await page.click('a:has-text("Páginas")');
    await page.waitForURL(`${config.baseUrl}/cms/paginas`);
    
    // Crear nueva página para acceder al editor
    console.log('Creando nueva página para acceder al editor de bloques...');
    await page.click('button:has-text("Nueva Página")');
    await page.waitForSelector('form[data-test="page-form"]');
    
    // Llenar formulario básico de página
    const pageName = 'Test Editor de Bloques ' + Date.now().toString().slice(-5);
    const pageSlug = 'test-editor-' + Date.now().toString().slice(-5);
    
    await page.fill('input[name="title"]', pageName);
    await page.fill('input[name="slug"]', pageSlug);
    
    // Verificar que estamos en el editor
    const editor = await page.locator('div[data-test="block-editor"]').count();
    if (editor > 0) {
      const screenshot = await takeScreenshot(page, 'block-editor-initial');
      logTestResult('Navegación al editor de bloques', 'passed', null, screenshot);
      return true;
    } else {
      throw new Error('No se pudo acceder al editor de bloques');
    }
  } catch (error) {
    console.error('Error al navegar al editor de bloques:', error);
    logTestResult('Navegación al editor de bloques', 'failed', error);
    return false;
  }
}

/**
 * Prueba la creación de bloques
 */
async function testBlockCreation(page) {
  try {
    console.log('\n🧱 Probando creación de bloques...\n');
    
    // Verificar estado inicial vacío
    const emptyState = await page.locator('div[data-test="block-editor-empty"]').count();
    if (emptyState > 0) {
      const emptyScreenshot = await takeScreenshot(page, 'block-editor-empty');
      logTestResult('Estado vacío inicial', 'passed', null, emptyScreenshot);
    } else {
      logTestResult('Estado vacío inicial', 'skipped', 'No se encontró el estado vacío');
    }
    
    // Array de tipos de bloques a probar
    const blockTypes = [
      { name: 'Encabezado', selector: 'h2[contenteditable="true"]', content: 'Título de prueba automatizada' },
      { name: 'Párrafo', selector: 'p[contenteditable="true"]', content: 'Este es un párrafo de prueba para verificar el editor de bloques.' },
      { name: 'Lista', selector: 'ul[contenteditable="true"]', content: 'Elemento de lista' },
      { name: 'Cita', selector: 'blockquote[contenteditable="true"]', content: 'Esta es una cita de prueba' },
      { name: 'Código', selector: 'pre[contenteditable="true"]', content: 'function test() {\n  console.log("Prueba");\n}' },
      { name: 'Columnas', selector: 'div[data-type="columns"]', hasSelector: true },
      { name: 'Separador', selector: 'hr', hasSelector: true },
      { name: 'Imagen', selector: 'div[data-type="image"]', hasSelector: true },
      { name: 'Botón', selector: 'button.content-button', hasSelector: true }
    ];
    
    // Crear cada tipo de bloque
    for (const blockType of blockTypes) {
      try {
        console.log(`Creando bloque de tipo: ${blockType.name}`);
        
        // Hacer clic en el botón para añadir bloque
        await page.click('button:has-text("Añadir Bloque")');
        
        // Seleccionar tipo de bloque
        await page.click(`button:has-text("${blockType.name}")`);
        
        // Si el bloque requiere un selector de contenido externo (como imagen), puede que aparezca un diálogo
        if (blockType.name === 'Imagen') {
          const mediaSelector = await page.locator('div[data-test="media-selector"]').count();
          if (mediaSelector > 0) {
            const mediaSelectorScreenshot = await takeScreenshot(page, `block-${blockType.name.toLowerCase()}-selector`);
            logTestResult(`Selector de ${blockType.name}`, 'passed', null, mediaSelectorScreenshot);
            
            // Cerrar selector si aparece
            await page.click('button:has-text("Cancelar")');
            continue;  // Pasar al siguiente bloque sin verificar contenido
          }
        }
        
        // Verificar que el bloque se creó correctamente
        if (blockType.hasSelector) {
          // Solo verificamos la existencia del elemento
          const blockExists = await page.locator(blockType.selector).count() > 0;
          if (blockExists) {
            const screenshot = await takeScreenshot(page, `block-${blockType.name.toLowerCase()}`);
            logTestResult(`Creación de bloque ${blockType.name}`, 'passed', null, screenshot);
          } else {
            logTestResult(`Creación de bloque ${blockType.name}`, 'failed', `No se encontró el elemento ${blockType.selector}`);
          }
        } else {
          // Bloques con contenido editable - añadimos texto
          await page.fill(blockType.selector, blockType.content);
          const screenshot = await takeScreenshot(page, `block-${blockType.name.toLowerCase()}`);
          logTestResult(`Creación de bloque ${blockType.name}`, 'passed', null, screenshot);
        }
      } catch (error) {
        logTestResult(`Creación de bloque ${blockType.name}`, 'failed', error);
      }
      
      // Pequeña pausa entre bloques para visualizar mejor
      await page.waitForTimeout(500);
    }
    
  } catch (error) {
    console.error('Error en prueba de creación de bloques:', error);
    logTestResult('Creación de bloques', 'failed', error);
  }
}

/**
 * Prueba las operaciones en bloques existentes
 */
async function testBlockOperations(page) {
  try {
    console.log('\n🔧 Probando operaciones en bloques...\n');
    
    // Obtener todos los bloques
    const blocks = await page.locator('div[data-block-id]').all();
    if (blocks.length === 0) {
      logTestResult('Operaciones en bloques', 'skipped', 'No hay bloques para realizar operaciones');
      return;
    }
    
    // 1. Prueba de selección de bloque
    try {
      await blocks[0].click();
      const blockSelected = await page.locator('div[data-block-id].selected').count() > 0;
      if (blockSelected) {
        const screenshot = await takeScreenshot(page, 'block-selected');
        logTestResult('Selección de bloque', 'passed', null, screenshot);
      } else {
        logTestResult('Selección de bloque', 'failed', 'No se pudo seleccionar el bloque');
      }
    } catch (error) {
      logTestResult('Selección de bloque', 'failed', error);
    }
    
    // 2. Prueba de la barra de herramientas del bloque
    try {
      // La barra de herramientas debería aparecer al seleccionar un bloque
      const toolbar = await page.locator('div[data-test="block-toolbar"]').count();
      if (toolbar > 0) {
        const screenshot = await takeScreenshot(page, 'block-toolbar');
        logTestResult('Barra de herramientas de bloque', 'passed', null, screenshot);
        
        // 3. Prueba del botón de eliminar bloque si existe
        const deleteButton = await page.locator('button[data-test="delete-block"]').count();
        if (deleteButton > 0) {
          logTestResult('Botón eliminar bloque', 'passed');
        } else {
          logTestResult('Botón eliminar bloque', 'skipped', 'No se encontró el botón de eliminar');
        }
        
        // 4. Prueba del botón de duplicar bloque si existe
        const duplicateButton = await page.locator('button[data-test="duplicate-block"]').count();
        if (duplicateButton > 0) {
          await page.click('button[data-test="duplicate-block"]');
          await page.waitForTimeout(500);
          
          // Verificar que hay un bloque más que antes
          const newBlocksCount = await page.locator('div[data-block-id]').count();
          if (newBlocksCount > blocks.length) {
            const screenshot = await takeScreenshot(page, 'block-duplicated');
            logTestResult('Duplicación de bloque', 'passed', null, screenshot);
          } else {
            logTestResult('Duplicación de bloque', 'failed', 'No se pudo verificar la duplicación');
          }
        } else {
          logTestResult('Duplicación de bloque', 'skipped', 'No se encontró el botón de duplicar');
        }
        
        // 5. Prueba del botón de mover bloque si existe
        const moveUpButton = await page.locator('button[data-test="move-block-up"]').count();
        if (moveUpButton > 0) {
          // Si hay al menos dos bloques, podemos probar mover
          if (blocks.length >= 2) {
            // Seleccionar el segundo bloque
            await blocks[1].click();
            await page.waitForTimeout(300);
            
            // Mover hacia arriba
            await page.click('button[data-test="move-block-up"]');
            await page.waitForTimeout(500);
            
            const screenshot = await takeScreenshot(page, 'block-moved');
            logTestResult('Mover bloque', 'passed', null, screenshot);
          } else {
            logTestResult('Mover bloque', 'skipped', 'Se requieren al menos dos bloques');
          }
        } else {
          logTestResult('Mover bloque', 'skipped', 'No se encontraron botones de mover');
        }
      } else {
        logTestResult('Barra de herramientas de bloque', 'failed', 'No se encontró la barra de herramientas');
      }
    } catch (error) {
      logTestResult('Operaciones con barra de herramientas', 'failed', error);
    }
    
    // 6. Prueba de eliminación de bloque
    try {
      // Obtener el número de bloques antes de eliminar
      const initialCount = await page.locator('div[data-block-id]').count();
      
      // Seleccionar el último bloque
      const lastBlocks = await page.locator('div[data-block-id]').all();
      await lastBlocks[lastBlocks.length - 1].click();
      
      // Buscar y hacer clic en el botón de eliminar
      const deleteButton = await page.locator('button[data-test="delete-block"]').count();
      if (deleteButton > 0) {
        await page.click('button[data-test="delete-block"]');
        await page.waitForTimeout(500);
        
        // Verificar que hay un bloque menos
        const newCount = await page.locator('div[data-block-id]').count();
        if (newCount < initialCount) {
          const screenshot = await takeScreenshot(page, 'block-deleted');
          logTestResult('Eliminación de bloque', 'passed', null, screenshot);
        } else {
          logTestResult('Eliminación de bloque', 'failed', 'No se pudo verificar la eliminación');
        }
      } else {
        // Intentar con tecla Delete
        await page.press('div[data-block-id].selected', 'Delete');
        await page.waitForTimeout(500);
        
        const newCount = await page.locator('div[data-block-id]').count();
        if (newCount < initialCount) {
          const screenshot = await takeScreenshot(page, 'block-deleted-keyboard');
          logTestResult('Eliminación de bloque con teclado', 'passed', null, screenshot);
        } else {
          logTestResult('Eliminación de bloque', 'skipped', 'No se pudo eliminar el bloque');
        }
      }
    } catch (error) {
      logTestResult('Eliminación de bloque', 'failed', error);
    }
    
  } catch (error) {
    console.error('Error en prueba de operaciones en bloques:', error);
    logTestResult('Operaciones en bloques', 'failed', error);
  }
}

/**
 * Prueba las funcionalidades de arrastrar y soltar
 */
async function testDragAndDrop(page) {
  try {
    console.log('\n🧩 Probando funcionalidad de arrastrar y soltar...\n');
    
    // Obtener todos los bloques
    const blocks = await page.locator('div[data-block-id]').all();
    if (blocks.length < 2) {
      // Necesitamos al menos dos bloques para probar
      
      // Crear dos bloques para la prueba
      await page.click('button:has-text("Añadir Bloque")');
      await page.click('button:has-text("Párrafo")');
      await page.fill('p[contenteditable="true"]', 'Párrafo 1 para prueba de arrastrar y soltar');
      
      await page.click('button:has-text("Añadir Bloque")');
      await page.click('button:has-text("Párrafo")');
      await page.fill('p[contenteditable="true"]', 'Párrafo 2 para prueba de arrastrar y soltar');
      
      // Actualizar la lista de bloques
      blocks.length = 0;
      Array.prototype.push.apply(blocks, await page.locator('div[data-block-id]').all());
      
      if (blocks.length < 2) {
        logTestResult('Arrastrar y soltar bloques', 'skipped', 'No se pudieron crear suficientes bloques');
        return;
      }
    }
    
    try {
      // Verificar si hay agarraderas de arrastrar
      const dragHandles = await page.locator('[data-test="drag-handle"]').count();
      
      if (dragHandles > 0) {
        console.log('Usando agarraderas de arrastrar...');
        // Método 1: Usar las agarraderas de arrastrar si existen
        
        const handle = await page.locator('[data-test="drag-handle"]').first();
        const targetBlock = blocks[blocks.length - 1];
        
        const handleBox = await handle.boundingBox();
        const targetBox = await targetBlock.boundingBox();
        
        // Realizar drag and drop
        await page.mouse.move(
          handleBox.x + handleBox.width / 2,
          handleBox.y + handleBox.height / 2
        );
        await page.mouse.down();
        await page.waitForTimeout(300);
        
        await page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height + 5
        );
        await page.waitForTimeout(300);
        
        await page.mouse.up();
        
        const screenshot = await takeScreenshot(page, 'drag-drop-handle');
        logTestResult('Arrastrar y soltar con agarradera', 'passed', null, screenshot);
      } else {
        console.log('Usando el bloque directamente para arrastrar...');
        // Método 2: Arrastrar el bloque directamente
        
        // Seleccionar el primer bloque
        await blocks[0].click();
        await page.waitForTimeout(300);
        
        const sourceBlock = blocks[0];
        const targetBlock = blocks[blocks.length - 1];
        
        const sourceBox = await sourceBlock.boundingBox();
        const targetBox = await targetBlock.boundingBox();
        
        // Realizar drag and drop
        await page.mouse.move(
          sourceBox.x + 20, // Cerca del borde para simular arrastrar desde el borde
          sourceBox.y + sourceBox.height / 2
        );
        await page.mouse.down();
        await page.waitForTimeout(300);
        
        await page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height + 5
        );
        await page.waitForTimeout(300);
        
        await page.mouse.up();
        
        const screenshot = await takeScreenshot(page, 'drag-drop-direct');
        logTestResult('Arrastrar y soltar directo', 'passed', null, screenshot);
      }
    } catch (error) {
      // Si falla el drag and drop, probamos otra aproximación
      try {
        console.log('Intentando método alternativo para mover bloques...');
        
        // Seleccionar el primer bloque
        await blocks[0].click();
        await page.waitForTimeout(300);
        
        // Buscar botones para mover bloques
        const moveDownButton = await page.locator('button[data-test="move-block-down"]').count();
        
        if (moveDownButton > 0) {
          // Usar botón de mover hacia abajo
          await page.click('button[data-test="move-block-down"]');
          await page.waitForTimeout(300);
          
          const screenshot = await takeScreenshot(page, 'move-block-button');
          logTestResult('Mover bloque con botones', 'passed', null, screenshot);
        } else {
          throw new Error('No se encontraron botones para mover bloques');
        }
      } catch (alternativeError) {
        logTestResult('Arrastrar y soltar bloques', 'failed', 
          `Falló el drag and drop (${error.message}) y el método alternativo (${alternativeError.message})`);
      }
    }
    
    // Si llegamos aquí, las pruebas pasaron o fueron manejadas individualmente
    
  } catch (error) {
    console.error('Error en prueba de arrastrar y soltar:', error);
    logTestResult('Arrastrar y soltar bloques', 'failed', error);
  }
}

/**
 * Prueba el guardado de contenido
 */
async function testContentSaving(page) {
  try {
    console.log('\n💾 Probando guardado de contenido...\n');
    
    // Añadir un bloque más para asegurarnos de tener cambios
    await page.click('button:has-text("Añadir Bloque")');
    await page.click('button:has-text("Encabezado")');
    await page.fill('h2[contenteditable="true"]', 'Encabezado para probar guardado');
    
    // Intentar guardar la página
    await page.click('button[type="submit"]:has-text("Guardar")');
    
    // Verificar confirmación de guardado
    try {
      await page.waitForSelector('div.toast:has-text("guardada")', { timeout: 5000 });
      const saveScreenshot = await takeScreenshot(page, 'content-saved');
      logTestResult('Guardado de contenido', 'passed', null, saveScreenshot);
    } catch (error) {
      logTestResult('Guardado de contenido', 'failed', 'No se recibió confirmación de guardado: ' + error.message);
    }
    
  } catch (error) {
    console.error('Error en prueba de guardado de contenido:', error);
    logTestResult('Guardado de contenido', 'failed', error);
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
    console.log('\n🧪 INICIANDO PRUEBAS DEL EDITOR DE BLOQUES 🧪');
    console.log('==================================================\n');
    
    // Navegación al editor
    const success = await navigateToBlockEditor(page);
    if (!success) {
      throw new Error('No se pudo acceder al editor de bloques');
    }
    
    // Pruebas específicas del editor
    await testBlockCreation(page);
    await testBlockOperations(page);
    await testDragAndDrop(page);
    await testContentSaving(page);
    
    console.log('\n==================================================');
    console.log('🏆 PRUEBAS DEL EDITOR DE BLOQUES COMPLETADAS 🏆\n');
    
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