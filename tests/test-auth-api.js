/**
 * Script para probar la API de autenticación de ShieldCuisine
 */
import fetch from 'node-fetch';

// Credenciales de prueba
const testCredentials = [
  { username: 'admin', password: 'admin123', shouldPass: true },
  { username: 'admintest', password: 'admin123', shouldPass: true },
  { username: 'invalid_user', password: 'wrong_password', shouldPass: false }
];

// Función para probar login
async function testLogin(credentials) {
  console.log(`\nProbando login con usuario: ${credentials.username}`);
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });

    const status = response.status;
    console.log(`Estado de respuesta: ${status}`);

    if (status === 200 && credentials.shouldPass) {
      console.log('✅ Login exitoso como se esperaba');
      const userData = await response.json();
      console.log(`Usuario autenticado: ${userData.username} (${userData.role})`);
      return true;
    } else if (status !== 200 && !credentials.shouldPass) {
      console.log('✅ Login fallido como se esperaba');
      return true;
    } else if (status === 200 && !credentials.shouldPass) {
      console.log('❌ ERROR: Login exitoso cuando debería haber fallado');
      return false;
    } else {
      console.log('❌ ERROR: Login fallido cuando debería haber sido exitoso');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error.message);
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('=== Iniciando pruebas de API de autenticación ===');
  
  let passedTests = 0;
  let totalTests = testCredentials.length;
  
  for (const credentials of testCredentials) {
    const result = await testLogin(credentials);
    if (result) passedTests++;
  }
  
  console.log(`\n=== Resumen de pruebas ===`);
  console.log(`Pruebas pasadas: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    return true;
  } else {
    console.log('❌ ALGUNAS PRUEBAS FALLARON');
    return false;
  }
}

// Ejecutar las pruebas
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error grave durante las pruebas:', error);
    process.exit(1);
  });