USE online_teaching;

-- =========================
-- 1. 课程主数据
-- 审核后按需取消注释执行
-- =========================

-- INSERT INTO course (teacher_id, category_id, title, description, status)
-- VALUES
-- (2, 1, 'Java 入门课程', '面向零基础学生的 Java 编程入门课程。', 'APPROVED'),
-- (2, 1, 'Spring Boot 实战', '通过完整项目学习 Spring Boot 后端开发。', 'APPROVED'),
-- (2, 1, 'Web 前端开发实战', '系统学习 HTML、CSS、JavaScript 与前后端联调。', 'APPROVED'),
-- (2, 1, 'Python 编程基础', '学习 Python 基础语法、函数、文件处理与常用标准库。', 'APPROVED'),
-- (2, 1, 'MySQL 数据库应用', '围绕表设计、SQL、索引和事务掌握 MySQL 核心能力。', 'APPROVED');

-- =========================
-- 2. 章节数据
-- 注意：course_id 需要按你最终插入后的真实课程 ID 调整
-- =========================

-- INSERT INTO chapter (course_id, title, sort_no) VALUES
-- (1, '第一章 Java 基础语法', 1),
-- (1, '第二章 面向对象编程', 2),
-- (1, '第三章 集合与泛型', 3),
-- (1, '第四章 异常处理与 IO', 4),
-- (1, '第五章 Java 综合练习', 5);

-- INSERT INTO chapter (course_id, title, sort_no) VALUES
-- (2, '第一章 Spring Boot 快速上手', 1),
-- (2, '第二章 REST 接口开发', 2),
-- (2, '第三章 数据持久化', 3),
-- (2, '第四章 权限认证', 4),
-- (2, '第五章 项目部署与优化', 5);

-- INSERT INTO chapter (course_id, title, sort_no) VALUES
-- (3, '第一章 Web 与浏览器基础', 1),
-- (3, '第二章 HTML 页面结构', 2),
-- (3, '第三章 CSS 页面样式', 3),
-- (3, '第四章 JavaScript 交互开发', 4),
-- (3, '第五章 前后端联调实战', 5);

-- INSERT INTO chapter (course_id, title, sort_no) VALUES
-- (4, '第一章 Python 环境搭建', 1),
-- (4, '第二章 Python 基础语法', 2),
-- (4, '第三章 函数与模块', 3),
-- (4, '第四章 文件操作', 4),
-- (4, '第五章 Python 综合练习', 5);

-- INSERT INTO chapter (course_id, title, sort_no) VALUES
-- (5, '第一章 数据库基础概念', 1),
-- (5, '第二章 数据表设计', 2),
-- (5, '第三章 SQL 查询', 3),
-- (5, '第四章 索引优化', 4),
-- (5, '第五章 事务与权限', 5);

-- =========================
-- 3. 学习资源示例
-- 注意：chapter_id 需要按你最终插入后的真实章节 ID 调整
-- =========================

-- INSERT INTO resource (
--   chapter_id, title, type, file_name, file_size, duration, sort_no, storage_type, url
-- ) VALUES
-- (1, 'Java 基础语法 视频讲解', 'VIDEO', 'java-chapter-1.mp4', 0, 900, 1, 'remote', 'https://your-domain.example/video/java-chapter-1.mp4'),
-- (2, '面向对象编程 视频讲解', 'VIDEO', 'java-chapter-2.mp4', 0, 900, 1, 'remote', 'https://your-domain.example/video/java-chapter-2.mp4');

-- =========================
-- 4. 题库示例
-- 注意：course_id / chapter_id / teacher_id 需要按真实数据调整
-- =========================

-- INSERT INTO question_bank (
--   course_id, chapter_id, teacher_id, type, stem, answer_text, analysis,
--   difficulty, score, status, knowledge_point
-- ) VALUES
-- (1, 1, 2, 'SINGLE', 'Java 中用于定义类的关键字是什么？', 'B', '定义类应使用 class 关键字。', 'EASY', 2.00, 'ENABLED', 'Java 语法'),
-- (2, 6, 2, 'SINGLE', 'Spring Boot 默认推荐使用哪种方式组织 REST 控制器？', 'A', '通常使用 @RestController 组织接口控制器。', 'EASY', 2.00, 'ENABLED', 'Spring Boot 接口开发');

-- INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no) VALUES
-- (1, 'A', 'public', 0, 1),
-- (1, 'B', 'class', 1, 2),
-- (1, 'C', 'void', 0, 3),
-- (1, 'D', 'static', 0, 4);

-- INSERT INTO question_option (question_id, option_label, option_content, is_correct, sort_no) VALUES
-- (2, 'A', '@RestController', 1, 1),
-- (2, 'B', '@MapperScan', 0, 2),
-- (2, 'C', '@EnableAsync', 0, 3),
-- (2, 'D', '@ComponentScan', 0, 4);

-- =========================
-- 5. 练习集示例
-- 注意：course_id / chapter_id / teacher_id / question_id 需要按真实数据调整
-- =========================

-- INSERT INTO practice_set (
--   course_id, chapter_id, teacher_id, title, description, type, total_score,
--   question_count, duration_minutes, status, allow_retry, show_answer_mode
-- ) VALUES
-- (1, 1, 2, 'Java 基础语法 章节练习', '用于巩固 Java 基础语法的入门练习。', 'CHAPTER', 2.00, 1, 15, 'PUBLISHED', 1, 'AFTER_SUBMIT'),
-- (2, 6, 2, 'Spring Boot 快速上手 章节练习', '用于巩固 Spring Boot 基础配置与接口开发。', 'CHAPTER', 2.00, 1, 15, 'PUBLISHED', 1, 'AFTER_SUBMIT');

-- INSERT INTO practice_set_question (practice_set_id, question_id, sort_no, score) VALUES
-- (1, 1, 1, 2.00),
-- (2, 2, 1, 2.00);
