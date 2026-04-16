import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTeacherCoursesApi } from '@/api/course';
import { deleteQuestionApi, getQuestionDetailApi, getTeacherQuestionPageApi, saveQuestionApi } from '@/api/practice';
const list = reactive({
    total: 0,
    records: []
});
const params = reactive({
    current: 1,
    size: 10,
    courseId: undefined,
    chapterId: undefined,
    keyword: ''
});
const dialogVisible = ref(false);
const courseOptions = ref([]);
const defaultForm = () => ({
    courseId: 1,
    chapterId: undefined,
    type: 'SINGLE',
    stem: '',
    answerText: '',
    analysis: '',
    difficulty: 'EASY',
    score: 1,
    knowledgePoint: '',
    options: [
        { optionLabel: 'A', optionContent: '', isCorrect: 0, sortNo: 1 },
        { optionLabel: 'B', optionContent: '', isCorrect: 0, sortNo: 2 },
        { optionLabel: 'C', optionContent: '', isCorrect: 0, sortNo: 3 },
        { optionLabel: 'D', optionContent: '', isCorrect: 0, sortNo: 4 }
    ]
});
const form = reactive(defaultForm());
const needOptions = computed(() => ['SINGLE', 'MULTIPLE', 'JUDGE'].includes(form.type));
const currentCourseName = computed(() => courseOptions.value.find((item) => item.id === form.courseId)?.title || '');
const resetForm = () => {
    Object.assign(form, defaultForm());
};
const loadCourseOptions = async () => {
    const res = await getTeacherCoursesApi({ current: 1, size: 999 });
    courseOptions.value = res.records || [];
};
const load = async () => {
    const res = await getTeacherQuestionPageApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const openCreate = () => {
    resetForm();
    dialogVisible.value = true;
};
const openEdit = async (id) => {
    const res = await getQuestionDetailApi(id);
    resetForm();
    Object.assign(form, res);
    form.options = (res.options || []).map((item) => ({
        optionLabel: item.optionLabel,
        optionContent: item.optionContent,
        isCorrect: item.isCorrect,
        sortNo: item.sortNo
    }));
    dialogVisible.value = true;
};
const addOption = () => {
    const nextNo = (form.options?.length || 0) + 1;
    form.options?.push({
        optionLabel: String.fromCharCode(64 + nextNo),
        optionContent: '',
        isCorrect: 0,
        sortNo: nextNo
    });
};
const removeOption = (index) => {
    form.options?.splice(index, 1);
    (form.options || []).forEach((item, idx) => {
        item.sortNo = idx + 1;
        item.optionLabel = String.fromCharCode(65 + idx);
    });
};
const handleSave = async () => {
    if (!form.stem?.trim())
        return ElMessage.warning('请输入题干');
    if (!form.courseId)
        return ElMessage.warning('请输入课程ID');
    if (needOptions.value && (!form.options || form.options.length < 2)) {
        return ElMessage.warning('选择题和判断题至少需要两个选项');
    }
    await saveQuestionApi(form);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    await load();
};
const handleDelete = async (id) => {
    await ElMessageBox.confirm('确认删除这道习题吗？', '提示', { type: 'warning' });
    await deleteQuestionApi(id);
    ElMessage.success('删除成功');
    await load();
};
const typeText = (type) => {
    return {
        SINGLE: '单选题',
        MULTIPLE: '多选题',
        JUDGE: '判断题',
        FILL: '填空题',
        SHORT: '简答题'
    }[type] || type;
};
const difficultyText = (difficulty) => {
    return {
        EASY: '简单',
        MEDIUM: '中等',
        HARD: '困难'
    }[difficulty] || difficulty;
};
const difficultyTag = (difficulty) => {
    return {
        EASY: 'success',
        MEDIUM: 'warning',
        HARD: 'danger'
    }[difficulty] || '';
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
    placeholder: "搜索题干关键词",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索题干关键词",
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
    placeholder: "课程ID",
    min: (1),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.params.courseId),
    placeholder: "课程ID",
    min: (1),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "章节ID",
    min: (1),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "章节ID",
    min: (1),
    controlsPosition: "right",
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
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "type",
    label: "题型",
    width: "110",
}));
const __VLS_42 = __VLS_41({
    prop: "type",
    label: "题型",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_44 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    (__VLS_ctx.typeText(row.type));
    var __VLS_47;
}
var __VLS_43;
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "difficulty",
    label: "难度",
    width: "100",
}));
const __VLS_50 = __VLS_49({
    prop: "difficulty",
    label: "难度",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        type: (__VLS_ctx.difficultyTag(row.difficulty)),
    }));
    const __VLS_54 = __VLS_53({
        type: (__VLS_ctx.difficultyTag(row.difficulty)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (__VLS_ctx.difficultyText(row.difficulty));
    var __VLS_55;
}
var __VLS_51;
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    prop: "stem",
    label: "题干",
    minWidth: "280",
}));
const __VLS_58 = __VLS_57({
    prop: "stem",
    label: "题干",
    minWidth: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_59.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "two-line" },
    });
    (row.stem);
}
var __VLS_59;
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "score",
    label: "分值",
    width: "90",
}));
const __VLS_62 = __VLS_61({
    prop: "score",
    label: "分值",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "knowledgePoint",
    label: "知识点",
    width: "140",
    showOverflowTooltip: true,
}));
const __VLS_66 = __VLS_65({
    prop: "knowledgePoint",
    label: "知识点",
    width: "140",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    prop: "courseId",
    label: "课程ID",
    width: "90",
}));
const __VLS_70 = __VLS_69({
    prop: "courseId",
    label: "课程ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    prop: "courseName",
    label: "课程名",
    width: "180",
    showOverflowTooltip: true,
}));
const __VLS_74 = __VLS_73({
    prop: "courseName",
    label: "课程名",
    width: "180",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "chapterId",
    label: "章节ID",
    width: "90",
}));
const __VLS_78 = __VLS_77({
    prop: "chapterId",
    label: "章节ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "操作",
    width: "210",
    fixed: "right",
}));
const __VLS_82 = __VLS_81({
    label: "操作",
    width: "210",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_83.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_84 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEdit(row.id);
        }
    };
    __VLS_87.slots.default;
    var __VLS_87;
    const __VLS_92 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDelete(row.id);
        }
    };
    __VLS_95.slots.default;
    var __VLS_95;
}
var __VLS_83;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_100 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_102 = __VLS_101({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_103;
const __VLS_108 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑习题' : '新增习题'),
    width: "920px",
    destroyOnClose: true,
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.form.id ? '编辑习题' : '新增习题'),
    width: "920px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}));
const __VLS_114 = __VLS_113({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-grid" },
});
const __VLS_116 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "课程ID",
}));
const __VLS_118 = __VLS_117({
    label: "课程ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "course-field" },
});
const __VLS_120 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.form.courseId),
    min: (1),
    ...{ style: {} },
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.form.courseId),
    min: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "course-name-tip" },
});
(__VLS_ctx.currentCourseName ? `课程名：${__VLS_ctx.currentCourseName}` : '课程名：未匹配到课程');
var __VLS_119;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "章节ID",
}));
const __VLS_126 = __VLS_125({
    label: "章节ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.form.chapterId),
    min: (1),
    ...{ style: {} },
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.form.chapterId),
    min: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_127;
const __VLS_132 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "题型",
}));
const __VLS_134 = __VLS_133({
    label: "题型",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}));
