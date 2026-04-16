CREATE DATABASE IF NOT EXISTS online_teaching DEFAULT CHARACTER SET utf8mb4;
USE online_teaching;

DROP TABLE IF EXISTS question_favorite;
DROP TABLE IF EXISTS question_wrong_book;
DROP TABLE IF EXISTS practice_answer;
DROP TABLE IF EXISTS practice_record;
DROP TABLE IF EXISTS practice_set_question;
DROP TABLE IF EXISTS practice_set;
DROP TABLE IF EXISTS question_option;
DROP TABLE IF EXISTS question_bank;
DROP TABLE IF EXISTS submission;
DROP TABLE IF EXISTS assignment;
DROP TABLE IF EXISTS resource;
DROP TABLE IF EXISTS chapter;
DROP TABLE IF EXISTS study_progress;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  avatar VARCHAR(255) DEFAULT '',
  email VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  major_direction VARCHAR(100) DEFAULT NULL,
  interest_tags VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE course (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id BIGINT NOT NULL,
  category_id BIGINT DEFAULT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cover_url VARCHAR(255) DEFAULT NULL,
  tags VARCHAR(255) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  audit_reason VARCHAR(255) DEFAULT NULL,
  audit_time DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/ENROLLED/REJECTED/WITHDRAWN/REMOVED',
  apply_reason VARCHAR(500) DEFAULT NULL,
  review_remark VARCHAR(500) DEFAULT NULL,
  reviewed_by BIGINT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_course_student(course_id, student_id),
  KEY idx_enrollment_student_status_created(student_id, status, created_at),
  KEY idx_enrollment_course_status_created(course_id, status, created_at)
);

CREATE TABLE chapter (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  sort_no INT NOT NULL DEFAULT 1
);

CREATE TABLE resource (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chapter_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  url VARCHAR(255) NOT NULL
);

CREATE TABLE study_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  chapter_id BIGINT NOT NULL,
  resource_id BIGINT NOT NULL,
  progress_percent INT NOT NULL DEFAULT 0,
  learned_seconds INT NOT NULL DEFAULT 0,
  completed TINYINT NOT NULL DEFAULT 0,
  last_learned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_course_resource(student_id, course_id, resource_id),
  KEY idx_study_progress_student_course(student_id, course_id),
  KEY idx_study_progress_last_learned(last_learned_at)
);

CREATE TABLE assignment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  deadline DATETIME DEFAULT NULL
);

CREATE TABLE submission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  content TEXT,
  score INT DEFAULT NULL,
  comment VARCHAR(255) DEFAULT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_assignment_student(assignment_id, student_id)
);

CREATE TABLE question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'OPEN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_bank (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  chapter_id BIGINT DEFAULT NULL,
  teacher_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL,
  stem TEXT NOT NULL,
  answer_text VARCHAR(255) DEFAULT NULL,
  analysis TEXT,
  difficulty VARCHAR(20) DEFAULT 'EASY',
  score DECIMAL(10,2) DEFAULT 1.00,
  status VARCHAR(20) DEFAULT 'ENABLED',
  knowledge_point VARCHAR(100) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE question_option (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_label VARCHAR(10) NOT NULL,
  option_content VARCHAR(255) NOT NULL,
  is_correct TINYINT NOT NULL DEFAULT 0,
  sort_no INT NOT NULL DEFAULT 1
);

CREATE TABLE practice_set (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  chapter_id BIGINT DEFAULT NULL,
  teacher_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  total_score DECIMAL(10,2) DEFAULT 0.00,
  question_count INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  allow_retry TINYINT NOT NULL DEFAULT 1,
  show_answer_mode VARCHAR(20) NOT NULL DEFAULT 'AFTER_SUBMIT',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE practice_set_question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  practice_set_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  sort_no INT NOT NULL DEFAULT 1,
  score DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  UNIQUE KEY uk_practice_question(practice_set_id, question_id)
);

CREATE TABLE practice_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  practice_set_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  score DECIMAL(10,2) DEFAULT 0.00,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  used_seconds INT NOT NULL DEFAULT 0,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  submit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE practice_answer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  practice_record_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  student_answer TEXT,
  is_correct TINYINT NOT NULL DEFAULT 0,
  score DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_marked TINYINT NOT NULL DEFAULT 0,
  is_favorite TINYINT NOT NULL DEFAULT 0,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_wrong_book (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  wrong_count INT NOT NULL DEFAULT 1,
  last_wrong_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  UNIQUE KEY uk_wrong_student_question(student_id, question_id)
);

