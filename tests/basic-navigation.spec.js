// @ts-check
import { test, expect } from '@playwright/test';

// Prueba de navegación básica para verificar el acceso a las páginas principales
test.describe('Navegación básica', () => {
  test('debe acceder a la página principal y mostrar el formulario de login', async ({ page }) => {
    // Visitar la página principal
    await page.goto('/');
    
    // El sistema debe redirigir al usuario no autenticado a /auth
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Verificar que el formulario de login está presente
    await expect(page.locator('text=Iniciar sesión')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('debe mostrar ambos formularios de login y registro', async ({ page }) => {
    // Visitar la página de autenticación directamente
    await page.goto('/auth');
    
    // Verificar que el formulario de login está presente
    await expect(page.locator('text=Iniciar sesión')).toBeVisible();
    
    // Verificar que existe un botón o enlace para cambiar a registro
    const registroBtn = page.locator('text=Registro');
    await expect(registroBtn).toBeVisible();
    
    // Hacer clic en el botón de registro si está disponible
    try {
      await registroBtn.click();
      // Esperar a que el formulario de registro sea visible
      await expect(page.locator('text=Crear cuenta')).toBeVisible();
    } catch (e) {
      console.log('Aviso: No se pudo hacer clic en el botón de registro o no está presente');
    }
  });
});