const __VLS_138 = __VLS_137({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    label: "单选题",
    value: "SINGLE",
}));
const __VLS_142 = __VLS_141({
    label: "单选题",
    value: "SINGLE",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
const __VLS_144 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "多选题",
    value: "MULTIPLE",
}));
const __VLS_146 = __VLS_145({
    label: "多选题",
    value: "MULTIPLE",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const __VLS_148 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "判断题",
    value: "JUDGE",
}));
const __VLS_150 = __VLS_149({
    label: "判断题",
    value: "JUDGE",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const __VLS_152 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "填空题",
    value: "FILL",
}));
const __VLS_154 = __VLS_153({
    label: "填空题",
    value: "FILL",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const __VLS_156 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    label: "简答题",
    value: "SHORT",
}));
const __VLS_158 = __VLS_157({
    label: "简答题",
    value: "SHORT",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_139;
var __VLS_135;
const __VLS_160 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "难度",
}));
const __VLS_162 = __VLS_161({
    label: "难度",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.form.difficulty),
    ...{ style: {} },
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.form.difficulty),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "简单",
    value: "EASY",
}));
const __VLS_170 = __VLS_169({
    label: "简单",
    value: "EASY",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const __VLS_172 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "中等",
    value: "MEDIUM",
}));
const __VLS_174 = __VLS_173({
    label: "中等",
    value: "MEDIUM",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "困难",
    value: "HARD",
}));
const __VLS_178 = __VLS_177({
    label: "困难",
    value: "HARD",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
var __VLS_167;
var __VLS_163;
const __VLS_180 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "分值",
}));
const __VLS_182 = __VLS_181({
    label: "分值",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.form.score),
    min: (1),
    step: (1),
    ...{ style: {} },
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.form.score),
    min: (1),
    step: (1),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_183;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "知识点",
}));
const __VLS_190 = __VLS_189({
    label: "知识点",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.form.knowledgePoint),
    placeholder: "例如：IOC、事务传播",
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.form.knowledgePoint),
    placeholder: "例如：IOC、事务传播",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "题干",
}));
const __VLS_198 = __VLS_197({
    label: "题干",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.form.stem),
    type: "textarea",
    rows: (4),
    placeholder: "请输入题干内容",
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.form.stem),
    type: "textarea",
    rows: (4),
    placeholder: "请输入题干内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_199;
