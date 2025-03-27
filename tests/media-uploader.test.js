// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('MediaUploader Component Tests', () => {
  // Antes de cada prueba, autenticar al usuario
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de autenticación
    await page.goto('/auth');

    // Rellenar el formulario de inicio de sesión
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin123');
    
    // Enviar el formulario
    await page.click('button:has-text("Iniciar Sesión")');
    
    // Esperar a que la autenticación se complete (redireccionamiento a la página de inicio)
    await page.waitForURL('/');
    
    // Navegar a la página de medios del CMS
    await page.goto('/admin/cms/media');
  });

  test('should open and close the upload dialog correctly', async ({ page }) => {
    // Capturar capturas de pantalla para el informe
    await page.screenshot({ path: 'tests/screenshots/media-page.png' });
    
    // Abrir el diálogo de subida de archivos
    await page.click('button:has-text("Subir Archivos")');
    
    // Verificar que el diálogo está abierto
    expect(await page.locator('div[role="dialog"]:has-text("Subir Archivos")').isVisible()).toBeTruthy();
    
    // Capturar una captura del diálogo abierto
    await page.screenshot({ path: 'tests/screenshots/upload-dialog-open.png' });
    
    // Hacer clic en el botón "Cancelar" para cerrar el diálogo
    await page.click('button:has-text("Cancelar")');
    
    // Verificar que el diálogo se ha cerrado
    expect(await page.locator('div[role="dialog"]:has-text("Subir Archivos")').isVisible()).toBeFalsy();
    
    // Capturar una captura después de cerrar el diálogo
    await page.screenshot({ path: 'tests/screenshots/after-dialog-close.png' });
  });

  test('should upload a file and close dialog on completion', async ({ page }) => {
    // Abrir el diálogo de subida de archivos
    await page.click('button:has-text("Subir Archivos")');
    
    // Verificar que el diálogo está abierto
    expect(await page.locator('div[role="dialog"]:has-text("Subir Archivos")').isVisible()).toBeTruthy();
    
    // Simular la carga de un archivo utilizando el input de archivo
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Arrastra tus archivos aquí o haz clic para seleccionarlos');
    const fileChooser = await fileChooserPromise;
    
    // Seleccionar un archivo de prueba (debes crear este archivo antes de ejecutar la prueba)
    await fileChooser.setFiles([
      {
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('test file content')
      }
    ]);
    
    // Esperar a que el archivo aparezca en la lista de carga
    await page.waitForSelector('text=test-image.jpg');
    
    // Simular la carga exitosa (esto dependerá de la implementación específica)
    // Aquí asumimos que hay un botón "Subir" que inicia la carga
    await page.click('button:has-text("Subir")');
    
    // Esperar a que el diálogo se cierre automáticamente después de la carga exitosa
    // Esto asume que el diálogo se cierra después de que onUploadComplete se active
    await expect(page.locator('div[role="dialog"]:has-text("Subir Archivos")')).toBeHidden({ timeout: 5000 });
    
    // Verificar que el diálogo ya no está visible
    expect(await page.locator('div[role="dialog"]:has-text("Subir Archivos")').isVisible()).toBeFalsy();
  });
});