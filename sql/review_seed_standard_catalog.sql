USE online_teaching;

-- ============================================
-- 标准课程目录种子数据
-- 说明：
-- 1. 本脚本按“5个分类 * 每类5门课程 * 每课5章 * 每章5题”生成数据
-- 2. 采用幂等写法，可重复执行，不会重复插入相同标题的数据
-- 3. 默认课程归属教师 teacher_id = 2，可按需修改
-- 4. 仅写入：category / course / chapter / question_bank / question_option / practice_set / practice_set_question
-- ============================================

SET @teacher_id = 2;

DROP TEMPORARY TABLE IF EXISTS seed_category;
CREATE TEMPORARY TABLE seed_category (
  name VARCHAR(100) PRIMARY KEY
);

INSERT INTO seed_category(name) VALUES
('编程开发'),
('前端与设计'),
('数据与人工智能'),
('软件工程'),
('计算机基础');

INSERT INTO category(name)
SELECT sc.name
FROM seed_category sc
WHERE NOT EXISTS (
  SELECT 1 FROM category c WHERE c.name = sc.name
);

DROP TEMPORARY TABLE IF EXISTS seed_course;
CREATE TEMPORARY TABLE seed_course (
  category_name VARCHAR(100) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  PRIMARY KEY (title)
);

INSERT INTO seed_course(category_name, title, description) VALUES
('编程开发', 'Java 程序设计基础', '面向初学者系统讲解 Java 语法、面向对象思想与基础编程实践。'),
('编程开发', 'Python 编程入门', '学习 Python 基础语法、函数、模块与文件处理，适合作为第一门脚本语言课程。'),
('编程开发', 'C 语言程序设计', '掌握 C 语言语法、数组、指针和函数，打牢程序设计基础。'),
('编程开发', 'Spring Boot 企业开发', '围绕企业级后端开发讲解 Spring Boot、接口设计与项目部署。'),
('编程开发', 'Go 语言服务开发', '学习 Go 语言语法、并发模型与 Web 服务开发基础。'),

('前端与设计', 'Web 前端开发基础', '从 HTML、CSS、JavaScript 入手，掌握前端页面开发基本能力。'),
('前端与设计', 'Vue 3 项目开发', '基于 Vue 3、组件化思维与工程化工具完成前端项目开发。'),
('前端与设计', 'React 应用开发', '系统学习 React 组件开发、状态管理与常见项目结构。'),
('前端与设计', 'UI 设计基础', '学习界面设计原则、视觉层级、布局规范与设计表达能力。'),
('前端与设计', '交互原型设计', '掌握产品原型图、交互流程和低保真到高保真设计方法。'),

('数据与人工智能', 'MySQL 数据库应用', '学习关系数据库设计、SQL 查询、索引优化与事务控制。'),
('数据与人工智能', '数据分析基础', '围绕数据清洗、统计分析与可视化建立数据分析入门能力。'),
('数据与人工智能', '机器学习导论', '介绍监督学习、模型评估和常见机器学习算法。'),
('数据与人工智能', '深度学习基础', '理解神经网络、反向传播、卷积网络等深度学习基础内容。'),
('数据与人工智能', '大模型与智能体应用', '结合大模型、提示词工程与工具调用理解智能体应用开发。'),

('软件工程', '软件工程导论', '覆盖需求分析、系统设计、编码规范、测试与维护全流程。'),
('软件工程', '软件测试基础', '学习测试理论、用例设计、接口测试和缺陷管理。'),
('软件工程', '项目管理与敏捷开发', '掌握需求拆解、迭代计划、Scrum 协作与项目风险管理。'),
('软件工程', '接口设计与系统集成', '围绕 REST 接口设计、文档规范与系统联调展开实践。'),
('软件工程', 'DevOps 持续交付实践', '讲解持续集成、自动化部署、监控与交付流程优化。'),

('计算机基础', '计算机网络基础', '建立网络分层、常见协议、网络通信与应用层服务基础认知。'),
('计算机基础', '数据结构与算法', '掌握线性结构、树、图与常见算法思想和复杂度分析。'),
('计算机基础', '操作系统原理', '从进程线程、内存管理到文件系统理解操作系统核心机制。'),
('计算机基础', '计算机组成原理', '理解计算机硬件系统、指令执行过程与存储结构。'),
('计算机基础', '信息安全基础', '学习加密、认证、访问控制与常见安全风险防护思路。');

INSERT INTO course(teacher_id, category_id, title, description, status)
SELECT
  @teacher_id,
  c.id,
  sc.title,
  sc.description,
  'APPROVED'
FROM seed_course sc
JOIN category c ON c.name = sc.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM course co WHERE co.title = sc.title
);

