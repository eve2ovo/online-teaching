CREATE TABLE IF NOT EXISTS notification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  content VARCHAR(500) NOT NULL,
  type VARCHAR(40) NOT NULL,
  related_id BIGINT DEFAULT NULL,
  is_read TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notification_user_read_created (user_id, is_read, created_at)
);

CREATE TABLE IF NOT EXISTS assignment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  deadline DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS submission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  content TEXT,
  score INT DEFAULT NULL,
  comment VARCHAR(255) DEFAULT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_assignment_student(assignment_id, student_id)
);

-- Keep each migration independent so Spring can continue when one
-- legacy database already has part of the schema.
ALTER TABLE enrollment
  ADD COLUMN status VARCHAR(20) NULL COMMENT 'PENDING/ENROLLED/REJECTED/WITHDRAWN/REMOVED' AFTER student_id;

ALTER TABLE enrollment
  ADD COLUMN apply_reason VARCHAR(500) NULL COMMENT 'student apply reason' AFTER status;

ALTER TABLE enrollment
  ADD COLUMN review_remark VARCHAR(500) NULL COMMENT 'teacher review remark' AFTER apply_reason;

ALTER TABLE enrollment
  ADD COLUMN reviewed_by BIGINT NULL COMMENT 'review teacher id' AFTER review_remark;

ALTER TABLE enrollment
  ADD COLUMN reviewed_at DATETIME NULL COMMENT 'review time' AFTER reviewed_by;

ALTER TABLE enrollment
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'update time' AFTER created_at;

UPDATE enrollment
SET status = 'ENROLLED'
WHERE status IS NULL;

ALTER TABLE enrollment
  MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/ENROLLED/REJECTED/WITHDRAWN/REMOVED',
  MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'update time';

CREATE INDEX idx_enrollment_student_status_created
ON enrollment(student_id, status, created_at);

CREATE INDEX idx_enrollment_course_status_created
ON enrollment(course_id, status, created_at);
