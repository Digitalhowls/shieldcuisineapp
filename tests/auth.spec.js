// @ts-check
import { test, expect } from '@playwright/test';

// Prueba de autenticación y acceso a páginas protegidas
test.describe('Autenticación', () => {
  test('debe poder iniciar sesión con credenciales válidas', async ({ page }) => {
    // Visitar la página de autenticación
    await page.goto('/auth');
    
    // Esperar a que el formulario esté visible
    await expect(page.locator('form')).toBeVisible();
    
    // Ingresar credenciales
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    
    // Hacer clic en el botón de inicio de sesión
    await page.click('button[type="submit"]');
    
    // Verificar redirección exitosa a la página principal tras el login
    await expect(page).toHaveURL('/');
    
    // Verificar que elementos de usuario autenticado son visibles
    await expect(page.locator('text=Dashboard')).toBeVisible({timeout: 5000});
  });

  test('debe denegar acceso con credenciales inválidas', async ({ page }) => {
    // Visitar la página de autenticación
    await page.goto('/auth');
    
    // Ingresar credenciales incorrectas
    await page.fill('input[name="username"]', 'usuario_invalido');
    await page.fill('input[name="password"]', 'clave_incorrecta');
    
    // Hacer clic en el botón de inicio de sesión
    await page.click('button[type="submit"]');
    
    // Verificar que permanece en la página de autenticación
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Verificar mensaje de error
    await expect(page.locator('text=/Error|Credenciales inválidas|Acceso denegado/')).toBeVisible({timeout: 5000});
  });
});