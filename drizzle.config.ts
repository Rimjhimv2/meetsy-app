import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // 👈 correct field
  dbCredentials: {
    url: process.env.DATABASE_URL as string, // 👈 use url
  },
});
