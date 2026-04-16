from pathlib import Path
import subprocess


MYSQL = r"D:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
WORKDIR = Path(r"D:\2025next\online-education-system-direct-submit\online-education-system")
OUT_PATH = WORKDIR / "sql" / "preview_seed_chapter_practice_questions.sql"
COURSE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 32, 33]


def sql_text(text: str) -> str:
    return text.replace("'", "''")


def run_mysql(query: str) -> str:
    cmd = [
        MYSQL,
        "--default-character-set=utf8mb4",
        "-uroot",
        "-p123456",
        "-D",
        "online_teaching",
        "-N",
        "-B",
        "-e",
        query,
    ]
    return subprocess.check_output(cmd, encoding="utf-8", errors="replace")


def load_chapters():
    query = (
        "SELECT c.id, c.title, c.teacher_id, ch.id, ch.title, ch.sort_no "
        "FROM course c JOIN chapter ch ON ch.course_id = c.id "
        f"WHERE c.id IN ({','.join(map(str, COURSE_IDS))}) "
        "ORDER BY c.id, ch.sort_no, ch.id"
    )
    rows = []
    for line in run_mysql(query).splitlines():
        parts = line.split("\t")
        if len(parts) != 6:
            continue
        rows.append(
            {
                "course_id": int(parts[0]),
                "course_title": parts[1],
                "teacher_id": int(parts[2]),
                "chapter_id": int(parts[3]),
                "chapter_title": parts[4],
                "sort_no": int(parts[5]),
            }
        )
    return rows


def topic(chapter_title: str) -> str:
    return chapter_title.split(" ", 1)[1].strip() if " " in chapter_title else chapter_title


def classify(chapter: str) -> str:
    if "开发环境" in chapter or "环境搭建" in chapter or "快速上手" in chapter:
        return "env"
    if "顺序结构" in chapter or "分支结构" in chapter or "流程控制" in chapter or "条件、循环" in chapter or "循环结构" in chapter:
        return "control"
    if "函数" in chapter or "结构体" in chapter or "接口" in chapter or "面向对象" in chapter or "常用类与集合" in chapter or "Props State" in chapter or "组件通信" in chapter:
        return "oop"
    if "数组" in chapter or "字符串" in chapter or "指针" in chapter or "数据类型" in chapter or "线性表" in chapter or "栈队列" in chapter:
        return "data_struct_basic"
    if "SQL 查询" in chapter or "表设计" in chapter or "约束" in chapter or "索引" in chapter or "事务" in chapter or "数据库" in chapter:
        return "database"
    if "Web 服务" in chapter or "REST" in chapter or "接口" in chapter or "HTTP" in chapter or "第三方系统对接" in chapter or "联调" in chapter:
        return "api"
    if "React" in chapter or "JSX" in chapter or "Hooks" in chapter or "Vue" in chapter or "路由" in chapter or "HTML" in chapter or "CSS" in chapter or "JavaScript" in chapter or "浏览器" in chapter:
        return "frontend"
    if "设计原则" in chapter or "颜色" in chapter or "字体" in chapter or "布局" in chapter or "组件设计" in chapter or "设计稿" in chapter or "原型" in chapter or "交互" in chapter:
        return "design"
    if "安全" in chapter or "密码学" in chapter or "认证" in chapter or "授权" in chapter or "攻击" in chapter or "防护" in chapter:
        return "security"
    if "大模型" in chapter or "提示词" in chapter or "工具调用" in chapter or "函数编排" in chapter or "智能体" in chapter or "工作流" in chapter:
        return "ai"
    if "操作系统" in chapter or "进程" in chapter or "线程" in chapter or "内存" in chapter or "文件系统" in chapter or "调度" in chapter or "设备管理" in chapter:
        return "os"
    if "数据分析" in chapter or "数据清洗" in chapter or "预处理" in chapter or "统计分析" in chapter or "可视化" in chapter:
        return "data_analysis"
    if "复杂度" in chapter or "树" in chapter or "二叉树" in chapter or "图结构" in chapter or "遍历" in chapter or "排序" in chapter or "查找" in chapter:
        return "algorithm"
    if "机器学习" in chapter or "特征工程" in chapter or "监督学习" in chapter or "模型评估" in chapter or "调参" in chapter:
        return "ml"
    if "神经网络" in chapter or "前向传播" in chapter or "反向传播" in chapter or "卷积神经网络" in chapter or "模型训练" in chapter or "训练与优化" in chapter:
        return "dl"
    if "系统结构" in chapter or "数据表示" in chapter or "运算" in chapter or "存储系统" in chapter or "指令系统" in chapter or "控制器" in chapter or "CPU" in chapter:
        return "computer_org"
    if "网络体系结构" in chapter or "数据链路层" in chapter or "局域网" in chapter or "IP" in chapter or "路由" in chapter or "TCP" in chapter or "UDP" in chapter:
        return "network"
    if "软件工程" in chapter or "需求分析" in chapter or "系统设计" in chapter or "编码规范" in chapter or "质量管理" in chapter or "软件维护" in chapter or "演进" in chapter:
        return "software_engineering"
    if "测试" in chapter or "缺陷" in chapter or "用例" in chapter or "回归" in chapter or "测试报告" in chapter:
        return "testing"
    if "项目管理" in chapter or "需求拆解" in chapter or "排期" in chapter or "Scrum" in chapter or "风险管理" in chapter or "复盘" in chapter or "交付" in chapter:
        return "project_mgmt"
    if "极限" in chapter or "导数" in chapter or "微分" in chapter or "矩阵" in chapter or "行列式" in chapter or "概率统计" in chapter or "真题" in chapter:
        return "math"
    if "词汇" in chapter or "语法分析" in chapter or "阅读理解" in chapter or "听力" in chapter or "口语" in chapter or "写作" in chapter or "翻译" in chapter:
        return "english"
    return "intro"


