import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

dotenv.config({
  path: ".env", // Ensure .env is in the root of the project or adjust path
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for migrations.");
}

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore schema is used by the migrator
const db = drizzle(sql, { schema: undefined }); // schema is not directly used here but good practice for consistency

async function runMigration() {
  try {
    console.log("Starting database migration...");
    await migrate(db, { migrationsFolder: "./migrations" }); // Point to the 'migrations' folder
    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1); // Exit with error code if migration fails
  }
}

runMigration();