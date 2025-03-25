import { neon } from "@neondatabase/serverless";
import { User } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Initializing direct DB connection with Neon...");
const sql = neon(process.env.DATABASE_URL);

// Testing connectivity
(async () => {
  try {
    console.log("Testing direct DB connection...");
    const result = await sql("SELECT 1 as test");
    console.log("Direct DB connection test successful:", result);
  } catch (err) {
    console.error("Direct DB connection test failed:", err);
  }
})();

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    console.log(`[direct-db] Searching for user with username: ${username}`);
    const result = await sql(`
      SELECT * FROM users WHERE username = $1
    `, [username]);
    
    console.log(`[direct-db] Query result:`, result);
    
    if (!result || result.length === 0) {
      console.log(`[direct-db] No user found with username: ${username}`);
      return undefined;
    }
    
    // Convert snake_case to camelCase for the properties
    const user = result[0];
    console.log(`[direct-db] Found user:`, user);
    
    const transformedUser = {
      ...user,
      companyId: user.company_id,
      locationId: user.location_id,
      lastLogin: user.last_login,
      createdAt: user.created_at
    } as unknown as User;
    
    console.log(`[direct-db] Transformed user:`, transformedUser);
    return transformedUser;
  } catch (error) {
    console.error("[direct-db] Error getting user by username:", error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const result = await sql(`
      SELECT * FROM users WHERE id = $1
    `, [id]);
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    // Convert snake_case to camelCase for the properties
    const user = result[0];
    return {
      ...user,
      companyId: user.company_id,
      locationId: user.location_id,
      lastLogin: user.last_login,
      createdAt: user.created_at
    } as unknown as User;
  } catch (error) {
    console.error("Error getting user by id:", error);
    throw error;
  }
}

export async function createUser(user: {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  companyId?: number;
  locationId?: number;
}): Promise<User> {
  try {
    const result = await sql(`
      INSERT INTO users (
        username, password, name, email, role, active, company_id, location_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW()
      ) RETURNING *
    `, [
      user.username,
      user.password,
      user.name,
      user.email,
      user.role,
      user.active ?? true,
      user.companyId ?? null,
      user.locationId ?? null
    ]);
    
    if (!result || result.length === 0) {
      throw new Error("Failed to create user");
    }
    
    // Convert snake_case to camelCase for the properties
    const newUser = result[0];
    return {
      ...newUser,
      companyId: newUser.company_id,
      locationId: newUser.location_id,
      lastLogin: newUser.last_login,
      createdAt: newUser.created_at
    } as unknown as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}