DROP TEMPORARY TABLE IF EXISTS seed_chapter;
CREATE TEMPORARY TABLE seed_chapter (
  course_title VARCHAR(100) NOT NULL,
  sort_no INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  PRIMARY KEY (course_title, sort_no)
);

INSERT INTO seed_chapter(course_title, sort_no, title) VALUES
('Java 程序设计基础', 1, '第一章 Java 开发环境与基础语法'),
('Java 程序设计基础', 2, '第二章 流程控制与数组'),
('Java 程序设计基础', 3, '第三章 面向对象编程'),
('Java 程序设计基础', 4, '第四章 常用类与集合'),
('Java 程序设计基础', 5, '第五章 异常处理与综合练习'),

('Python 编程入门', 1, '第一章 Python 环境搭建'),
('Python 编程入门', 2, '第二章 基础语法与数据类型'),
('Python 编程入门', 3, '第三章 条件、循环与函数'),
('Python 编程入门', 4, '第四章 模块与文件操作'),
('Python 编程入门', 5, '第五章 Python 项目实战'),

('C 语言程序设计', 1, '第一章 C 语言概述与开发环境'),
('C 语言程序设计', 2, '第二章 顺序结构与分支结构'),
('C 语言程序设计', 3, '第三章 循环结构与函数'),
('C 语言程序设计', 4, '第四章 数组、字符串与指针'),
('C 语言程序设计', 5, '第五章 结构体与综合程序设计'),

('Spring Boot 企业开发', 1, '第一章 Spring Boot 快速上手'),
('Spring Boot 企业开发', 2, '第二章 REST 接口设计'),
('Spring Boot 企业开发', 3, '第三章 数据持久化开发'),
('Spring Boot 企业开发', 4, '第四章 安全认证与权限控制'),
('Spring Boot 企业开发', 5, '第五章 项目部署与性能优化'),

('Go 语言服务开发', 1, '第一章 Go 语言基础语法'),
('Go 语言服务开发', 2, '第二章 函数、结构体与接口'),
('Go 语言服务开发', 3, '第三章 并发编程基础'),
('Go 语言服务开发', 4, '第四章 Web 服务开发'),
('Go 语言服务开发', 5, '第五章 工程实践与部署'),

('Web 前端开发基础', 1, '第一章 Web 与浏览器基础'),
('Web 前端开发基础', 2, '第二章 HTML 页面结构'),
('Web 前端开发基础', 3, '第三章 CSS 页面样式'),
('Web 前端开发基础', 4, '第四章 JavaScript 交互开发'),
('Web 前端开发基础', 5, '第五章 前端综合页面实战'),

('Vue 3 项目开发', 1, '第一章 Vue 3 基础概念'),
('Vue 3 项目开发', 2, '第二章 组件通信与状态管理'),
('Vue 3 项目开发', 3, '第三章 路由与页面组织'),
('Vue 3 项目开发', 4, '第四章 接口调用与数据展示'),
('Vue 3 项目开发', 5, '第五章 Vue 项目实战'),

('React 应用开发', 1, '第一章 React 基础与 JSX'),
('React 应用开发', 2, '第二章 组件与 Props State'),
('React 应用开发', 3, '第三章 Hooks 编程模式'),
('React 应用开发', 4, '第四章 路由与接口联调'),
('React 应用开发', 5, '第五章 React 项目开发实践'),

('UI 设计基础', 1, '第一章 设计原则与视觉认知'),
('UI 设计基础', 2, '第二章 颜色与字体规范'),
('UI 设计基础', 3, '第三章 栅格与页面布局'),
('UI 设计基础', 4, '第四章 组件设计与界面统一'),
('UI 设计基础', 5, '第五章 设计稿输出与展示'),

('交互原型设计', 1, '第一章 产品需求与页面流程'),
('交互原型设计', 2, '第二章 低保真原型设计'),
('交互原型设计', 3, '第三章 交互逻辑与跳转关系'),
('交互原型设计', 4, '第四章 高保真原型表达'),
('交互原型设计', 5, '第五章 原型评审与优化'),

('MySQL 数据库应用', 1, '第一章 数据库基础概念'),
('MySQL 数据库应用', 2, '第二章 表设计与约束'),
('MySQL 数据库应用', 3, '第三章 SQL 查询语句'),
('MySQL 数据库应用', 4, '第四章 索引与性能优化'),
('MySQL 数据库应用', 5, '第五章 事务与权限管理'),

('数据分析基础', 1, '第一章 数据分析流程概述'),
('数据分析基础', 2, '第二章 数据清洗与预处理'),
('数据分析基础', 3, '第三章 统计分析方法'),
('数据分析基础', 4, '第四章 可视化图表表达'),
('数据分析基础', 5, '第五章 综合数据分析案例'),