CREATE TABLE question_favorite (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_favorite_student_question(student_id, question_id)
);

INSERT INTO category(name) VALUES ('Programming'), ('Exam Prep'), ('Language');

-- All passwords are 123456
INSERT INTO sys_user(username, password, nickname, role, major_direction, interest_tags) VALUES
('admin', '$2a$10$zt6dUMTjNSyzINTGyiAgluna3mPm7qdgl26vj4tFpsFO6WlK5lXNm', 'Admin', 'ADMIN', NULL, NULL),
('teacher1', '$2a$10$zt6dUMTjNSyzINTGyiAgluna3mPm7qdgl26vj4tFpsFO6WlK5lXNm', 'Teacher Zhang', 'TEACHER', NULL, NULL),
('student1', '$2a$10$zt6dUMTjNSyzINTGyiAgluna3mPm7qdgl26vj4tFpsFO6WlK5lXNm', 'Student Li', 'STUDENT', 'Programming', 'Java, backend, algorithms');

INSERT INTO course(teacher_id, category_id, title, description, tags, status) VALUES
(2, 1, 'Java Fundamentals', 'Introductory Java course for beginners.', 'Java, beginner, syntax', 'APPROVED'),
(2, 1, 'Spring Boot Practice', 'Hands-on backend development with Spring Boot.', 'Spring Boot, backend, project', 'PENDING');

INSERT INTO enrollment(course_id, student_id, status, reviewed_by, reviewed_at) VALUES (1, 3, 'ENROLLED', 2, NOW());

INSERT INTO chapter(course_id, title, sort_no) VALUES
(1, 'Java Basics', 1),
(1, 'Object-Oriented Programming', 2);

INSERT INTO resource(chapter_id, title, type, url) VALUES
(1, 'Java Notes PDF', 'FILE', 'https://example.com/java.pdf');

INSERT INTO assignment(course_id, title, content, deadline) VALUES
(1, 'Homework 1', 'Complete the Java basics exercises.', '2026-12-31 23:59:59');

INSERT INTO question_bank(course_id, chapter_id, teacher_id, type, stem, answer_text, analysis, difficulty, score, status, knowledge_point) VALUES
(1, 1, 2, 'SINGLE', 'Which keyword is used to define a class in Java?', 'B', 'Use the class keyword when declaring a class.', 'EASY', 2.00, 'ENABLED', 'Java syntax'),
(1, 1, 2, 'MULTIPLE', 'Which of the following are Java primitive types?', 'A,C,D', 'int, double and boolean are primitive types.', 'MEDIUM', 3.00, 'ENABLED', 'Primitive types'),
(1, 2, 2, 'JUDGE', 'A subclass can directly access private fields of its parent class.', 'F', 'Private members cannot be accessed directly by subclasses.', 'EASY', 2.00, 'ENABLED', 'Encapsulation');

INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no) VALUES
(1, 'A', 'public', 0, 1),
(1, 'B', 'class', 1, 2),
(1, 'C', 'void', 0, 3),
(1, 'D', 'new', 0, 4),
(2, 'A', 'int', 1, 1),
(2, 'B', 'String', 0, 2),
(2, 'C', 'double', 1, 3),
(2, 'D', 'boolean', 1, 4),
(3, 'A', 'True', 0, 1),
(3, 'B', 'False', 1, 2);

INSERT INTO practice_set(course_id, chapter_id, teacher_id, title, description, type, total_score, question_count, duration_minutes, status, allow_retry, show_answer_mode) VALUES
(1, 1, 2, 'Chapter 1 Drill', 'Practice for Java basics chapter.', 'CHAPTER', 5.00, 2, 20, 'PUBLISHED', 1, 'AFTER_SUBMIT'),
(1, 2, 2, 'OOP Quick Test', 'Short test for object-oriented programming.', 'SPECIAL', 2.00, 1, 10, 'PUBLISHED', 1, 'AFTER_SUBMIT');

INSERT INTO practice_set_question(practice_set_id, question_id, sort_no, score) VALUES
(1, 1, 1, 2.00),
(1, 2, 2, 3.00),
(2, 3, 1, 2.00);
