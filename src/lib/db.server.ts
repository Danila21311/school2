import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

type SqliteDatabase = InstanceType<typeof Database>;

// На Render: при Persistent Disk укажи полный путь, например /data/portal.db
const dbPath =
  process.env.PORTAL_DB_PATH?.trim() || join(process.cwd(), "portal.db");
const schemaPath = join(process.cwd(), "database-schema.sqlite.sql");
const db = new Database(dbPath);

try {
  db.pragma("foreign_keys = ON");
} catch {
  /* ignore */
}

/**
 * Гарантирует, что в БД есть хотя бы два преподавателя для формы записи на программу.
 * Вызывается при старте и при каждом запросе списка (на случай «пустой» прод-БД).
 * Пароли legacy: DemoTeach1 / DemoTeach2 (см. portal-db verifyPassword).
 */
export function ensureEnrollmentTeacherSeeds(database: SqliteDatabase) {
  try {
    const row = database
      .prepare(
        `
      SELECT COUNT(*) AS c
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE r.role_name = 'teacher' AND u.account_status = 'active'
    `,
      )
      .get() as { c: number | bigint } | undefined;
    const n = Number(row?.c ?? 0);
    if (n > 0) return;

    const tr = database
      .prepare("SELECT role_id FROM roles WHERE role_name = 'teacher'")
      .get() as { role_id: number } | undefined;
    if (!tr) return;

    const seeds: Array<[string, string, string]> = [
      ["Иванова Мария Петровна", "roster.t1@noreply.portal.invalid", "hashed_DemoTeach1"],
      ["Петров Сергей Александрович", "roster.t2@noreply.portal.invalid", "hashed_DemoTeach2"],
    ];

    const upsert = database.prepare(`
      INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status)
      VALUES (?, ?, ?, NULL, ?, 'active')
      ON CONFLICT(email) DO UPDATE SET
        role_id = excluded.role_id,
        full_name = excluded.full_name,
        password_hash = excluded.password_hash,
        account_status = 'active'
    `);

    for (const [fullName, email, hash] of seeds) {
      upsert.run(tr.role_id, fullName, email, hash);
    }
  } catch (e) {
    console.error("ensureEnrollmentTeacherSeeds:", e);
  }
}

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

  ensureEnrollmentTeacherSeeds(db);
} catch (e) {
  console.error("DB Init Error:", e);
}

export default db;
