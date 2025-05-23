import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env", // Specify the path to your .env file
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found in .env file. Ensure the database is provisioned and .env file is correctly set up.");
}

export default defineConfig({
  out: "./migrations", // This was already correct, specifies where migration files are stored.
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Optionally, add verbose logging for Drizzle Kit operations
  verbose: true,
  // Optionally, enable strict mode for more checks
  strict: true,
});