('机器学习导论', 1, '第一章 机器学习基本概念'),
('机器学习导论', 2, '第二章 数据集与特征工程'),
('机器学习导论', 3, '第三章 监督学习算法'),
('机器学习导论', 4, '第四章 模型评估与调参'),
('机器学习导论', 5, '第五章 机器学习应用实践'),

('深度学习基础', 1, '第一章 神经网络基础'),
('深度学习基础', 2, '第二章 前向传播与反向传播'),
('深度学习基础', 3, '第三章 卷积神经网络'),
('深度学习基础', 4, '第四章 模型训练与优化'),
('深度学习基础', 5, '第五章 深度学习案例实践'),

('大模型与智能体应用', 1, '第一章 大模型基本原理'),
('大模型与智能体应用', 2, '第二章 提示词工程'),
('大模型与智能体应用', 3, '第三章 工具调用与函数编排'),
('大模型与智能体应用', 4, '第四章 智能体工作流设计'),
('大模型与智能体应用', 5, '第五章 大模型应用项目实践'),

('软件工程导论', 1, '第一章 软件工程概述'),
('软件工程导论', 2, '第二章 需求分析方法'),
('软件工程导论', 3, '第三章 系统设计基础'),
('软件工程导论', 4, '第四章 编码规范与质量管理'),
('软件工程导论', 5, '第五章 软件维护与演进'),

('软件测试基础', 1, '第一章 软件测试基础概念'),
('软件测试基础', 2, '第二章 测试用例设计'),
('软件测试基础', 3, '第三章 功能测试与回归测试'),
('软件测试基础', 4, '第四章 接口测试基础'),
('软件测试基础', 5, '第五章 缺陷管理与测试报告'),

('项目管理与敏捷开发', 1, '第一章 项目管理基础'),
('项目管理与敏捷开发', 2, '第二章 需求拆解与排期'),
('项目管理与敏捷开发', 3, '第三章 Scrum 敏捷开发流程'),
('项目管理与敏捷开发', 4, '第四章 团队协作与风险管理'),
('项目管理与敏捷开发', 5, '第五章 项目复盘与交付'),

('接口设计与系统集成', 1, '第一章 接口设计原则'),
('接口设计与系统集成', 2, '第二章 RESTful 风格接口'),
('接口设计与系统集成', 3, '第三章 接口文档与规范'),
('接口设计与系统集成', 4, '第四章 第三方系统对接'),
('接口设计与系统集成', 5, '第五章 联调与集成测试'),

('DevOps 持续交付实践', 1, '第一章 DevOps 理念与流程'),
('DevOps 持续交付实践', 2, '第二章 持续集成工具使用'),
('DevOps 持续交付实践', 3, '第三章 自动化测试与构建'),
('DevOps 持续交付实践', 4, '第四章 自动化部署与发布'),
('DevOps 持续交付实践', 5, '第五章 监控告警与持续优化'),

('计算机网络基础', 1, '第一章 网络体系结构'),
('计算机网络基础', 2, '第二章 数据链路层与局域网'),
('计算机网络基础', 3, '第三章 IP 与路由基础'),
('计算机网络基础', 4, '第四章 TCP UDP 与传输层'),
('计算机网络基础', 5, '第五章 HTTP 与网络应用'),

('数据结构与算法', 1, '第一章 算法复杂度分析'),
('数据结构与算法', 2, '第二章 线性表与栈队列'),
('数据结构与算法', 3, '第三章 树与二叉树'),
('数据结构与算法', 4, '第四章 图结构与遍历'),
('数据结构与算法', 5, '第五章 排序与查找算法'),

('操作系统原理', 1, '第一章 操作系统概述'),
('操作系统原理', 2, '第二章 进程与线程'),
('操作系统原理', 3, '第三章 内存管理'),
('操作系统原理', 4, '第四章 文件系统'),
('操作系统原理', 5, '第五章 设备管理与调度'),

('计算机组成原理', 1, '第一章 计算机系统结构'),
('计算机组成原理', 2, '第二章 数据表示与运算'),
('计算机组成原理', 3, '第三章 存储系统'),
('计算机组成原理', 4, '第四章 指令系统与控制器'),
('计算机组成原理', 5, '第五章 CPU 工作原理'),

('信息安全基础', 1, '第一章 信息安全概述'),
('信息安全基础', 2, '第二章 密码学基础'),
('信息安全基础', 3, '第三章 身份认证与授权'),
('信息安全基础', 4, '第四章 常见安全攻击与防护'),
('信息安全基础', 5, '第五章 安全管理与实践');

INSERT INTO chapter(course_id, title, sort_no)
SELECT
  co.id,
  sch.title,
  sch.sort_no
FROM seed_chapter sch
JOIN course co ON co.title = sch.course_title
WHERE NOT EXISTS (
  SELECT 1 FROM chapter ch
  WHERE ch.course_id = co.id
    AND ch.sort_no = sch.sort_no
);

