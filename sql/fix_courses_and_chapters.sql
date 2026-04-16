USE online_teaching;

UPDATE course SET
  title = 'Java 入门课程',
  description = '面向零基础学生的 Java 编程入门课程，覆盖语法、面向对象、集合与异常处理。'
WHERE id = 1;

UPDATE course SET
  title = 'Spring Boot 实战',
  description = '通过完整项目学习 Spring Boot 后端开发，掌握接口设计、数据访问与项目部署。'
WHERE id = 2;

UPDATE course SET
  title = 'Web 前端开发实战',
  description = '系统学习 HTML、CSS、JavaScript 与前后端联调，完成基础 Web 页面开发。'
WHERE id = 3;

UPDATE course SET
  title = 'Python 编程基础',
  description = '学习 Python 基础语法、函数、文件操作与常用标准库，适合作为编程入门课程。'
WHERE id = 5;

UPDATE course SET
  title = 'MySQL 数据库应用',
  description = '围绕数据库设计、SQL 查询、索引优化与事务控制，掌握 MySQL 核心能力。'
WHERE id = 6;

UPDATE course SET
  title = '数据结构与算法',
  description = '讲解线性表、树、图与常见算法思想，帮助学生建立算法分析与实现能力。'
WHERE id = 7;

UPDATE course SET
  title = '计算机网络基础',
  description = '从网络分层、协议通信到常见应用场景，建立完整的计算机网络知识体系。'
WHERE id = 8;

UPDATE course SET
  title = '软件测试基础',
  description = '学习测试流程、用例设计、缺陷管理与接口测试，培养软件质量意识。'
WHERE id = 9;

UPDATE course SET
  title = 'AI Agent 开发入门',
  description = '介绍大模型应用、Agent 工作流、工具调用与项目实践，帮助学生理解智能体开发。'
WHERE id = 10;

UPDATE course SET
  title = '全栈项目综合实训',
  description = '以综合项目为载体，串联前端、后端、数据库与部署流程，适合作为实训课程。'
WHERE id = 11;

UPDATE chapter SET title = '第一章 Java 基础语法', sort_no = 1 WHERE id = 1 AND course_id = 1;
UPDATE chapter SET title = '第二章 面向对象编程', sort_no = 2 WHERE id = 2 AND course_id = 1;
INSERT INTO chapter(course_id, title, sort_no)
SELECT 1, '第三章 常用集合框架', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 1 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 1, '第四章 异常处理与输入输出', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 1 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 1, '第五章 综合案例实训', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 1 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 2, '第一章 Spring Boot 快速上手', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 2 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 2, '第二章 Web 接口开发', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 2 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 2, '第三章 MyBatis 与数据持久化', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 2 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 2, '第四章 权限认证与接口安全', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 2 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 2, '第五章 项目部署与优化', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 2 AND sort_no = 5);

UPDATE chapter SET title = '第一章 Web 与浏览器基础', sort_no = 1 WHERE id = 3 AND course_id = 3;
INSERT INTO chapter(course_id, title, sort_no)
SELECT 3, '第二章 HTML 页面结构', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 3 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 3, '第三章 CSS 页面样式', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 3 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 3, '第四章 JavaScript 交互开发', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 3 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 3, '第五章 前后端联调实战', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 3 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 5, '第一章 Python 开发环境搭建', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 5 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 5, '第二章 Python 基础语法', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 5 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 5, '第三章 函数与模块', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 5 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 5, '第四章 文件操作与异常处理', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 5 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 5, '第五章 Python 综合练习', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 5 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 6, '第一章 数据库基础概念', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 6 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 6, '第二章 数据表设计与约束', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 6 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 6, '第三章 SQL 查询语句', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 6 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 6, '第四章 索引与性能优化', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 6 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 6, '第五章 事务与权限管理', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 6 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 7, '第一章 算法复杂度分析', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 7 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 7, '第二章 线性表与栈队列', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 7 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 7, '第三章 树与二叉树', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 7 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 7, '第四章 图结构与遍历', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 7 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 7, '第五章 排序与查找算法', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 7 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 8, '第一章 网络体系结构', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 8 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 8, '第二章 数据链路层与以太网', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 8 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 8, '第三章 IP 与路由基础', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 8 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 8, '第四章 TCP 与 UDP 协议', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 8 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 8, '第五章 HTTP 与常见网络应用', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 8 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 9, '第一章 软件测试概述', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 9 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 9, '第二章 测试用例设计', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 9 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 9, '第三章 功能测试与回归测试', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 9 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 9, '第四章 接口测试基础', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 9 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 9, '第五章 缺陷跟踪与测试报告', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 9 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 10, '第一章 大模型与 Agent 基础', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 10 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 10, '第二章 Prompt 设计与上下文管理', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 10 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 10, '第三章 工具调用与函数编排', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 10 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 10, '第四章 多步骤任务工作流', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 10 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 10, '第五章 Agent 项目实战', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 10 AND sort_no = 5);

INSERT INTO chapter(course_id, title, sort_no)
SELECT 11, '第一章 需求分析与系统设计', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 11 AND sort_no = 1);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 11, '第二章 前端模块开发', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 11 AND sort_no = 2);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 11, '第三章 后端接口开发', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 11 AND sort_no = 3);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 11, '第四章 数据库设计与联调', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 11 AND sort_no = 4);
INSERT INTO chapter(course_id, title, sort_no)
SELECT 11, '第五章 上线部署与项目总结', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM chapter WHERE course_id = 11 AND sort_no = 5);
