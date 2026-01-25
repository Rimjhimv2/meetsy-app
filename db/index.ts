import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined. Make sure to set it in your environment variables."
  );
}

const client = postgres(connectionString, {
  ssl: connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false, // 🔥 CRITICAL FIX for Bun + tsx + Drizzle
});

export const db = drizzle(client, { schema });
