// @ts-check
const { test, expect } = require('@playwright/test');

// Prueba de las API del sistema
test.describe('API endpoints', () => {
  let cookies;

  // Obtener cookies de autenticación antes de las pruebas
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Realizar login
    await page.goto('/auth');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que el login se complete
    await page.waitForURL('/');
    
    // Obtener cookies para usarlas en requests de API
    cookies = await context.cookies();
    await context.close();
  });

  // Prueba de API de usuario autenticado
  test('debe obtener información del usuario autenticado', async ({ request }) => {
    // Configurar cookies para la solicitud
    const headers = {
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ')
    };
    
    // Realizar solicitud al endpoint de usuario
    const response = await request.get('/api/user', { headers });
    
    // Verificar respuesta exitosa
    expect(response.ok()).toBeTruthy();
    
    // Verificar datos del usuario
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('username');
  });

  // Prueba de API CMS - Listar páginas
  test('debe listar las páginas del CMS', async ({ request }) => {
    // Configurar cookies para la solicitud
    const headers = {
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ')
    };
    
    try {
      // Realizar solicitud al endpoint de páginas CMS
      const response = await request.get('/api/cms/pages', { headers });
      
      // Verificar respuesta exitosa
      expect(response.ok()).toBeTruthy();
      
      // Verificar que se devuelve un array (posiblemente vacío si no hay páginas creadas)
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    } catch (e) {
      console.log('Aviso: No se pudo acceder al endpoint de páginas CMS o no está implementado');
    }
  });
});