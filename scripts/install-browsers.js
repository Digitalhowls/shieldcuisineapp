#!/usr/bin/env node

/**
 * Script para instalar los navegadores requeridos por Playwright
 * 
 * Este script simplifica la instalación de los navegadores necesarios
 * para ejecutar pruebas automatizadas con Playwright.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔍 Instalador de navegadores para pruebas automatizadas 🔍');
console.log('====================================================\n');

console.log('Este script instalará los navegadores necesarios para ejecutar pruebas automatizadas con Playwright.\n');
console.log('Los navegadores disponibles son:');
console.log('  - Chromium (recomendado, más ligero)');
console.log('  - Firefox');
console.log('  - WebKit (motor de Safari)\n');

rl.question('¿Desea instalar todos los navegadores o solo Chromium? (todos/chromium): ', (answer) => {
  const installAll = answer.toLowerCase() === 'todos';
  
  try {
    console.log('\n🔄 Iniciando instalación...');
    
    if (installAll) {
      console.log('📥 Instalando todos los navegadores (Chromium, Firefox, WebKit)...');
      execSync('npx playwright install', { stdio: 'inherit' });
    } else {
      console.log('📥 Instalando solo Chromium...');
      execSync('npx playwright install chromium', { stdio: 'inherit' });
    }
    
    console.log('\n✅ Instalación completada con éxito');
    console.log('\nAhora puede ejecutar las pruebas automatizadas con:');
    console.log('  node scripts/run-tests.js');
    console.log('  node scripts/test-cms-module.js');
    
  } catch (error) {
    console.error('\n❌ Error durante la instalación:', error.message);
    console.log('\nPuede intentar instalar manualmente con: npx playwright install');
  } finally {
    rl.close();
  }
});