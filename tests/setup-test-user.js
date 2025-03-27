/**
 * Script para crear un usuario de prueba si no existe
 * Este script debe ejecutarse antes de las pruebas para asegurar que existe un usuario con las credenciales esperadas
 */
require('dotenv').config();
const { db } = require('../server/db');
const { hash } = require('@node-rs/bcrypt');
const { users, User } = require('../shared/schema');
const { eq } = require('drizzle-orm');

async function hashPassword(password) {
  return await hash(password, 10);
}

async function setupTestUser() {
  console.log('Configurando usuario de prueba para las pruebas automatizadas...');
  
  try {
    // Verificar si el usuario ya existe
    const existingUsers = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (existingUsers.length > 0) {
      console.log('El usuario de prueba "admin" ya existe, no es necesario crearlo.');
      return;
    }
    
    // Crear el usuario de prueba
    const hashedPassword = await hashPassword('admin123');
    
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      email: 'admin@example.com',
      role: 'admin',
      companyId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Usuario de prueba "admin" creado exitosamente.');
  } catch (error) {
    console.error('Error al configurar el usuario de prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
setupTestUser()
  .then(() => {
    console.log('Configuración completada.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });