import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let connection: postgres.Sql;
//could get supabase ipv4 add on for maybe lowered latency
if (process.env.NODE_ENV === "production") {
  connection = postgres(process.env.SUPABASE_TCP_URL!, { prepare: false });
} else {
  const globalConnection = global as typeof globalThis & {
    connection?: postgres.Sql;
  };

  globalConnection.connection ??= postgres(process.env.SUPABASE_TCP_URL!, {
      prepare: false,
    });

  connection = globalConnection.connection;
}

const db = drizzle(connection, { schema });

export * from "./schema";
export { db };