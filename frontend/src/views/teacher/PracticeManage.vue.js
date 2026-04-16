import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTeacherCoursesApi } from '@/api/course';
import { deletePracticeSetApi, getPracticeSetDetailApi, getTeacherPracticeSetPageApi, getTeacherQuestionPageApi, publishPracticeSetApi, savePracticeSetApi, unpublishPracticeSetApi } from '@/api/practice';
const list = reactive({
    total: 0,
    records: []
});
const questionPool = ref([]);
const courseOptions = ref([]);
const params = reactive({
    current: 1,
    size: 10,
    courseId: undefined,
    chapterId: undefined,
    keyword: ''
});
const dialogVisible = ref(false);
const defaultForm = () => ({
    courseId: 1,
    chapterId: undefined,
    title: '',
    description: '',
    type: 'CHAPTER',
    durationMinutes: 0,
    allowRetry: 0,
    showAnswerMode: 'AFTER_SUBMIT',
    questions: []
});
const form = reactive(defaultForm());
const currentCourseName = computed(() => courseOptions.value.find((item) => item.id === form.courseId)?.title || '');
const resetForm = () => {
    Object.assign(form, defaultForm());
};
const handleTypeChange = (_type) => {
    form.allowRetry = 0;
    form.showAnswerMode = 'AFTER_SUBMIT';
};
const loadCourseOptions = async () => {
    const res = await getTeacherCoursesApi({ current: 1, size: 999 });
    courseOptions.value = res.records || [];
};
const load = async () => {
    const res = await getTeacherPracticeSetPageApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const loadQuestionPool = async () => {
    const res = await getTeacherQuestionPageApi({
        current: 1,
        size: 999,
        courseId: form.courseId,
        chapterId: form.chapterId
    });
    questionPool.value = res.records || [];
};
const openCreate = async () => {
    resetForm();
    handleTypeChange(form.type);
    dialogVisible.value = true;
    await loadQuestionPool();
};
const openEdit = async (id) => {
    const res = await getPracticeSetDetailApi(id);
    resetForm();
    Object.assign(form, res);
    form.questions = (res.questions || []).map((item) => ({
        questionId: item.questionId,
        sortNo: item.sortNo
    }));
    handleTypeChange(form.type);
    dialogVisible.value = true;
    await loadQuestionPool();
};
const addQuestion = (row) => {
    const exists = (form.questions || []).some((item) => item.questionId === row.id);
    if (exists)
        return ElMessage.warning('该题目已加入当前练习');
    form.questions.push({
        questionId: row.id,
        sortNo: form.questions.length + 1
    });
};
const removeQuestion = (index) => {
    form.questions.splice(index, 1);
    form.questions.forEach((item, idx) => {
        item.sortNo = idx + 1;
    });
};
const handleSave = async () => {
    if (!form.title?.trim())
        return ElMessage.warning('请输入练习标题');
    if (!form.courseId)
        return ElMessage.warning('请输入课程ID');
    if (!form.questions.length)
        return ElMessage.warning('请至少选择一道题目');
    await savePracticeSetApi(form);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    await load();
};
const handlePublish = async (id) => {
    await publishPracticeSetApi(id);
    ElMessage.success('发布成功');
    await load();
};
const handleUnpublish = async (id) => {
    await unpublishPracticeSetApi(id);
    ElMessage.success('撤销发布成功');
    await load();
};
const togglePublish = async (row) => {
    if (row.status === 'PUBLISHED') {
        await handleUnpublish(row.id);
        return;
    }
    await handlePublish(row.id);
};
const handleDelete = async (id) => {
    await ElMessageBox.confirm('确认删除这套练习吗？', '提示', { type: 'warning' });
    await deletePracticeSetApi(id);
    ElMessage.success('删除成功');
    await load();
};
const typeText = (type) => {
    return {
        CHAPTER: '章节练习',
        SPECIAL: '专题练习',
        MOCK: '模拟练习',
        FINAL_EXAM: '期末考试',
        SINGLE: '单选题',
        MULTIPLE: '多选题',
        JUDGE: '判断题',
        FILL: '填空题',
        SHORT: '简答题'
    }[type] || type;
};
const statusText = (status) => {
    return {
        DRAFT: '草稿',
        PUBLISHED: '已发布',
        CLOSED: '已关闭'
    }[status] || status;
};
const statusTag = (status) => {
    return {
        DRAFT: 'info',
        PUBLISHED: 'success',
        CLOSED: 'warning'
    }[status] || '';
};
onMounted(async () => {
    await loadCourseOptions();
    await load();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "split-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-actions" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索练习标题",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索练习标题",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.load)
};
var __VLS_3;
const __VLS_8 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.params.courseId),
    min: (1),
    placeholder: "课程ID",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.params.courseId),
    min: (1),
    placeholder: "课程ID",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.params.chapterId),
    min: (1),
    placeholder: "章节ID",
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.params.chapterId),
    min: (1),
    placeholder: "章节ID",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.load)
};
__VLS_19.slots.default;
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.openCreate)
};
__VLS_27.slots.default;
var __VLS_27;
const __VLS_32 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    data: (__VLS_ctx.list.records || []),
    border: true,
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    data: (__VLS_ctx.list.records || []),
    border: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "id",
    label: "ID",
    width: "70",
}));
const __VLS_38 = __VLS_37({
    prop: "id",
    label: "ID",
    width: "70",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "title",
    label: "练习标题",
    minWidth: "180",
}));
const __VLS_42 = __VLS_41({
    prop: "title",
    label: "练习标题",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "courseId",
    label: "课程ID",
    width: "90",
}));
const __VLS_46 = __VLS_45({
    prop: "courseId",
    label: "课程ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "courseName",
    label: "课程名",
    width: "180",
    showOverflowTooltip: true,
}));
const __VLS_50 = __VLS_49({
    prop: "courseName",
    label: "课程名",
    width: "180",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    prop: "chapterId",
    label: "章节ID",
    width: "90",
}));
const __VLS_54 = __VLS_53({
    prop: "chapterId",
    label: "章节ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    prop: "type",
    label: "类型",
    width: "120",
}));
const __VLS_58 = __VLS_57({
    prop: "type",
    label: "类型",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_59.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_60 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (__VLS_ctx.typeText(row.type));
    var __VLS_63;
}
var __VLS_59;
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "questionCount",
    label: "题数",
    width: "90",
}));
const __VLS_66 = __VLS_65({
    prop: "questionCount",
    label: "题数",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    prop: "totalScore",
    label: "总分",
    width: "90",
}));
const __VLS_70 = __VLS_69({
    prop: "totalScore",
    label: "总分",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    prop: "durationMinutes",
    label: "限时(分钟)",
    width: "100",
}));
const __VLS_74 = __VLS_73({
    prop: "durationMinutes",
    label: "限时(分钟)",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_78 = __VLS_77({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_79.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_80 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        type: (__VLS_ctx.statusTag(row.status)),
    }));
    const __VLS_82 = __VLS_81({
        type: (__VLS_ctx.statusTag(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    (__VLS_ctx.statusText(row.status));
    var __VLS_83;
}
var __VLS_79;
const __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_86 = __VLS_85({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_87.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_88 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    let __VLS_94;
    const __VLS_95 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row.id);
        }
    };
    __VLS_91.slots.default;
    var __VLS_91;
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        link: true,
        type: (row.status === 'PUBLISHED' ? 'warning' : 'primary'),
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        link: true,
        type: (row.status === 'PUBLISHED' ? 'warning' : 'primary'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (...[$event]) => {
            __VLS_ctx.togglePublish(row);
        }
    };
    __VLS_99.slots.default;
    (row.status === 'PUBLISHED' ? '撤销发布' : '发布');
    var __VLS_99;
    const __VLS_104 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDelete(row.id);
        }
    };
    __VLS_107.slots.default;
    var __VLS_107;
}
var __VLS_87;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_112 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_114 = __VLS_113({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_115;
const __VLS_120 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑练习' : '新增练习'),
    width: "980px",
    destroyOnClose: true,
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑练习' : '新增练习'),
    width: "980px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}));
const __VLS_126 = __VLS_125({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-grid" },
});
const __VLS_128 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    label: "课程ID",
}));
const __VLS_130 = __VLS_129({
    label: "课程ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "course-field" },
});
const __VLS_132 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    modelValue: (__VLS_ctx.form.courseId),
    min: (1),
    ...{ style: {} },
}));
const __VLS_134 = __VLS_133({
    modelValue: (__VLS_ctx.form.courseId),
    min: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "course-name-tip" },
});
(__VLS_ctx.currentCourseName ? `课程名：${__VLS_ctx.currentCourseName}` : '课程名：未匹配到课程');
var __VLS_131;
const __VLS_136 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "章节ID",
}));
const __VLS_138 = __VLS_137({
    label: "章节ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.form.chapterId),
    min: (1),
    ...{ style: {} },
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.form.chapterId),
    min: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "练习标题",
}));
const __VLS_146 = __VLS_145({
    label: "练习标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.form.title),
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.form.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
const __VLS_152 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "练习类型",
}));
const __VLS_154 = __VLS_153({
    label: "练习类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}));
const __VLS_158 = __VLS_157({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_160;
let __VLS_161;
let __VLS_162;
const __VLS_163 = {
    onChange: (__VLS_ctx.handleTypeChange)
};
__VLS_159.slots.default;
const __VLS_164 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "章节练习",
    value: "CHAPTER",
}));
const __VLS_166 = __VLS_165({
    label: "章节练习",
    value: "CHAPTER",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
const __VLS_168 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "专题练习",
    value: "SPECIAL",
}));
const __VLS_170 = __VLS_169({
    label: "专题练习",
    value: "SPECIAL",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const __VLS_172 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "模拟练习",
    value: "MOCK",
}));
const __VLS_174 = __VLS_173({
    label: "模拟练习",
    value: "MOCK",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "期末考试",
    value: "FINAL_EXAM",
}));
const __VLS_178 = __VLS_177({
    label: "期末考试",
    value: "FINAL_EXAM",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
var __VLS_159;
var __VLS_155;
const __VLS_180 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "限时分钟",
}));
const __VLS_182 = __VLS_181({
    label: "限时分钟",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.form.durationMinutes),
    min: (0),
    ...{ style: {} },
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.form.durationMinutes),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_183;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "允许重试",
}));
const __VLS_190 = __VLS_189({
    label: "允许重试",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.form.allowRetry),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.form.allowRetry),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "答案展示",
}));
const __VLS_198 = __VLS_197({
    label: "答案展示",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.form.showAnswerMode),
    ...{ style: {} },
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.form.showAnswerMode),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    label: "提交后显示",
    value: "AFTER_SUBMIT",
}));
const __VLS_206 = __VLS_205({
    label: "提交后显示",
    value: "AFTER_SUBMIT",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
const __VLS_208 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    label: "每题后显示",
    value: "AFTER_EACH",
}));
const __VLS_210 = __VLS_209({
    label: "每题后显示",
    value: "AFTER_EACH",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
const __VLS_212 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    label: "不显示",
    value: "NEVER",
}));
const __VLS_214 = __VLS_213({
    label: "不显示",
    value: "NEVER",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
var __VLS_203;
var __VLS_199;
const __VLS_216 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    label: "练习说明",
}));
const __VLS_218 = __VLS_217({
    label: "练习说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
}));
const __VLS_222 = __VLS_221({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
var __VLS_219;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "choose-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "block-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sub-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mini-toolbar" },
});
const __VLS_224 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    ...{ 'onClick': {} },
    size: "small",
    plain: true,
}));
const __VLS_226 = __VLS_225({
    ...{ 'onClick': {} },
    size: "small",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_228;
let __VLS_229;
let __VLS_230;
const __VLS_231 = {
    onClick: (__VLS_ctx.loadQuestionPool)
};
__VLS_227.slots.default;
var __VLS_227;
const __VLS_232 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    data: (__VLS_ctx.questionPool),
    height: "340",
    border: true,
}));
const __VLS_234 = __VLS_233({
    data: (__VLS_ctx.questionPool),
    height: "340",
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    prop: "id",
    label: "ID",
    width: "70",
}));
const __VLS_238 = __VLS_237({
    prop: "id",
    label: "ID",
    width: "70",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
const __VLS_240 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    prop: "type",
    label: "题型",
    width: "100",
}));
const __VLS_242 = __VLS_241({
    prop: "type",
    label: "题型",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_243.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.typeText(row.type));
}
var __VLS_243;
const __VLS_244 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    prop: "courseName",
    label: "课程名",
    width: "150",
    showOverflowTooltip: true,
}));
const __VLS_246 = __VLS_245({
    prop: "courseName",
    label: "课程名",
    width: "150",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
const __VLS_248 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    prop: "stem",
    label: "题干",
}));
const __VLS_250 = __VLS_249({
    prop: "stem",
    label: "题干",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_251.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "two-line" },
    });
    (row.stem);
}
var __VLS_251;
const __VLS_252 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    label: "操作",
    width: "90",
}));
const __VLS_254 = __VLS_253({
    label: "操作",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_255.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_256 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        ...{ 'onClick': {} },
        size: "small",
        plain: true,
    }));
    const __VLS_258 = __VLS_257({
        ...{ 'onClick': {} },
        size: "small",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    let __VLS_260;
    let __VLS_261;
    let __VLS_262;
    const __VLS_263 = {
        onClick: (...[$event]) => {
            __VLS_ctx.addQuestion(row);
        }
    };
    __VLS_259.slots.default;
    var __VLS_259;
}
var __VLS_255;
var __VLS_235;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "block-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sub-title" },
});
const __VLS_264 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    data: (__VLS_ctx.form.questions),
    height: "340",
    border: true,
}));
const __VLS_266 = __VLS_265({
    data: (__VLS_ctx.form.questions),
    height: "340",
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
const __VLS_268 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    prop: "sortNo",
    label: "序号",
    width: "80",
}));
const __VLS_270 = __VLS_269({
    prop: "sortNo",
    label: "序号",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
const __VLS_272 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    prop: "questionId",
    label: "题目ID",
    width: "90",
}));
const __VLS_274 = __VLS_273({
    prop: "questionId",
    label: "题目ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
const __VLS_276 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    label: "操作",
    width: "100",
}));
const __VLS_278 = __VLS_277({
    label: "操作",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_279.slots;
    const [{ $index }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_280 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        plain: true,
    }));
    const __VLS_282 = __VLS_281({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    let __VLS_284;
    let __VLS_285;
    let __VLS_286;
    const __VLS_287 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeQuestion($index);
        }
    };
    __VLS_283.slots.default;
    var __VLS_283;
}
var __VLS_279;
var __VLS_267;
var __VLS_127;
{
    const { footer: __VLS_thisSlot } = __VLS_123.slots;
    const __VLS_288 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
        ...{ 'onClick': {} },
    }));
    const __VLS_290 = __VLS_289({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    let __VLS_292;
    let __VLS_293;
    let __VLS_294;
    const __VLS_295 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_291.slots.default;
    var __VLS_291;
    const __VLS_296 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_298 = __VLS_297({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    let __VLS_300;
    let __VLS_301;
    let __VLS_302;
    const __VLS_303 = {
        onClick: (__VLS_ctx.handleSave)
    };
    __VLS_299.slots.default;
    var __VLS_299;
}
var __VLS_123;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['course-field']} */ ;
/** @type {__VLS_StyleScopedClasses['course-name-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-block']} */ ;
/** @type {__VLS_StyleScopedClasses['block-left']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-title']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['two-line']} */ ;
/** @type {__VLS_StyleScopedClasses['block-right']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            questionPool: questionPool,
            params: params,
            dialogVisible: dialogVisible,
            form: form,
            currentCourseName: currentCourseName,
            handleTypeChange: handleTypeChange,
            load: load,
            loadQuestionPool: loadQuestionPool,
            openCreate: openCreate,
            openEdit: openEdit,
            addQuestion: addQuestion,
            removeQuestion: removeQuestion,
            handleSave: handleSave,
            togglePublish: togglePublish,
            handleDelete: handleDelete,
            typeText: typeText,
            statusText: statusText,
            statusTag: statusTag,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
