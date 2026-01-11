-- Roles
CREATE TABLE IF NOT EXISTS role (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Grades
CREATE TABLE IF NOT EXISTS grade (
  grade_id INT PRIMARY KEY AUTO_INCREMENT,
  grade_number INT NOT NULL UNIQUE
);

-- Classrooms
CREATE TABLE IF NOT EXISTS classroom (
  class_id INT PRIMARY KEY AUTO_INCREMENT,
  grade_id INT NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  UNIQUE (class_name),
  FOREIGN KEY (grade_id) REFERENCES grade(grade_id)
);

-- Users (staff)
CREATE TABLE IF NOT EXISTS `user` (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role_id INT NOT NULL,
  assigned_class_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (role_id) REFERENCES role(role_id),
  FOREIGN KEY (assigned_class_id) REFERENCES classroom(class_id)
);

-- Students
CREATE TABLE IF NOT EXISTS student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  class_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (first_name, last_name, class_id),
  FOREIGN KEY (class_id) REFERENCES classroom(class_id)
);

-- Subjects
CREATE TABLE IF NOT EXISTS subject (
  subject_id INT PRIMARY KEY AUTO_INCREMENT,
  grade_id INT NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  UNIQUE (grade_id, subject_name),
  FOREIGN KEY (grade_id) REFERENCES grade(grade_id)
);

-- Academic years
CREATE TABLE IF NOT EXISTS academic_year (
  academic_year_id INT PRIMARY KEY AUTO_INCREMENT,
  year_label INT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE
);

-- Terms
CREATE TABLE IF NOT EXISTS term (
  term_id INT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id INT NOT NULL,
  term_number INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  UNIQUE (academic_year_id, term_number),
  FOREIGN KEY (academic_year_id) REFERENCES academic_year(academic_year_id)
);

-- Scores
CREATE TABLE IF NOT EXISTS score (
  score_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  term_id INT NOT NULL,
  teacher_user_id INT NOT NULL,
  score_value DECIMAL(5,2) NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id),
  FOREIGN KEY (subject_id) REFERENCES subject(subject_id),
  FOREIGN KEY (term_id) REFERENCES term(term_id),
  FOREIGN KEY (teacher_user_id) REFERENCES `user`(user_id),
  UNIQUE (student_id, subject_id, term_id)
);
