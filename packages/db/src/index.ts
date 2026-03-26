import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";

/**
 * Create a database connection.
 * Uses DATABASE_URL from environment.
 */
export function createDB(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(url);
  const db = drizzle(client, { schema });

  return db;
}

export type Database = ReturnType<typeof createDB>;
