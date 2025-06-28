import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let connection: postgres.Sql;
if (process.env.NODE_ENV === "production") {
  connection = postgres(process.env.SUPABASE_URL!, { prepare: false });
} else {
  const globalConnection = global as typeof globalThis & {
    connection?: postgres.Sql;
  };

  globalConnection.connection ??= postgres(process.env.SUPABASE_URL!, {
      prepare: false,
    });

  connection = globalConnection.connection;
}

const db = drizzle(connection, { schema });

export * from "./schema";
export { db };