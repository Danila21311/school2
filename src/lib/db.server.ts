import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const dbPath = join(process.cwd(), "portal.db");
const schemaPath = join(process.cwd(), "database-schema.sqlite.sql");
const db = new Database(dbPath);

try {
  const hasRolesTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'roles'")
    .get() as { name: string } | undefined;

  if (!hasRolesTable) {
    const schema = readFileSync(schemaPath, "utf-8");
    db.exec(schema);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_content_access (
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('theory', 'test', 'final_test')),
      is_enabled INTEGER NOT NULL DEFAULT 0 CHECK (is_enabled IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, course_id, content_type),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_module_results (
      user_id INTEGER NOT NULL,
      direction_key TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('test', 'final_test')),
      module_index INTEGER NOT NULL CHECK (module_index >= 0),
      score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
      total_questions INTEGER NOT NULL DEFAULT 1 CHECK (total_questions > 0),
      is_passed INTEGER NOT NULL DEFAULT 0 CHECK (is_passed IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, direction_key, content_type, module_index),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const seedPath = join(process.cwd(), "database-seed.sqlite.sql");
    if (existsSync(seedPath)) {
      db.exec(readFileSync(seedPath, "utf-8"));
      console.log("Seeded default users into portal.db");
    }
  }
} catch (e) {
  console.error("DB Init Error:", e);
}

export default db;
