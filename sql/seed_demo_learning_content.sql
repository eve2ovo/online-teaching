USE online_teaching;

INSERT INTO resource (
  chapter_id, title, type, file_name, file_size, duration, sort_no, storage_type, url
)
SELECT
  ch.id,
  CONCAT(ch.title, ' 视频讲解'),
  'VIDEO',
  CONCAT('course-', ch.course_id, '-chapter-', ch.sort_no, '.mp4'),
  0,
  900,
  1,
  'remote',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
FROM chapter ch
WHERE NOT EXISTS (
  SELECT 1 FROM resource r WHERE r.chapter_id = ch.id
);

INSERT INTO question_bank (
  course_id, chapter_id, teacher_id, type, stem, answer_text, analysis,
  difficulty, score, status, knowledge_point
)
SELECT
  c.id,
  ch.id,
  c.teacher_id,
  'SINGLE',
  CONCAT('关于《', ch.title, '》，以下哪项说法更符合本章节核心内容？'),
  'A',
  CONCAT('A 选项对应本章节的基础学习目标，便于学生完成入门练习与知识回顾。'),
  'EASY',
  2.00,
  'ENABLED',
  ch.title
FROM course c
JOIN chapter ch ON ch.course_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM question_bank qb
  WHERE qb.course_id = c.id AND qb.chapter_id = ch.id
);

INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'A', CONCAT('掌握 ', ch.title, ' 的基础概念与核心方法'), 1, 1
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE NOT EXISTS (SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id);

INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'B', CONCAT('完全跳过 ', ch.title, ' 的基础训练直接进入综合项目'), 0, 2
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE NOT EXISTS (SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 2);

INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'C', CONCAT('只记忆术语，不关注 ', ch.title, ' 的实际应用场景'), 0, 3
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE NOT EXISTS (SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 3);

INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'D', CONCAT('忽略 ', ch.title, '，先学习与本章无关的高阶主题'), 0, 4
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE NOT EXISTS (SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 4);

INSERT INTO practice_set (
  course_id, chapter_id, teacher_id, title, description, type, total_score,
  question_count, duration_minutes, status, allow_retry, show_answer_mode
)
SELECT
  c.id,
  ch.id,
  c.teacher_id,
  CONCAT(ch.title, ' 章节练习'),
  CONCAT('围绕“', ch.title, '”设计的基础练习，用于帮助学生完成本章节知识点巩固。'),
  'CHAPTER',
  2.00,
  1,
  15,
  'PUBLISHED',
  1,
  'AFTER_SUBMIT'
FROM course c
JOIN chapter ch ON ch.course_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM practice_set ps
  WHERE ps.course_id = c.id AND ps.chapter_id = ch.id
);

INSERT INTO practice_set_question (practice_set_id, question_id, sort_no, score)
SELECT
  ps.id,
  qb.id,
  1,
  2.00
FROM practice_set ps
JOIN question_bank qb
  ON qb.course_id = ps.course_id AND qb.chapter_id = ps.chapter_id
WHERE NOT EXISTS (
  SELECT 1 FROM practice_set_question pq WHERE pq.practice_set_id = ps.id
);
