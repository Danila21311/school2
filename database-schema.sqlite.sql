PRAGMA foreign_keys = ON;

CREATE TABLE roles (
  role_id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'blocked', 'pending')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE course_categories (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  teacher_id INTEGER,
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
  price REAL CHECK (price IS NULL OR price >= 0),
  course_status TEXT NOT NULL DEFAULT 'draft' CHECK (course_status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (category_id) REFERENCES course_categories(category_id),
  FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

CREATE TABLE course_modules (
  module_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  module_title TEXT NOT NULL,
  module_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order > 0),
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE learning_materials (
  material_id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  material_title TEXT NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('text', 'video', 'presentation', 'file', 'link')),
  material_url TEXT,
  material_content TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(module_id) ON DELETE CASCADE
);

CREATE TABLE enrollment_requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  user_id INTEGER,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  comment TEXT,
  request_status TEXT NOT NULL DEFAULT 'new' CHECK (request_status IN ('new', 'approved', 'rejected', 'completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(course_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE enrollments (
  enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrollment_status TEXT NOT NULL DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'cancelled')),
  progress_percent REAL NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  UNIQUE (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE assignments (
  assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  assignment_title TEXT NOT NULL,
  assignment_description TEXT NOT NULL,
  due_date TEXT,
  max_score INTEGER NOT NULL DEFAULT 100 CHECK (max_score > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(module_id) ON DELETE CASCADE
);

CREATE TABLE assignment_submissions (
  submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  answer_text TEXT,
  file_url TEXT,
  score INTEGER CHECK (score IS NULL OR score >= 0),
  teacher_comment TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_at TEXT,
  FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE course_progress (
  progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  completed_at TEXT,
  UNIQUE (enrollment_id, material_id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES learning_materials(material_id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action_type TEXT NOT NULL,
  action_description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_materials_module_id ON learning_materials(module_id);
CREATE INDEX idx_requests_course_id ON enrollment_requests(course_id);
CREATE INDEX idx_requests_user_id ON enrollment_requests(user_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_assignments_module_id ON assignments(module_id);
CREATE INDEX idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX idx_progress_enrollment_id ON course_progress(enrollment_id);
CREATE INDEX idx_progress_material_id ON course_progress(material_id);
CREATE INDEX idx_logs_user_id ON activity_logs(user_id);

INSERT INTO roles (role_name, description) VALUES
  ('student', 'Слушатель образовательной платформы'),
  ('teacher', 'Преподаватель, сопровождающий учебный процесс'),
  ('admin', 'Администратор веб-платформы');

INSERT INTO course_categories (category_name, description) VALUES
  ('Программирование', 'Курсы по разработке программного обеспечения'),
  ('Дизайн', 'Курсы по графическому и веб-дизайну'),
  ('Информационные технологии', 'Курсы по современным цифровым технологиям');
