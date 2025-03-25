import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function listUsers() {
  try {
    // List all users
    const query = `
      SELECT id, username, name, email, role, active, created_at
      FROM users
      ORDER BY id;
    `;
    
    const result = await sql(query);
    
    console.log('Users in database:');
    console.table(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();