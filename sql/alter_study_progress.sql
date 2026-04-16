CREATE TABLE IF NOT EXISTS study_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  chapter_id BIGINT DEFAULT NULL,
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

SET @stmt = IF (
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'study_progress'
     AND COLUMN_NAME = 'chapter_id') = 0,
  'ALTER TABLE study_progress ADD COLUMN chapter_id BIGINT DEFAULT NULL AFTER course_id',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

SET @stmt = IF (
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'study_progress'
     AND COLUMN_NAME = 'progress_percent') = 0,
  'ALTER TABLE study_progress ADD COLUMN progress_percent INT NOT NULL DEFAULT 0 AFTER resource_id',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

SET @stmt = IF (
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'study_progress'
     AND COLUMN_NAME = 'learned_seconds') = 0,
  'ALTER TABLE study_progress ADD COLUMN learned_seconds INT NOT NULL DEFAULT 0 AFTER progress_percent',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

SET @stmt = IF (
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'study_progress'
     AND COLUMN_NAME = 'last_learned_at') = 0,
  'ALTER TABLE study_progress ADD COLUMN last_learned_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER completed',
  'SELECT 1'
);
PREPARE alter_stmt FROM @stmt;
EXECUTE alter_stmt;
DEALLOCATE PREPARE alter_stmt;

UPDATE study_progress
SET learned_seconds = progress_seconds
WHERE learned_seconds = 0
  AND progress_seconds IS NOT NULL
  AND progress_seconds > 0;

UPDATE study_progress
SET last_learned_at = COALESCE(last_study_time, last_learned_at, created_at)
WHERE last_learned_at IS NULL;

UPDATE study_progress sp
JOIN resource r ON r.id = sp.resource_id
SET sp.chapter_id = r.chapter_id
WHERE sp.chapter_id IS NULL;

UPDATE study_progress
SET progress_percent = CASE
  WHEN completed = 1 THEN 100
  WHEN learned_seconds > 0 THEN LEAST(99, progress_percent)
  ELSE progress_percent
END
WHERE progress_percent = 0;
