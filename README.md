# 在线教育系统（毕业设计成品版）

本项目为**前后端分离**的在线教育系统，适合作为计算机专业本科毕业设计演示项目。

## 一、项目简介

系统面向三类用户：
- 学生：浏览课程、选课学习、提交作业、参与课程问答
- 教师：创建课程、维护章节资源、发布作业、回复问答、提交课程审核
- 管理员：审核课程、管理用户

## 二、技术栈

### 前端（独立运行，推荐使用 VSCode）
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus
- Axios

### 后端（独立运行，推荐使用 IntelliJ IDEA）
- Spring Boot 3
- Spring Security
- JWT
- MyBatis-Plus
- MySQL 8
- Lombok

## 三、目录结构

```text
online-education-system/
├─ frontend/                  # 前端工程（VSCode 打开）
├─ backend/                   # 后端工程（IntelliJ IDEA 打开）
├─ docs/
│  ├─ 系统功能说明.md
│  ├─ 数据库设计说明.md
│  └─ 接口清单.md
└─ README.md
```

## 四、默认账号

- 管理员：admin / 123456
- 教师：teacher1 / 123456
- 学生：student1 / 123456

## 五、运行步骤

### 1. 初始化数据库
在 MySQL 中执行：

```sql
backend/sql/init.sql
```

然后修改：

```yaml
backend/src/main/resources/application.yml
```

中的数据库账号和密码。

### 2. 启动后端（IntelliJ IDEA）
- 用 IntelliJ IDEA 打开 `backend`
- 等待 Maven 依赖下载完成
- 启动 `OnlineTeachingApplication.java`
- 默认端口：`8080`

### 3. 启动前端（VSCode）
- 用 VSCode 打开 `frontend`
- 终端执行：

```bash
npm install
npm run dev
```

- 默认地址：`http://localhost:5173`

## 六、演示建议

### 学生端演示
1. 登录学生账号
2. 在学生大厅查看课程并选课
3. 进入课程详情页，查看章节资源
4. 提交作业
5. 发布课程提问

### 教师端演示
1. 登录教师账号
2. 新建课程
3. 维护章节与资源
4. 发布作业
5. 回复学生问题
6. 提交课程审核

### 管理员端演示
1. 登录管理员账号
2. 进入课程审核页面
3. 对教师提交的课程执行“通过 / 驳回”
4. 进入用户管理页面增删改用户

## 七、说明

这份工程已经按“毕业设计可展示、可答辩”的形式整理：
- 前后端完全分离
- 角色权限清晰
- 页面风格统一，适合展示
- 文档齐全，便于你直接整理成毕业设计附件

如果你后续还要我继续补：
- 课程封面上传
- 富文本简介
- 首页图表统计
- 毕设论文中的系统设计章节
- 系统测试章节
- 用例图 / E-R 图 / 时序图

可以直接在这份代码基础上继续扩展。
