import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema";

// This script pushes the schema to the database

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set");
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  console.log("Migrating database schema...");
  
  try {
    // Using direct schema push instead of migrations for simplicity
    const result = await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT,
        display_name TEXT
      );
      
      CREATE TABLE IF NOT EXISTS conclusions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS bias_test_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        template TEXT NOT NULL,
        substitution TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        phase INTEGER NOT NULL,
        paragraph INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log("Database schema migrated successfully");
    
    // Create a default user for testing
    await db.execute(`
      INSERT INTO users (username, password)
      VALUES ('test', 'password')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    console.log("Default user created");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();