import { neon } from "@neondatabase/serverless";
import { hash } from '@node-rs/bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function createTestUser() {
  try {
    // Hash password using bcrypt
    const password = await hash('admin123', 10);
    
    // Create a test user
    const query = `
      INSERT INTO users (username, password, name, email, role, active, company_id, location_id, created_at)
      VALUES ('admintest', $1, 'Admin Test', 'admin@test.com', 'admin', true, 1, 1, now())
      RETURNING id, username, name, email, role;
    `;
    
    const result = await sql(query, [password]);
    
    console.log('Created test user:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();