import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

// Путь к файлу базы данных
const dbPath = join(process.cwd(), "portal.db");
const schemaPath = join(process.cwd(), "database-schema.sqlite.sql");

// Инициализация базы данных
const db = new Database(dbPath);

// Читаем и выполняем схему при первом запуске
try {
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
} catch (e) {
  console.error("Failed to initialize DB schema:", e);
}

// --- Функции для работы с пользователями ---

export interface DbUser {
  user_id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  account_status: string;
  created_at: string;
  role_name: string; // из JOIN roles
}

export function getUserByEmail(email: string): DbUser | undefined {
  const stmt = db.prepare(`
    SELECT u.*, r.role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.role_id 
    WHERE u.email = ?
  `);
  return stmt.get(email) as DbUser | undefined;
}

export function getUserById(userId: number): DbUser | undefined {
  const stmt = db.prepare(`
    SELECT u.*, r.role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.role_id 
    WHERE u.user_id = ?
  `);
  return stmt.get(userId) as DbUser | undefined;
}

export function createDbUser(data: {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "admin" | "teacher" | "student";
}) {
  // Найдем ID роли
  const roleRow: { role_id: number } = (db.prepare("SELECT role_id FROM roles WHERE role_name = ?").get(data.role) as any);
  if (!roleRow) throw new Error("Role not found");

  const stmt = db.prepare(`
    INSERT INTO users (role_id, full_name, email, phone, password_hash, account_status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);
  return stmt.run(roleRow.role_id, data.fullName, data.email, data.phone, data.passwordHash);
}

// --- Функции для курсов (пример для ЛК студента) ---

export interface DbEnrollment {
  course_id: number;
  title: string;
  progress_percent: number;
  enrollment_status: string;
  teacher_name: string;
}

export function getEnrollmentsForUser(userId: number): DbEnrollment[] {
  const stmt = db.prepare(`
    SELECT 
      c.course_id, 
      c.title, 
      e.progress_percent, 
      e.enrollment_status,
      u.full_name as teacher_name
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    LEFT JOIN users u ON c.teacher_id = u.user_id
    WHERE e.user_id = ?
  `);
  return stmt.all(userId) as DbEnrollment[];
}

export function getAllUsers(): DbUser[] {
  return db.prepare("SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id").all() as DbUser[];
}

export default db;