DROP TEMPORARY TABLE IF EXISTS seed_question_no;
CREATE TEMPORARY TABLE seed_question_no (
  n INT PRIMARY KEY,
  difficulty VARCHAR(20) NOT NULL,
  score DECIMAL(10,2) NOT NULL
);

INSERT INTO seed_question_no(n, difficulty, score) VALUES
(1, 'EASY', 2.00),
(2, 'EASY', 2.00),
(3, 'MEDIUM', 3.00),
(4, 'MEDIUM', 3.00),
(5, 'HARD', 4.00);

INSERT INTO question_bank(
  course_id, chapter_id, teacher_id, type, stem, answer_text, analysis,
  difficulty, score, status, knowledge_point
)
SELECT
  ch.course_id,
  ch.id,
  co.teacher_id,
  'SINGLE',
  CONCAT('【', ch.title, '】第', sqn.n, '题：以下哪项最符合本章节的核心知识点？'),
  'A',
  CONCAT('本题用于巩固“', ch.title, '”的重点内容，建议结合课堂案例理解。'),
  sqn.difficulty,
  sqn.score,
  'ENABLED',
  ch.title
FROM chapter ch
JOIN course co ON co.id = ch.course_id
JOIN seed_question_no sqn
WHERE NOT EXISTS (
  SELECT 1 FROM question_bank qb
  WHERE qb.chapter_id = ch.id
    AND qb.stem = CONCAT('【', ch.title, '】第', sqn.n, '题：以下哪项最符合本章节的核心知识点？')
);

INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'A', CONCAT('掌握 ', ch.title, ' 的基础概念、关键术语和典型应用场景'), 1, 1
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE qb.stem LIKE '【%】第%题：以下哪项最符合本章节的核心知识点？'
  AND NOT EXISTS (
    SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 1
  );

INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'B', CONCAT('跳过 ', ch.title, ' 的基础知识，直接开始复杂项目开发'), 0, 2
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE qb.stem LIKE '【%】第%题：以下哪项最符合本章节的核心知识点？'
  AND NOT EXISTS (
    SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 2
  );

INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'C', CONCAT('只记忆 ', ch.title, ' 的定义，不结合任何示例和实践'), 0, 3
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE qb.stem LIKE '【%】第%题：以下哪项最符合本章节的核心知识点？'
  AND NOT EXISTS (
    SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 3
  );

INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no)
SELECT qb.id, 'D', CONCAT('忽略 ', ch.title, '，优先学习与本章无关的高阶专题'), 0, 4
FROM question_bank qb
JOIN chapter ch ON ch.id = qb.chapter_id
WHERE qb.stem LIKE '【%】第%题：以下哪项最符合本章节的核心知识点？'
  AND NOT EXISTS (
    SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.sort_no = 4
  );

INSERT INTO practice_set(
  course_id, chapter_id, teacher_id, title, description, type, total_score,
  question_count, duration_minutes, status, allow_retry, show_answer_mode
)
SELECT
  ch.course_id,
  ch.id,
  co.teacher_id,
  CONCAT(ch.title, ' 章节练习'),
  CONCAT('用于巩固“', ch.title, '”知识点的标准章节练习，共 5 题。'),
  'CHAPTER',
  14.00,
  5,
  20,
  'PUBLISHED',
  1,
  'AFTER_SUBMIT'
FROM chapter ch
JOIN course co ON co.id = ch.course_id
WHERE NOT EXISTS (
  SELECT 1 FROM practice_set ps
  WHERE ps.course_id = ch.course_id
    AND ps.chapter_id = ch.id
    AND ps.title = CONCAT(ch.title, ' 章节练习')
);

INSERT INTO practice_set_question(practice_set_id, question_id, sort_no, score)
SELECT
  ps.id,
  qb.id,
  ROW_NUMBER() OVER (PARTITION BY ps.id ORDER BY qb.id) AS sort_no,
  qb.score
FROM practice_set ps
JOIN question_bank qb
  ON qb.course_id = ps.course_id
 AND qb.chapter_id = ps.chapter_id
WHERE ps.title = CONCAT((SELECT ch.title FROM chapter ch WHERE ch.id = ps.chapter_id), ' 章节练习')
  AND NOT EXISTS (
    SELECT 1 FROM practice_set_question pq
    WHERE pq.practice_set_id = ps.id
      AND pq.question_id = qb.id
  );

DROP TEMPORARY TABLE IF EXISTS seed_question_no;
DROP TEMPORARY TABLE IF EXISTS seed_chapter;
DROP TEMPORARY TABLE IF EXISTS seed_course;
DROP TEMPORARY TABLE IF EXISTS seed_category;
