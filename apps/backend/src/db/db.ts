import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
export const dbDirect = (connectionString: string) => {
  return drizzle(postgres(connectionString, { prepare: false }), { schema });
};

export const dbUrl = process.env.DATABASE_URL;
export const db = dbDirect(dbUrl);
