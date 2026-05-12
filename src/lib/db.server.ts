import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

// На Render: при Persistent Disk укажи полный путь, например /data/portal.db
const dbPath =
  process.env.PORTAL_DB_PATH?.trim() || join(process.cwd(), "portal.db");
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
} catch (e) {
  console.error("DB Init Error:", e);
}

export default db;
