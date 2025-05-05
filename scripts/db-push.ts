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
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT CHECK (role IN ('teacher', 'admin', 'student')) NOT NULL DEFAULT 'student'
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
    
    // Add role column if it doesn't exist
    await db.execute(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN 
          ALTER TABLE users 
          ADD COLUMN role TEXT CHECK (role IN ('teacher', 'admin', 'student')) NOT NULL DEFAULT 'student';
        END IF;
      END $$;
    `);

    console.log("Database schema migrated successfully");
    
    // Create a default user for testing with hashed password
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.execute(`
      INSERT INTO users (username, password, display_name, role)
      VALUES ('test', $1, 'test', 'student')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
    
    console.log("Default user created");
    
    // Create modules table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        text JSONB NOT NULL,
        system_prompt_read TEXT NOT NULL,
        experiment_html TEXT NOT NULL,
        system_prompt_experiment TEXT NOT NULL,
        conclude_text TEXT NOT NULL,
        system_prompt_conclude TEXT NOT NULL
      );
    `);
    
    // Insert sample module
    await db.execute(`
      INSERT INTO modules (
        name, description, text, system_prompt_read, 
        experiment_html, system_prompt_experiment,
        conclude_text, system_prompt_conclude
      )
      VALUES (
        'Understanding AI Bias',
        'Learn about bias in AI systems through interactive experiments',
        '["AI systems can exhibit various forms of bias.", "These biases often stem from training data and algorithm design.", "Understanding these biases is crucial for responsible AI development."]',
        'You are a helpful AI tutor guiding students through understanding AI bias concepts.',
        '<div class="experiment-container"><h2>Bias Testing Interface</h2><div id="test-area"></div></div>',
        'You are helping students conduct and analyze bias experiments.',
        'Reflect on what you''ve learned about AI bias and its implications.',
        'You are helping students form meaningful conclusions about AI bias.'
      )
      ON CONFLICT DO NOTHING;
    `);
    
    console.log("Modules table created and populated");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();