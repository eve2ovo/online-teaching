import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteApprovedCourseApi } from '@/api/admin-course-manage';
import { getAdminCoursesApi, getAdminCourseDetailApi, auditCourseApi } from '@/api/course';
import { getCategoriesApi, saveCategoryApi, deleteCategoryApi } from '@/api/category';
const loading = ref(false);
const detailVisible = ref(false);
const categoryDialogVisible = ref(false);
const params = reactive({
    current: 1,
    size: 8,
    keyword: ''
});
const list = reactive({
    total: 0,
    records: []
});
const categories = ref([]);
const categoryForm = reactive({
    name: ''
});
const detailData = reactive({
    course: null,
    chapters: []
});
const loadCategories = async () => {
    categories.value = await getCategoriesApi();
};
const load = async () => {
    loading.value = true;
    try {
        const res = await getAdminCoursesApi({
            current: params.current,
            size: params.size,
            keyword: params.keyword
        });
        list.total = res.total || 0;
        list.records = res.records || [];
    }
    finally {
        loading.value = false;
    }
};
const handleSearch = () => {
    params.current = 1;
    load();
};
const handleCurrentChange = (page) => {
    params.current = page;
    load();
};
const viewDetail = async (id) => {
    const res = await getAdminCourseDetailApi(id);
    detailData.course = res.course || null;
    detailData.chapters = res.chapters || [];
    detailVisible.value = true;
};
const audit = async (id, status) => {
    const result = await ElMessageBox.prompt('请输入审核意见', status === 'APPROVED' ? '通过审核' : '驳回课程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: status === 'APPROVED' ? '审核通过' : '审核驳回'
    });
    await auditCourseApi(id, {
        status,
        auditReason: result.value
    });
    ElMessage.success(status === 'APPROVED' ? '课程已通过审核' : '课程已驳回');
    await load();
};
const removeCourse = async (row) => {
    await ElMessageBox.confirm(`确认删除课程《${row.title}》吗？`, '提示', { type: 'warning' });
    await deleteApprovedCourseApi(row.id);
    ElMessage.success('课程删除成功');
    if (list.records.length === 1 && params.current > 1) {
        params.current--;
    }
    await load();
};
const openCategoryDialog = () => {
    categoryForm.name = '';
    categoryDialogVisible.value = true;
};
const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
        ElMessage.warning('请输入课程分类名称');
        return;
    }
    await saveCategoryApi(categoryForm.name.trim());
    ElMessage.success('课程分类新增成功');
    categoryDialogVisible.value = false;
    await loadCategories();
};
const removeCategory = async (item) => {
    await ElMessageBox.confirm(`确认删除课程分类“${item.name}”吗？`, '提示', { type: 'warning' });
    await deleteCategoryApi(item.id);
    ElMessage.success('课程分类删除成功');
    await loadCategories();
    await load();
};
onMounted(async () => {
    await loadCategories();
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
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程标题",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClear': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程标题",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClear: (__VLS_ctx.handleSearch)
};
const __VLS_8 = {
    onKeyup: (__VLS_ctx.handleSearch)
};
var __VLS_3;
const __VLS_9 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_12.slots.default;
var __VLS_12;
const __VLS_17 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_19 = __VLS_18({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onClick: (__VLS_ctx.openCategoryDialog)
};
__VLS_20.slots.default;
var __VLS_20;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "category-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sub-title" },
});
if (__VLS_ctx.categories.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "category-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "category-chip" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.id);
        (item.name);
        const __VLS_25 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_29;
        let __VLS_30;
        let __VLS_31;
        const __VLS_32 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.categories.length))
                    return;
                __VLS_ctx.removeCategory(item);
            }
        };
        __VLS_28.slots.default;
        var __VLS_28;
    }
}
else {
    const __VLS_33 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        description: "暂无课程分类",
        imageSize: (60),
    }));
    const __VLS_35 = __VLS_34({
        description: "暂无课程分类",
        imageSize: (60),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
const __VLS_37 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    data: (__VLS_ctx.list.records),
    ...{ style: {} },
}));
const __VLS_39 = __VLS_38({
    data: (__VLS_ctx.list.records),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_40.slots.default;
const __VLS_41 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    prop: "id",
    label: "课程ID",
    width: "90",
}));
const __VLS_43 = __VLS_42({
    prop: "id",
    label: "课程ID",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    prop: "title",
    label: "课程名称",
    minWidth: "220",
}));
const __VLS_47 = __VLS_46({
    prop: "title",
    label: "课程名称",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
const __VLS_49 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    prop: "teacherId",
    label: "教师ID",
    width: "100",
}));
const __VLS_51 = __VLS_50({
    prop: "teacherId",
    label: "教师ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
const __VLS_53 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    prop: "categoryId",
    label: "分类ID",
    width: "100",
}));
const __VLS_55 = __VLS_54({
    prop: "categoryId",
    label: "分类ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
const __VLS_57 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    prop: "categoryName",
    label: "分类名称",
    width: "160",
}));
const __VLS_59 = __VLS_58({
    prop: "categoryName",
    label: "分类名称",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const __VLS_61 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: "审核状态",
    width: "120",
}));
const __VLS_63 = __VLS_62({
    label: "审核状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_64.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.status === 'PENDING') {
        const __VLS_65 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            type: "warning",
        }));
        const __VLS_67 = __VLS_66({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        __VLS_68.slots.default;
        var __VLS_68;
    }
    else if (row.status === 'APPROVED') {
        const __VLS_69 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            type: "success",
        }));
        const __VLS_71 = __VLS_70({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        var __VLS_72;
    }
    else if (row.status === 'REJECTED') {
        const __VLS_73 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            type: "danger",
        }));
        const __VLS_75 = __VLS_74({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        var __VLS_76;
    }
    else {
        const __VLS_77 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
        const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_80.slots.default;
        var __VLS_80;
    }
}
var __VLS_64;
const __VLS_81 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    prop: "auditTime",
    label: "审核时间",
    minWidth: "180",
}));
const __VLS_83 = __VLS_82({
    prop: "auditTime",
    label: "审核时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
const __VLS_85 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    prop: "createdAt",
    label: "创建时间",
    minWidth: "180",
}));
const __VLS_87 = __VLS_86({
    prop: "createdAt",
    label: "创建时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const __VLS_89 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_91 = __VLS_90({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_92.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_93 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_95 = __VLS_94({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_97;
    let __VLS_98;
    let __VLS_99;
    const __VLS_100 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewDetail(row.id);
        }
    };
    __VLS_96.slots.default;
    var __VLS_96;
    if (row.status === 'PENDING') {
        const __VLS_101 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_105;
        let __VLS_106;
        let __VLS_107;
        const __VLS_108 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'PENDING'))
                    return;
                __VLS_ctx.audit(row.id, 'APPROVED');
            }
        };
        __VLS_104.slots.default;
        var __VLS_104;
        const __VLS_109 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }));
        const __VLS_111 = __VLS_110({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        let __VLS_113;
        let __VLS_114;
        let __VLS_115;
        const __VLS_116 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'PENDING'))
                    return;
                __VLS_ctx.audit(row.id, 'REJECTED');
            }
        };
        __VLS_112.slots.default;
        var __VLS_112;
    }
    else if (row.status === 'APPROVED') {
        const __VLS_117 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }));
        const __VLS_119 = __VLS_118({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        let __VLS_121;
        let __VLS_122;
        let __VLS_123;
        const __VLS_124 = {
            onClick: (...[$event]) => {
                if (!!(row.status === 'PENDING'))
                    return;
                if (!(row.status === 'APPROVED'))
                    return;
                __VLS_ctx.removeCourse(row);
            }
        };
        __VLS_120.slots.default;
        var __VLS_120;
    }
    else {
        const __VLS_125 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
            link: true,
            disabled: true,
        }));
        const __VLS_127 = __VLS_126({
            link: true,
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        __VLS_128.slots.default;
        (row.status === 'REJECTED' ? '已驳回' : '待提交审核');
        var __VLS_128;
    }
}
var __VLS_92;
var __VLS_40;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_129 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total),
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
}));
const __VLS_131 = __VLS_130({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total),
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
let __VLS_133;
let __VLS_134;
let __VLS_135;
const __VLS_136 = {
    onCurrentChange: (__VLS_ctx.handleCurrentChange)
};
var __VLS_132;
const __VLS_137 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
    modelValue: (__VLS_ctx.detailVisible),
    title: "课程详情",
    width: "760px",
}));
const __VLS_139 = __VLS_138({
    modelValue: (__VLS_ctx.detailVisible),
    title: "课程详情",
    width: "760px",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
__VLS_140.slots.default;
if (__VLS_ctx.detailData.course) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.teacherId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.categoryId ?? '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.categoryName || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.status);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.auditReason || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.auditTime || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.coverUrl || '暂无封面');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.detailData.course.description || '暂无简介');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sub-title" },
        ...{ style: {} },
    });
    if (__VLS_ctx.detailData.chapters?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.detailData.chapters))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (chapter.id),
                ...{ class: "chapter-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chapter-title" },
            });
            (chapter.sortNo);
            (chapter.title);
            if (chapter.resources?.length) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "resource-list" },
                });
                for (const [res] of __VLS_getVForSourceType((chapter.resources))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (res.id),
                        ...{ class: "resource-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (res.sortNo);
                    (res.title);
                    const __VLS_141 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
                        size: "small",
                        type: "info",
                    }));
                    const __VLS_143 = __VLS_142({
                        size: "small",
                        type: "info",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
                    __VLS_144.slots.default;
                    (res.type || '资源');
                    var __VLS_144;
                }
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "empty-tip" },
                });
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-tip" },
        });
    }
}
var __VLS_140;
const __VLS_145 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.categoryDialogVisible),
    title: "新增课程分类",
    width: "420px",
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.categoryDialogVisible),
    title: "新增课程分类",
    width: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    labelWidth: "90px",
}));
const __VLS_151 = __VLS_150({
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
const __VLS_153 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    label: "分类名称",
}));
const __VLS_155 = __VLS_154({
    label: "分类名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
const __VLS_157 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    modelValue: (__VLS_ctx.categoryForm.name),
    placeholder: "请输入课程分类名称",
}));
const __VLS_159 = __VLS_158({
    modelValue: (__VLS_ctx.categoryForm.name),
    placeholder: "请输入课程分类名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
var __VLS_156;
var __VLS_152;
{
    const { footer: __VLS_thisSlot } = __VLS_148.slots;
    const __VLS_161 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        ...{ 'onClick': {} },
    }));
    const __VLS_163 = __VLS_162({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_165;
    let __VLS_166;
    let __VLS_167;
    const __VLS_168 = {
        onClick: (...[$event]) => {
            __VLS_ctx.categoryDialogVisible = false;
        }
    };
    __VLS_164.slots.default;
    var __VLS_164;
    const __VLS_169 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_171 = __VLS_170({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    let __VLS_173;
    let __VLS_174;
    let __VLS_175;
    const __VLS_176 = {
        onClick: (__VLS_ctx.saveCategory)
    };
    __VLS_172.slots.default;
    var __VLS_172;
}
var __VLS_148;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['category-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-title']} */ ;
/** @type {__VLS_StyleScopedClasses['category-list']} */ ;
/** @type {__VLS_StyleScopedClasses['category-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-title']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-list']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            detailVisible: detailVisible,
            categoryDialogVisible: categoryDialogVisible,
            params: params,
            list: list,
            categories: categories,
            categoryForm: categoryForm,
            detailData: detailData,
            handleSearch: handleSearch,
            handleCurrentChange: handleCurrentChange,
            viewDetail: viewDetail,
            audit: audit,
            removeCourse: removeCourse,
            openCategoryDialog: openCategoryDialog,
            saveCategory: saveCategory,
            removeCategory: removeCategory,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
