/* =========================================================
   SRMS Seed Data (deterministic + repeatable)
   Works with your exact schema.
   Creates: roles, grades, classrooms, users, students, subjects,
            academic_years, terms, scores.
   ========================================================= */

START TRANSACTION;

-- 1) Roles
INSERT IGNORE INTO role (name)
VALUES ('Admin'), ('Teacher');

-- 2) Grades (1..6)
INSERT IGNORE INTO grade (grade_number)
VALUES (1),(2),(3),(4),(5),(6);

-- 3) Classrooms (6 per grade: A..F => 1A..6F)
INSERT IGNORE INTO classroom (grade_id, class_name)
SELECT g.grade_id, CONCAT(g.grade_number, l.letter)
FROM grade g
CROSS JOIN (
  SELECT 'A' AS letter UNION ALL SELECT 'B' UNION ALL SELECT 'C'
  UNION ALL SELECT 'D' UNION ALL SELECT 'E' UNION ALL SELECT 'F'
) l;

-- 4) Users
-- 4a) One Admin
INSERT IGNORE INTO `user` (staff_id, password_hash, first_name, last_name, role_id, assigned_class_id, is_active)
SELECT
  'A-0001',
  '$2a$12$7PJ8PyNDt8WTgXJznQrFj.R1hAUxhesrXZu0FIuYJcvsq7cbI5uZ.',
  'System',
  'Admin',
  r.role_id,
  NULL,
  TRUE
FROM role r
WHERE r.name = 'Admin';

-- 4b) One Teacher per classroom
INSERT IGNORE INTO `user` (staff_id, password_hash, first_name, last_name, role_id, assigned_class_id, is_active)
SELECT
  CONCAT('T-', c.class_name),
  '$2a$12$7PJ8PyNDt8WTgXJznQrFj.R1hAUxhesrXZu0FIuYJcvsq7cbI5uZ.',
  CONCAT('Teacher ', c.class_name),
  'User',
  r.role_id,
  c.class_id,
  TRUE
FROM classroom c
JOIN role r ON r.name = 'Teacher';

-- 5) Students (2 per classroom)
INSERT IGNORE INTO student (first_name, last_name, class_id, is_active)
SELECT
  CONCAT('Student', n.n),
  CONCAT('Class', c.class_name),
  c.class_id,
  TRUE
FROM classroom c
CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2) n;

-- 6) Subjects (4 per grade)
INSERT IGNORE INTO subject (grade_id, subject_name)
SELECT g.grade_id, s.subject_name
FROM grade g
CROSS JOIN (
  SELECT 'Math' AS subject_name
  UNION ALL SELECT 'English'
  UNION ALL SELECT 'Science'
  UNION ALL SELECT 'History'
) s;

-- 7) Academic Years (5 total, latest ends in 2026 and is_active = TRUE)
-- year_label is interpreted as the ENDING year (e.g., 2026 = Sep 2025 to Jun 2026)
INSERT IGNORE INTO academic_year (year_label, start_date, end_date, is_active)
VALUES
  (2022, '2021-09-01', '2022-06-30', FALSE),
  (2023, '2022-09-01', '2023-06-30', FALSE),
  (2024, '2023-09-01', '2024-06-30', FALSE),
  (2025, '2024-09-01', '2025-06-30', FALSE),
  (2026, '2025-09-01', '2026-06-30', TRUE);

-- 8) Terms (3 per academic year, generic schedule)
-- Term 1: Sep-Nov (start year = year_label - 1)
-- Term 2: Jan-Mar (end year = year_label)
-- Term 3: May-Jun (end year = year_label)
-- Insert only missing terms (repeatable)
INSERT IGNORE INTO term (academic_year_id, term_number, start_date, end_date)
SELECT ay.academic_year_id, 1,
       STR_TO_DATE(CONCAT(ay.year_label - 1, '-09-01'), '%Y-%m-%d'),
       STR_TO_DATE(CONCAT(ay.year_label - 1, '-11-30'), '%Y-%m-%d')
FROM academic_year ay
UNION ALL
SELECT ay.academic_year_id, 2,
       STR_TO_DATE(CONCAT(ay.year_label, '-01-01'), '%Y-%m-%d'),
       STR_TO_DATE(CONCAT(ay.year_label, '-03-31'), '%Y-%m-%d')
FROM academic_year ay
UNION ALL
SELECT ay.academic_year_id, 3,
       STR_TO_DATE(CONCAT(ay.year_label, '-05-01'), '%Y-%m-%d'),
       STR_TO_DATE(CONCAT(ay.year_label, '-06-30'), '%Y-%m-%d')
FROM academic_year ay;

-- 9) Scores (all students, all terms, subjects for their grade, recorded by their class teacher)
-- Expected: 72 students * 4 subjects * 15 terms = 4320 scores
INSERT IGNORE INTO score (student_id, subject_id, term_id, teacher_user_id, score_value, recorded_at)
SELECT
  st.student_id,
  sub.subject_id,
  tr.term_id,
  teach.user_id,

  -- deterministic score range 40..100
  (40 + MOD((st.student_id * 7 + sub.subject_id * 11 + tr.term_id * 5), 61)) AS score_value,

  -- deterministic recorded_at within term date range at 10:00:00
  TIMESTAMP(
    DATE_ADD(
      tr.start_date,
      INTERVAL MOD(
        (st.student_id + sub.subject_id + tr.term_id),
        (DATEDIFF(tr.end_date, tr.start_date) + 1)
      ) DAY
    ),
    '10:00:00'
  ) AS recorded_at

FROM student st
JOIN classroom c ON c.class_id = st.class_id
JOIN subject sub ON sub.grade_id = c.grade_id
JOIN term tr ON 1=1
JOIN `user` teach ON teach.assigned_class_id = st.class_id
JOIN role r ON r.role_id = teach.role_id
WHERE r.name = 'Teacher';

COMMIT;