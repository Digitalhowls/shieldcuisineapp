import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configuración para Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL);

// Inicializar Drizzle con la conexión Neon
// @ts-ignore - Ignorar error de tipo para la conexión
export const db = drizzle(sql);

// Exporta también la conexión SQL directa
export { sql };
