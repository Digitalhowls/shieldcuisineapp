import { hash } from '@node-rs/bcrypt';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

async function createTestUser() {
  try {
    // Hash password using bcrypt
    const password = await hash('password123', 10);
    
    // Create a test user
    const result = await db.insert(users).values({
      username: 'testuser',
      password: password,
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      active: true,
      companyId: 1,
      locationId: 1
    }).returning();
    
    console.log('Created test user:', result[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();