if (__VLS_ctx.needOptions) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "option-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-title" },
    });
    const __VLS_204 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        ...{ 'onClick': {} },
        size: "small",
        plain: true,
    }));
    const __VLS_206 = __VLS_205({
        ...{ 'onClick': {} },
        size: "small",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    let __VLS_208;
    let __VLS_209;
    let __VLS_210;
    const __VLS_211 = {
        onClick: (__VLS_ctx.addOption)
    };
    __VLS_207.slots.default;
    var __VLS_207;
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.form.options))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "option-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-row" },
        });
        const __VLS_212 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
            modelValue: (item.optionLabel),
            placeholder: "A",
            ...{ style: {} },
        }));
        const __VLS_214 = __VLS_213({
            modelValue: (item.optionLabel),
            placeholder: "A",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_213));
        const __VLS_216 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            modelValue: (item.optionContent),
            placeholder: "请输入选项内容",
            ...{ style: {} },
        }));
        const __VLS_218 = __VLS_217({
            modelValue: (item.optionContent),
            placeholder: "请输入选项内容",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        const __VLS_220 = {}.ElSwitch;
        /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
        // @ts-ignore
        const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
            modelValue: (item.isCorrect),
            activeValue: (1),
            inactiveValue: (0),
            activeText: "正确",
            inactiveText: "错误",
        }));
        const __VLS_222 = __VLS_221({
            modelValue: (item.isCorrect),
            activeValue: (1),
            inactiveValue: (0),
            activeText: "正确",
            inactiveText: "错误",
        }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        const __VLS_224 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
            ...{ 'onClick': {} },
            type: "danger",
            plain: true,
        }));
        const __VLS_226 = __VLS_225({
            ...{ 'onClick': {} },
            type: "danger",
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_225));
        let __VLS_228;
        let __VLS_229;
        let __VLS_230;
        const __VLS_231 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.needOptions))
                    return;
                __VLS_ctx.removeOption(index);
            }
        };
        __VLS_227.slots.default;
        var __VLS_227;
    }
}
const __VLS_232 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    label: "答案",
}));
const __VLS_234 = __VLS_233({
    label: "答案",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.form.answerText),
    placeholder: "例如：A / A,C / T / 关键字答案",
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.form.answerText),
    placeholder: "例如：A / A,C / T / 关键字答案",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
var __VLS_235;
const __VLS_240 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    label: "解析",
}));
const __VLS_242 = __VLS_241({
    label: "解析",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
const __VLS_244 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.form.analysis),
    type: "textarea",
    rows: (4),
    placeholder: "请输入题目解析",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.form.analysis),
    type: "textarea",
    rows: (4),
    placeholder: "请输入题目解析",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
var __VLS_243;
var __VLS_115;
{
    const { footer: __VLS_thisSlot } = __VLS_111.slots;
    const __VLS_248 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_251.slots.default;
    var __VLS_251;
    const __VLS_256 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_258 = __VLS_257({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    let __VLS_260;
    let __VLS_261;
    let __VLS_262;
    const __VLS_263 = {
        onClick: (__VLS_ctx.handleSave)
    };
    __VLS_259.slots.default;
    var __VLS_259;
}
var __VLS_111;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['two-line']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['course-field']} */ ;
/** @type {__VLS_StyleScopedClasses['course-name-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['option-header']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-title']} */ ;
/** @type {__VLS_StyleScopedClasses['option-card']} */ ;
/** @type {__VLS_StyleScopedClasses['option-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            params: params,
            dialogVisible: dialogVisible,
            form: form,
            needOptions: needOptions,
            currentCourseName: currentCourseName,
            load: load,
            openCreate: openCreate,
            openEdit: openEdit,
            addOption: addOption,
            removeOption: removeOption,
            handleSave: handleSave,
            handleDelete: handleDelete,
            typeText: typeText,
            difficultyText: difficultyText,
            difficultyTag: difficultyTag,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
