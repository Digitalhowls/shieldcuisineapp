import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configuración mejorada para Neon PostgreSQL
const sql: NeonQueryFunction<any, any> = neon(process.env.DATABASE_URL!);

// Inicializar Drizzle con la conexión Neon
export const db = drizzle(sql, { schema });

// Exporta también la conexión SQL directa para casos donde se necesite
export { sql };
