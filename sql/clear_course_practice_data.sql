USE online_teaching;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE practice_answer;
TRUNCATE TABLE practice_record;
TRUNCATE TABLE practice_set_question;
TRUNCATE TABLE practice_set;
TRUNCATE TABLE question_option;
TRUNCATE TABLE question_bank;
TRUNCATE TABLE resource;
TRUNCATE TABLE submission;
TRUNCATE TABLE assignment;
TRUNCATE TABLE question;
TRUNCATE TABLE enrollment;
TRUNCATE TABLE chapter;
TRUNCATE TABLE course;

SET FOREIGN_KEY_CHECKS = 1;
