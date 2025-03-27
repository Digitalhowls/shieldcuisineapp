/**
 * Prueba específica para verificar la funcionalidad del botón onClose en MediaUploader
 */
import { test, expect } from '@playwright/test';

// Datos de prueba
const testUser = {
  username: 'admin',
  password: 'admin123'
};

// URLs de prueba
const authPage = '/auth';
const mediaPage = '/admin/cms/media';

test.describe('MediaUploader onClose Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de autenticación
    await page.goto(authPage);
    
    // Iniciar sesión
    await page.getByLabel('Username').fill(testUser.username);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Esperar a que se complete la autenticación y redirección
    await page.waitForURL('**/admin');
    
    // Navegar a la página de medios
    await page.goto(mediaPage);
    
    // Esperar a que la página de medios se cargue completamente
    await page.waitForSelector('h1:has-text("Media Library")');
  });
  
  test('should close uploader when cancel button is clicked', async ({ page }) => {
    // Captura de pantalla inicial
    await page.screenshot({ path: 'tests/screenshots/media-page-initial.png' });
    
    // Verificar que el botón "Upload Media" existe y hacer clic en él
    const uploadButton = page.getByRole('button', { name: 'Upload Media' });
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    
    // Esperar a que el diálogo del uploader se abra
    await page.waitForSelector('div[role="dialog"]');
    
    // Capturar screenshot del diálogo abierto
    await page.screenshot({ path: 'tests/screenshots/media-uploader-opened.png' });
    
    // Verificar que el botón "Cancelar" existe y hacer clic en él
    const cancelButton = page.getByRole('button', { name: 'Cancelar' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    // Verificar que el diálogo se ha cerrado (ya no es visible)
    await expect(page.locator('div[role="dialog"]')).not.toBeVisible({ timeout: 3000 });
    
    // Capturar screenshot después de cerrar
    await page.screenshot({ path: 'tests/screenshots/media-uploader-closed.png' });
    
    // Prueba exitosa si llegamos hasta aquí
    console.log('✅ Prueba completada: El uploader se cierra correctamente al hacer clic en Cancelar');
  });
});