def pack(single, multiple, judge, fill, short, knowledge):
    return {
        "SINGLE": {**single, "difficulty": "EASY", "score": "1.00", "knowledge": knowledge},
        "MULTIPLE": {**multiple, "difficulty": "MEDIUM", "score": "2.00", "knowledge": knowledge},
        "JUDGE": {**judge, "difficulty": "EASY", "score": "1.00", "knowledge": knowledge},
        "FILL": {**fill, "difficulty": "MEDIUM", "score": "2.00", "knowledge": knowledge},
        "SHORT": {**short, "difficulty": "MEDIUM", "score": "4.00", "knowledge": knowledge},
    }


def build_questions(course: str, chapter: str):
    kind = classify(chapter)
    tp = topic(chapter)
    if kind == "env":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项通常属于开始学习前需要先完成的工作？", "answer": "A", "analysis": "先准备开发环境和基础工具，才能顺利开展后续编码与实践。", "options": [("A", "安装并配置开发环境", 1), ("B", "只整理展示海报", 0), ("C", "跳过工具直接上线", 0), ("D", "先删除示例工程", 0)]},
            {"stem": f"关于《{course}》中“{tp}”的学习任务，下列哪些说法正确？", "answer": "A,B,C", "analysis": "环境章节通常包括工具安装、运行验证和基础配置。", "options": [("A", "需要确认工具安装成功", 1), ("B", "需要完成基础配置", 1), ("C", "通常要做一次运行验证", 1), ("D", "与后续实践完全无关", 0)]},
            {"stem": f"判断题：在“{tp}”学习中，先验证环境是否可用，再开展编码练习，是合理的做法。", "answer": "T", "analysis": "可用性验证能降低后续学习中的排错成本。"},
            {"stem": f"填空题：完成“{tp}”时，通常需要先确保开发 ______ 可以正常运行。", "answer": "环境", "analysis": "环境可用是后续实践的基础。"},
            {"stem": f"简答题：请简述《{course}》中“{tp}”这一章的学习重点与实践步骤。", "answer": "答案要点：安装工具；完成基础配置；运行示例；验证输出结果；记录常见问题与解决方法。", "analysis": "本题考查对环境准备与上手流程的整体理解。"},
            tp,
        )
    if kind == "control":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最能体现程序控制结构的作用？", "answer": "B", "analysis": "控制结构用于决定程序执行顺序与条件分支。", "options": [("A", "只负责界面配色", 0), ("B", "控制语句执行顺序与分支流程", 1), ("C", "仅用于存储图片资源", 0), ("D", "只影响网络带宽", 0)]},
            {"stem": f"关于“{tp}”中的常见结构，下列哪些属于程序控制逻辑？", "answer": "A,B,C", "analysis": "顺序、选择、循环是典型控制结构。", "options": [("A", "顺序结构", 1), ("B", "选择结构", 1), ("C", "循环结构", 1), ("D", "色彩规范", 0)]},
            {"stem": "判断题：合理使用分支和循环可以提升程序对不同场景的处理能力。", "answer": "T", "analysis": "控制结构是实现逻辑判断与重复执行的基础。"},
            {"stem": "填空题：当程序需要根据条件执行不同路径时，通常会使用 ______ 结构。", "answer": "选择", "analysis": "选择结构即分支结构。"},
            {"stem": f"简答题：请结合“{tp}”说明顺序、分支、循环三类结构各自适合解决什么问题。", "answer": "答案要点：顺序用于固定步骤执行；分支用于条件判断；循环用于重复任务；三者可组合完成复杂逻辑。", "analysis": "考查对控制结构作用场景的理解。"},
            tp,
        )
    if kind == "oop":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项更适合作为结构化封装或抽象能力的体现？", "answer": "C", "analysis": "封装与抽象强调把数据和行为组织到合理结构中。", "options": [("A", "随机删除关键字段", 0), ("B", "只写注释不定义结构", 0), ("C", "将相关数据与行为组织到统一结构中", 1), ("D", "忽略模块边界", 0)]},
            {"stem": f"关于“{tp}”的核心思想，下列哪些说法正确？", "answer": "A,B,D", "analysis": "该类章节通常强调抽象、复用与模块协作。", "options": [("A", "需要关注职责划分", 1), ("B", "需要关注复用与扩展", 1), ("C", "无需考虑接口或边界", 0), ("D", "合理封装能降低耦合", 1)]},
            {"stem": f"判断题：在“{tp}”中，清晰的结构设计通常有助于后续维护和扩展。", "answer": "T", "analysis": "结构设计越清晰，越利于维护。"},
            {"stem": "填空题：为了降低模块之间的直接依赖，设计时通常强调良好的 ______ 。", "answer": "封装", "analysis": "封装有助于降低耦合。"},
            {"stem": f"简答题：请简述《{course}》中“{tp}”章节的核心能力点，以及它对项目开发的意义。", "answer": "答案要点：理解抽象与封装；明确结构职责；支持复用扩展；提升代码可维护性与协作效率。", "analysis": "考查对结构化设计价值的理解。"},
            tp,
        )
    if kind == "data_struct_basic":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合数据组织方式的学习目标？", "answer": "A", "analysis": "这一类章节核心是理解数据如何被组织、访问与处理。", "options": [("A", "掌握数据的组织与访问方式", 1), ("B", "只讨论视觉排版", 0), ("C", "忽略数据边界和长度", 0), ("D", "只关注演讲技巧", 0)]},
            {"stem": f"关于“{tp}”的学习重点，下列哪些说法正确？", "answer": "A,C,D", "analysis": "通常会涉及数据组织、遍历处理和边界意识。", "options": [("A", "需要理解元素之间的组织关系", 1), ("B", "与数据访问完全无关", 0), ("C", "需要关注遍历或读写方式", 1), ("D", "需要关注边界或有效范围", 1)]},
            {"stem": "判断题：处理数组、字符串或线性结构时，边界检查通常很重要。", "answer": "T", "analysis": "边界错误是这类内容中的常见问题。"},
            {"stem": "填空题：在处理一组同类数据时，常见目标之一是保证访问位置不越过有效 ______ 。", "answer": "范围", "analysis": "范围控制可以避免越界问题。"},
            {"stem": f"简答题：请概括“{tp}”在数据组织、访问和常见错误防范方面的学习重点。", "answer": "答案要点：理解数据组织形式；掌握遍历与访问方式；注意边界控制；避免越界与非法访问。", "analysis": "考查对数据组织基础能力的总结。"},
            tp,
        )
    if kind == "database":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合数据库设计或操作的基本目标？", "answer": "B", "analysis": "数据库章节强调数据组织、查询效率和一致性。", "options": [("A", "用随机命名代替规范设计", 0), ("B", "提升数据组织的规范性与可用性", 1), ("C", "忽略约束与一致性", 0), ("D", "用图片代替结构化数据", 0)]},
            {"stem": f"关于“{tp}”的关键实践，下列哪些说法正确？", "answer": "A,B,C", "analysis": "数据库学习通常涉及设计、查询与性能意识。", "options": [("A", "需要关注数据结构设计", 1), ("B", "需要关注查询正确性", 1), ("C", "需要关注性能或一致性", 1), ("D", "无需考虑数据冗余问题", 0)]},
            {"stem": "判断题：在数据库应用中，规范设计与合理查询同样重要。", "answer": "T", "analysis": "设计和查询共同影响数据质量与系统性能。"},
            {"stem": "填空题：为了保证多条相关操作要么全部成功要么全部失败，通常需要使用 ______ 。", "answer": "事务", "analysis": "事务用于保证一组操作的一致性。"},
            {"stem": f"简答题：请结合“{tp}”说明数据库设计、查询性能和数据一致性之间的关系。", "answer": "答案要点：合理设计降低冗余；正确查询保证结果准确；索引和优化影响性能；事务和约束保证一致性。", "analysis": "考查数据库整体意识。"},
            tp,
        )
    if kind == "api":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项更符合接口设计或系统对接的基本要求？", "answer": "D", "analysis": "接口应清晰、规范、可维护，并便于协作。", "options": [("A", "参数命名随意变化", 0), ("B", "缺少错误码和返回说明", 0), ("C", "接口语义模糊且不可追踪", 0), ("D", "接口语义清晰并保持规范一致", 1)]},
            {"stem": f"关于“{tp}”的常见要求，下列哪些说法正确？", "answer": "A,C,D", "analysis": "接口设计需要关注规范、文档和协同调试。", "options": [("A", "应关注请求与响应结构", 1), ("B", "无需关注状态码含义", 0), ("C", "应提供必要的文档说明", 1), ("D", "联调时应关注异常场景", 1)]},
            {"stem": "判断题：接口规范统一、文档清晰，有助于降低系统联调成本。", "answer": "T", "analysis": "统一规范能减少沟通偏差。"},
            {"stem": "填空题：为了便于系统对接，接口通常需要明确输入、输出和错误 ______ 。", "answer": "码", "analysis": "错误码是接口协作中的重要约定。"},
            {"stem": f"简答题：请总结“{tp}”中进行接口设计或系统集成时需要重点关注的要点。", "answer": "答案要点：统一接口风格；明确参数与返回；补全文档；覆盖异常场景；重视联调与测试。", "analysis": "考查接口工程化思维。"},
            tp,
        )
    if kind == "frontend":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合前端开发的核心实践？", "answer": "A", "analysis": "前端开发强调结构、样式、交互或组件协作。", "options": [("A", "根据页面目标组织结构与交互", 1), ("B", "忽略用户交互反馈", 0), ("C", "只关注数据库索引", 0), ("D", "完全不处理状态变化", 0)]},
            {"stem": f"关于“{tp}”的学习重点，下列哪些说法正确？", "answer": "A,B,D", "analysis": "前端章节通常涉及结构组织、状态更新和页面联动。", "options": [("A", "需要关注界面结构或组件组织", 1), ("B", "需要关注数据与视图更新关系", 1), ("C", "无需考虑页面可维护性", 0), ("D", "需要关注交互效果和用户体验", 1)]},
            {"stem": "判断题：在前端项目中，清晰的组件边界和页面组织方式有助于维护。", "answer": "T", "analysis": "良好结构能提升协作和扩展能力。"},
            {"stem": "填空题：当前端数据变化后，通常需要驱动页面重新 ______ 以反映最新状态。", "answer": "渲染", "analysis": "渲染更新是前端框架的重要机制。"},
            {"stem": f"简答题：请结合“{tp}”说明前端开发中结构组织、状态变化和用户交互之间的关系。", "answer": "答案要点：按页面目标组织结构；管理状态变化；让界面随数据更新；保证交互反馈清晰自然。", "analysis": "考查前端整体开发思路。"},
            tp,
        )
    if kind == "design":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项更符合设计表达的基本原则？", "answer": "C", "analysis": "设计应强调清晰、一致和可理解性。", "options": [("A", "无规则堆叠元素", 0), ("B", "忽略用户操作路径", 0), ("C", "保持视觉或交互逻辑一致", 1), ("D", "只追求元素数量", 0)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,B,D", "analysis": "设计章节通常强调一致性、层级和可沟通性。", "options": [("A", "需要明确页面重点与层级", 1), ("B", "需要兼顾一致性与可用性", 1), ("C", "无需考虑用户操作成本", 0), ("D", "需要让方案便于沟通与评审", 1)]},
            {"stem": "判断题：无论是 UI 设计还是原型设计，统一规范都能提升沟通效率。", "answer": "T", "analysis": "统一性是设计协作的关键基础。"},
            {"stem": "填空题：为了让用户更容易理解页面重点，设计中通常需要建立视觉 ______ 。", "answer": "层级", "analysis": "视觉层级帮助用户快速识别重点。"},
            {"stem": f"简答题：请说明“{tp}”章节在设计表达、用户理解和团队协作方面的价值。", "answer": "答案要点：明确页面重点；建立一致规范；降低理解成本；支持评审沟通；提升方案落地效率。", "analysis": "考查设计章节的综合价值理解。"},
            tp,
        )
    if kind == "security":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合安全设计的基本目标？", "answer": "B", "analysis": "安全设计关注保护资产、身份和访问过程。", "options": [("A", "扩大未经控制的访问范围", 0), ("B", "降低风险并保护关键资源", 1), ("C", "取消所有认证步骤", 0), ("D", "泄露敏感信息便于调试", 0)]},
            {"stem": f"关于“{tp}”的关键要求，下列哪些说法正确？", "answer": "A,C,D", "analysis": "安全实践强调防护、控制和审计意识。", "options": [("A", "需要识别常见风险", 1), ("B", "无需验证访问身份", 0), ("C", "需要设置合理权限边界", 1), ("D", "需要关注数据或系统保护", 1)]},
            {"stem": "判断题：安全措施不仅包括技术防护，也包括流程与管理要求。", "answer": "T", "analysis": "安全是技术与管理的结合。"},
            {"stem": "填空题：限制用户只能访问其被授权资源的思想通常称为访问 ______ 。", "answer": "控制", "analysis": "访问控制是安全基础能力。"},
            {"stem": f"简答题：请概括“{tp}”在风险识别、权限控制和防护实践方面的重点。", "answer": "答案要点：识别关键资产与威胁；设置认证授权；落实最小权限；开展监控审计；持续改进防护。", "analysis": "考查安全治理的整体思路。"},
            tp,
        )
    if kind == "ai":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合大模型或智能体应用的实践思路？", "answer": "D", "analysis": "该类应用强调任务拆解、输入约束和工具协同。", "options": [("A", "完全不定义任务目标", 0), ("B", "忽略上下文和输出要求", 0), ("C", "只依赖随机尝试不做验证", 0), ("D", "明确任务目标并设计可执行流程", 1)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,B,C", "analysis": "提示词、工具调用和流程编排是智能体应用的重要组成。", "options": [("A", "需要明确输入和输出约束", 1), ("B", "需要根据任务拆解步骤", 1), ("C", "必要时可结合外部工具完成任务", 1), ("D", "无需关注结果校验", 0)]},
            {"stem": "判断题：设计智能体工作流时，任务拆解和结果校验都很重要。", "answer": "T", "analysis": "流程质量会直接影响结果稳定性。"},
            {"stem": "填空题：为了让模型输出更稳定，通常需要在提示中明确任务、上下文与输出 ______ 。", "answer": "格式", "analysis": "格式约束有助于提升可用性。"},
            {"stem": f"简答题：请结合“{tp}”说明大模型应用从提示设计到工具协同再到结果校验的基本流程。", "answer": "答案要点：明确目标；设计提示；拆分步骤；按需调用工具；校验输出；根据反馈持续优化。", "analysis": "考查对大模型应用链路的整体理解。"},
            tp,
        )
    if kind == "os":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合操作系统管理资源的目标？", "answer": "A", "analysis": "操作系统要高效、合理地管理硬件和软件资源。", "options": [("A", "协调和管理系统资源的使用", 1), ("B", "只负责网页配色", 0), ("C", "只保存图片不做调度", 0), ("D", "完全忽略并发访问", 0)]},
            {"stem": f"关于“{tp}”的理解，下列哪些说法正确？", "answer": "A,C,D", "analysis": "操作系统章节通常涉及资源分配、隔离和调度。", "options": [("A", "需要理解系统资源如何被组织和分配", 1), ("B", "与性能和效率无关", 0), ("C", "需要关注并发或共享带来的问题", 1), ("D", "需要关注管理策略对系统行为的影响", 1)]},
            {"stem": "判断题：操作系统中的资源管理策略会直接影响程序运行效率与稳定性。", "answer": "T", "analysis": "资源分配和调度策略非常关键。"},
            {"stem": "填空题：在操作系统中，负责决定资源先后使用顺序的重要机制之一是 ______ 。", "answer": "调度", "analysis": "调度是操作系统核心机制。"},
            {"stem": f"简答题：请概括“{tp}”在资源管理、效率优化和系统稳定性方面的核心作用。", "answer": "答案要点：统一管理资源；协调竞争与共享；制定调度策略；提升效率；保障系统稳定运行。", "analysis": "考查对操作系统价值的整体认识。"},
            tp,
        )
    if kind == "data_analysis":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合数据分析工作的基本目标？", "answer": "C", "analysis": "数据分析强调从数据中提炼有效信息支撑判断。", "options": [("A", "忽略数据质量直接下结论", 0), ("B", "只追求图表数量", 0), ("C", "从数据中提炼有价值的信息", 1), ("D", "不区分异常值与正常值", 0)]},
            {"stem": f"关于“{tp}”的常见任务，下列哪些说法正确？", "answer": "A,B,D", "analysis": "数据分析需要关注数据质量、方法选择和结果表达。", "options": [("A", "需要理解数据来源与质量", 1), ("B", "需要选择合适的分析方法", 1), ("C", "无需解释分析结果", 0), ("D", "需要让结果具备可理解性", 1)]},
            {"stem": "判断题：数据清洗、分析方法选择和结果表达是数据分析中的关键环节。", "answer": "T", "analysis": "三者共同影响分析结论质量。"},
            {"stem": "填空题：在正式分析前，通常需要先完成数据 ______ 与预处理。", "answer": "清洗", "analysis": "数据质量会直接影响分析可靠性。"},
            {"stem": f"简答题：请说明“{tp}”章节中从原始数据到分析结论的一般过程。", "answer": "答案要点：明确目标；采集并理解数据；清洗预处理；选择方法分析；形成可视化与结论。", "analysis": "考查数据分析流程意识。"},
            tp,
        )
    if kind == "algorithm":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合算法或数据结构学习的目标？", "answer": "B", "analysis": "该类章节强调结构特性、处理过程和效率分析。", "options": [("A", "只比较界面颜色", 0), ("B", "理解结构特性并分析算法效率", 1), ("C", "忽略输入规模影响", 0), ("D", "只关注文案排版", 0)]},
            {"stem": f"关于“{tp}”的学习重点，下列哪些说法正确？", "answer": "A,C,D", "analysis": "需要理解结构、操作过程和复杂度。", "options": [("A", "需要理解数据组织方式", 1), ("B", "无需考虑时间和空间成本", 0), ("C", "需要掌握典型操作过程", 1), ("D", "需要分析算法复杂度", 1)]},
            {"stem": "判断题：同一问题采用不同算法实现，其时间复杂度可能不同。", "answer": "T", "analysis": "复杂度分析是算法学习的重要内容。"},
            {"stem": "填空题：评价算法执行步骤随输入规模变化趋势时，通常使用时间 ______ 。", "answer": "复杂度", "analysis": "复杂度分析用于衡量效率。"},
            {"stem": f"简答题：请概括“{tp}”在结构理解、算法设计和复杂度分析方面的核心要求。", "answer": "答案要点：理解结构特性；掌握典型操作；分析时间空间复杂度；比较不同方案优劣。", "analysis": "考查算法思维的完整性。"},
            tp,
        )
    if kind == "ml":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合机器学习任务的典型流程？", "answer": "A", "analysis": "机器学习通常包括数据准备、建模、评估与优化。", "options": [("A", "准备数据后训练并评估模型", 1), ("B", "不看数据直接确定结论", 0), ("C", "完全忽略特征质量", 0), ("D", "只依赖主观判断", 0)]},
            {"stem": f"关于“{tp}”的理解，下列哪些说法正确？", "answer": "A,B,D", "analysis": "机器学习重视数据、特征和评估。", "options": [("A", "数据质量会影响模型效果", 1), ("B", "特征设计会影响学习结果", 1), ("C", "评估阶段可以省略", 0), ("D", "需要根据结果持续调优", 1)]},
            {"stem": "判断题：机器学习模型效果不仅取决于算法，也与数据和特征工程有关。", "answer": "T", "analysis": "数据和特征常常决定效果上限。"},
            {"stem": "填空题：在机器学习中，用于衡量模型表现的过程通常称为模型 ______ 。", "answer": "评估", "analysis": "评估是建模流程中的必要环节。"},
            {"stem": f"简答题：请结合“{tp}”说明机器学习从数据处理到模型验证的主要步骤。", "answer": "答案要点：准备数据；构造特征；训练模型；选择指标评估；根据结果调参优化。", "analysis": "考查机器学习标准流程。"},
            tp,
        )
    if kind == "dl":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合深度学习模型训练的核心目标？", "answer": "D", "analysis": "深度学习训练的目标是通过参数更新降低误差。", "options": [("A", "固定误差不做更新", 0), ("B", "忽略训练数据分布", 0), ("C", "不进行模型验证", 0), ("D", "通过训练不断优化模型参数", 1)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,C,D", "analysis": "深度学习需要关注结构、损失和优化过程。", "options": [("A", "模型通常由多层结构组成", 1), ("B", "训练时无需关注损失变化", 0), ("C", "参数更新依赖前向与反向过程", 1), ("D", "优化策略会影响训练效果", 1)]},
            {"stem": "判断题：深度学习模型训练通常需要在误差反馈基础上不断更新参数。", "answer": "T", "analysis": "参数更新是训练的核心机制。"},
            {"stem": "填空题：在神经网络训练中，依据误差调整参数的关键过程之一是反向 ______ 。", "answer": "传播", "analysis": "反向传播用于计算梯度。"},
            {"stem": f"简答题：请概括“{tp}”中模型结构、损失反馈和参数优化之间的关系。", "answer": "答案要点：模型完成特征映射；损失衡量预测偏差；反向传播计算梯度；优化算法更新参数。", "analysis": "考查深度学习训练机制。"},
            tp,
        )
    if kind == "computer_org":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合计算机硬件系统学习的目标？", "answer": "B", "analysis": "计算机组成原理强调理解各部件协同工作机制。", "options": [("A", "只关注网页动画", 0), ("B", "理解硬件部件及其协同关系", 1), ("C", "忽略数据在部件间流动", 0), ("D", "只背诵界面文案", 0)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,B,C", "analysis": "该类章节通常涉及部件功能、数据流和控制关系。", "options": [("A", "需要理解部件功能分工", 1), ("B", "需要理解数据或指令流动", 1), ("C", "需要理解控制机制", 1), ("D", "与系统性能无关", 0)]},
            {"stem": "判断题：理解计算机各硬件部件的协同方式，有助于把握系统运行机制。", "answer": "T", "analysis": "协同机制是计算机组成原理的核心。"},
            {"stem": "填空题：计算机执行程序时，数据与指令通常需要在不同硬件 ______ 之间流动。", "answer": "部件", "analysis": "部件协同构成完整执行过程。"},
            {"stem": f"简答题：请说明“{tp}”在理解硬件结构、数据流动和系统执行过程中的作用。", "answer": "答案要点：认识核心部件；理解各部件职责；掌握数据和指令流动；分析执行效率与系统行为。", "analysis": "考查对硬件协同机制的理解。"},
            tp,
        )
    if kind == "network":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合计算机网络的核心目标？", "answer": "C", "analysis": "网络的核心目标是让不同节点之间稳定传输和共享信息。", "options": [("A", "只存储本地单机数据", 0), ("B", "完全不考虑协议规则", 0), ("C", "让不同设备按规则进行通信", 1), ("D", "只关注视觉设计", 0)]},
            {"stem": f"关于“{tp}”的学习重点，下列哪些说法正确？", "answer": "A,C,D", "analysis": "网络学习强调协议、分层和传输机制。", "options": [("A", "需要理解不同层次的职责", 1), ("B", "无需考虑地址与路由", 0), ("C", "需要关注数据如何传输", 1), ("D", "需要理解协议协作关系", 1)]},
            {"stem": "判断题：网络协议的存在是为了让不同设备按照统一规则进行通信。", "answer": "T", "analysis": "统一规则是互联互通的基础。"},
            {"stem": "填空题：在网络中，为了让不同设备能够互相识别，通常需要使用网络 ______ 。", "answer": "地址", "analysis": "地址是定位通信对象的基础。"},
            {"stem": f"简答题：请概括“{tp}”中网络分层、协议协作和数据传输之间的关系。", "answer": "答案要点：分层明确职责；协议规定规则；数据按层封装与传输；共同实现可靠通信。", "analysis": "考查网络体系化理解。"},
            tp,
        )
    if kind == "software_engineering":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合软件工程的目标？", "answer": "A", "analysis": "软件工程强调用规范方法提升开发质量与效率。", "options": [("A", "以规范流程提升软件开发质量", 1), ("B", "完全依赖个人临场发挥", 0), ("C", "跳过需求直接编码", 0), ("D", "不做任何维护计划", 0)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,B,D", "analysis": "软件工程重视流程、质量和团队协作。", "options": [("A", "需要关注过程规范", 1), ("B", "需要关注文档与沟通", 1), ("C", "无需考虑变更影响", 0), ("D", "需要关注质量保障活动", 1)]},
            {"stem": "判断题：软件工程不仅关注编码，还关注需求、设计、测试和维护。", "answer": "T", "analysis": "软件开发是完整生命周期过程。"},
            {"stem": "填空题：为了减少返工，软件项目通常需要先做好需求 ______ 。", "answer": "分析", "analysis": "需求分析是软件工程的重要起点。"},
            {"stem": f"简答题：请说明“{tp}”在规范开发流程、提升质量和支持团队协作方面的作用。", "answer": "答案要点：明确开发阶段；规范产出物；强化沟通协作；控制质量与风险；支持持续维护。", "analysis": "考查软件工程整体观。"},
            tp,
        )
    if kind == "testing":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合软件测试的核心目的？", "answer": "D", "analysis": "软件测试的核心是发现问题、验证质量并降低风险。", "options": [("A", "只追求测试数量不关注结果", 0), ("B", "跳过验证直接上线", 0), ("C", "只记录成功场景", 0), ("D", "通过验证发现缺陷并评估质量", 1)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,C,D", "analysis": "测试工作强调覆盖、验证和缺陷闭环。", "options": [("A", "需要设计有效测试场景", 1), ("B", "无需记录缺陷信息", 0), ("C", "需要验证预期与实际是否一致", 1), ("D", "需要关注缺陷跟踪与回归确认", 1)]},
            {"stem": "判断题：测试不仅要执行用例，还要对缺陷进行跟踪和验证。", "answer": "T", "analysis": "缺陷闭环是测试工作的重要组成部分。"},
            {"stem": "填空题：为了验证修改后旧功能未被破坏，通常需要进行 ______ 测试。", "answer": "回归", "analysis": "回归测试用于确认变更未引入新问题。"},
            {"stem": f"简答题：请概括“{tp}”中测试设计、执行、缺陷管理和结果反馈之间的关系。", "answer": "答案要点：设计覆盖场景；执行并记录结果；提交跟踪缺陷；修复后回归验证；形成质量反馈。", "analysis": "考查测试闭环思维。"},
            tp,
        )
    if kind == "project_mgmt":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合项目管理的基本目标？", "answer": "B", "analysis": "项目管理强调目标、范围、进度和风险的协调控制。", "options": [("A", "完全忽略计划和风险", 0), ("B", "协调资源并推动目标按计划达成", 1), ("C", "只关注个人喜好安排", 0), ("D", "不记录任务状态", 0)]},
            {"stem": f"关于“{tp}”的说法，下列哪些正确？", "answer": "A,B,D", "analysis": "项目管理重视计划、协作与风险控制。", "options": [("A", "需要明确任务目标和边界", 1), ("B", "需要关注计划与执行偏差", 1), ("C", "无需沟通协作机制", 0), ("D", "需要持续识别和处理风险", 1)]},
            {"stem": "判断题：敏捷开发并不意味着不要计划，而是强调持续反馈和迭代调整。", "answer": "T", "analysis": "敏捷强调小步快跑和动态修正。"},
            {"stem": "填空题：在 Scrum 中，用于组织短周期交付的固定时间盒通常称为一个 ______ 。", "answer": "Sprint", "analysis": "Sprint 是 Scrum 的核心节奏单位。"},
            {"stem": f"简答题：请说明“{tp}”在目标拆解、进度协同、风险控制和项目交付中的作用。", "answer": "答案要点：明确目标与范围；拆分任务并排期；建立协作机制；跟踪风险；推动阶段性交付与复盘。", "analysis": "考查项目管理实践能力。"},
            tp,
        )
    if kind == "math":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合数学学习的基本要求？", "answer": "C", "analysis": "数学章节强调概念理解、方法掌握和规范推导。", "options": [("A", "只记结论不看过程", 0), ("B", "忽略条件直接代入", 0), ("C", "理解概念并重视推导过程", 1), ("D", "只背模板不训练计算", 0)]},
            {"stem": f"关于“{tp}”的复习方法，下列哪些说法正确？", "answer": "A,B,D", "analysis": "考研数学需要概念、方法和练习三者结合。", "options": [("A", "需要掌握定义与性质", 1), ("B", "需要通过题目训练方法应用", 1), ("C", "可以完全跳过错题复盘", 0), ("D", "需要总结常见题型与解题步骤", 1)]},
            {"stem": "判断题：数学复习中，概念理解和规范推导同样重要。", "answer": "T", "analysis": "只有理解概念，解题方法才更稳定。"},
            {"stem": "填空题：在数学解题训练中，除了会做题，还需要重视对方法的 ______ 。", "answer": "总结", "analysis": "总结方法有助于迁移应用。"},
            {"stem": f"简答题：请概括“{tp}”这一章在概念掌握、方法训练和真题应用方面的复习思路。", "answer": "答案要点：先理解定义性质；再掌握常用方法；通过例题和真题训练；整理错题并复盘规律。", "analysis": "考查考研数学复习方法论。"},
            tp,
        )
    if kind == "english":
        return pack(
            {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合英语能力提升的基本思路？", "answer": "A", "analysis": "英语提升强调输入、理解、表达和持续练习。", "options": [("A", "在理解基础上持续进行专项训练", 1), ("B", "只背零散内容不做应用", 0), ("C", "完全忽视语境和表达场景", 0), ("D", "只看答案不做练习", 0)]},
            {"stem": f"关于“{tp}”的学习方法，下列哪些说法正确？", "answer": "A,C,D", "analysis": "英语学习重视语境、积累和输出训练。", "options": [("A", "需要在语境中理解和运用内容", 1), ("B", "无需进行任何复述或表达训练", 0), ("C", "需要积累高频表达或词块", 1), ("D", "需要结合专项练习巩固效果", 1)]},
            {"stem": "判断题：英语能力提升通常离不开输入积累和输出练习的结合。", "answer": "T", "analysis": "输入与输出相互促进。"},
            {"stem": "填空题：为了让英语表达更自然，学习时通常需要重视语境和固定 ______ 。", "answer": "搭配", "analysis": "固定搭配和词块有助于自然表达。"},
            {"stem": f"简答题：请说明“{tp}”这一章在输入积累、理解训练和表达输出方面的学习建议。", "answer": "答案要点：积累高频内容；结合语境理解；开展专项训练；通过复述、写作或口语输出巩固。", "analysis": "考查英语综合能力训练思路。"},
            tp,
        )
    return pack(
        {"stem": f"在《{course}》的“{tp}”中，下列哪一项最符合本章的学习目标？", "answer": "A", "analysis": "本章主要考查对主题核心概念和实践要点的理解。", "options": [("A", "理解核心概念并完成基础实践", 1), ("B", "忽略主题直接跳到结果", 0), ("C", "不区分重点和步骤", 0), ("D", "只关注形式不关注内容", 0)]},
        {"stem": f"关于“{tp}”的学习要求，下列哪些说法正确？", "answer": "A,B,C", "analysis": "学习这一章通常需要掌握概念、步骤和应用场景。", "options": [("A", "需要理解核心概念", 1), ("B", "需要掌握基本步骤", 1), ("C", "需要结合实践场景应用", 1), ("D", "无需进行总结复盘", 0)]},
        {"stem": f"判断题：学习“{tp}”时，理解概念并结合实践验证，通常能取得更好的效果。", "answer": "T", "analysis": "概念与实践结合是高效学习的重要方式。"},
        {"stem": f"填空题：掌握“{tp}”时，除了理解知识点，还要关注实际 ______ 。", "answer": "应用", "analysis": "应用能力体现对知识的真正掌握。"},
        {"stem": f"简答题：请简述《{course}》中“{tp}”这一章的重点内容及实践建议。", "answer": "答案要点：理解核心概念；掌握基本步骤；结合案例实践；总结常见问题与解决思路。", "analysis": "考查对本章内容的整体把握。"},
        tp,
    )


def main():
    rows = load_chapters()
    lines = [
        "USE online_teaching;",
        "",
        "-- 预览文件：按课程章节批量补充 question_bank / question_option / practice_set / practice_set_question",
        "-- 说明：每章固定 5 题，题型依次为 SINGLE、MULTIPLE、JUDGE、FILL、SHORT",
        "-- 说明：脚本采用 WHERE NOT EXISTS / INSERT IGNORE 写法，便于人工审核后分批执行",
        "",
    ]

    for row in rows:
        course_id = row["course_id"]
        course_title = row["course_title"]
        teacher_id = row["teacher_id"]
        chapter_id = row["chapter_id"]
        chapter_title = row["chapter_title"]
        qmap = build_questions(course_title, chapter_title)
        lines.append(f"-- {course_title} / {chapter_title}")

        for qtype in ["SINGLE", "MULTIPLE", "JUDGE", "FILL", "SHORT"]:
            q = qmap[qtype]
            stem = sql_text(q["stem"])
            answer = sql_text(q["answer"])
            analysis = sql_text(q["analysis"])
            knowledge = sql_text(q["knowledge"])
            lines.append(
                "INSERT INTO question_bank(course_id, chapter_id, teacher_id, type, stem, answer_text, analysis, difficulty, score, status, knowledge_point) "
                f"SELECT {course_id}, {chapter_id}, {teacher_id}, '{qtype}', '{stem}', '{answer}', '{analysis}', '{q['difficulty']}', {q['score']}, 'ENABLED', '{knowledge}' "
                f"FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM question_bank WHERE course_id = {course_id} AND chapter_id = {chapter_id} AND type = '{qtype}' AND stem = '{stem}');"
            )
            if "options" in q:
                for idx, (label, content, is_correct) in enumerate(q["options"], start=1):
                    content_sql = sql_text(content)
                    lines.append(
                        "INSERT INTO question_option(question_id, option_label, option_content, is_correct, sort_no) "
                        f"SELECT qb.id, '{label}', '{content_sql}', {is_correct}, {idx} FROM question_bank qb "
                        f"WHERE qb.course_id = {course_id} AND qb.chapter_id = {chapter_id} AND qb.type = '{qtype}' AND qb.stem = '{stem}' "
                        f"AND NOT EXISTS (SELECT 1 FROM question_option qo WHERE qo.question_id = qb.id AND qo.option_label = '{label}');"
                    )

        practice_title = sql_text(f"{chapter_title} - 章节练习")
        practice_desc = sql_text(f"围绕《{course_title}》的“{chapter_title}”设计的 5 题章节练习，包含单选、多选、判断、填空、简答。")
        lines.append(
            "INSERT INTO practice_set(course_id, chapter_id, teacher_id, title, description, type, total_score, question_count, duration_minutes, status, allow_retry, show_answer_mode) "
            f"SELECT {course_id}, {chapter_id}, {teacher_id}, '{practice_title}', '{practice_desc}', 'CHAPTER', 10.00, 5, 20, 'PUBLISHED', 1, 'AFTER_SUBMIT' "
            f"FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM practice_set WHERE course_id = {course_id} AND chapter_id = {chapter_id} AND type = 'CHAPTER' AND title = '{practice_title}');"
        )
        stem_list = ", ".join(f"'{sql_text(qmap[t]['stem'])}'" for t in ["SINGLE", "MULTIPLE", "JUDGE", "FILL", "SHORT"])
        lines.append(
            "INSERT IGNORE INTO practice_set_question(practice_set_id, question_id, sort_no, score) "
            "SELECT ps.id, qb.id, CASE qb.type WHEN 'SINGLE' THEN 1 WHEN 'MULTIPLE' THEN 2 WHEN 'JUDGE' THEN 3 WHEN 'FILL' THEN 4 WHEN 'SHORT' THEN 5 END, "
            "CASE qb.type WHEN 'SINGLE' THEN 1.00 WHEN 'MULTIPLE' THEN 2.00 WHEN 'JUDGE' THEN 1.00 WHEN 'FILL' THEN 2.00 WHEN 'SHORT' THEN 4.00 END "
            "FROM practice_set ps JOIN question_bank qb ON qb.course_id = ps.course_id AND qb.chapter_id = ps.chapter_id "
            f"WHERE ps.course_id = {course_id} AND ps.chapter_id = {chapter_id} AND ps.title = '{practice_title}' AND qb.stem IN ({stem_list});"
        )
        lines.append("")

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(OUT_PATH)
    print(f"chapters={len(rows)}")
    print(f"lines={len(lines)}")


if __name__ == "__main__":
    main()
