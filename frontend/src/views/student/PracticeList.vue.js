import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getChaptersApi } from '@/api/chapter';
import { getMyLearningCoursesApi } from '@/api/course';
import { getStudentPracticeListApi } from '@/api/practice';
const router = useRouter();
const courseOptions = ref([]);
const chapterOptions = ref([]);
const params = reactive({
    current: 1,
    size: 9,
    keyword: '',
    courseId: undefined,
    chapterId: undefined,
    type: undefined
});
const list = reactive({
    total: 0,
    records: []
});
const loadCourses = async () => {
    const res = await getMyLearningCoursesApi();
    courseOptions.value = Array.isArray(res) ? res : [];
};
const loadChapters = async (courseId) => {
    if (!courseId) {
        chapterOptions.value = [];
        return;
    }
    chapterOptions.value = await getChaptersApi(courseId);
};
const load = async () => {
    const res = await getStudentPracticeListApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const handleFilterChange = () => {
    params.current = 1;
    load();
};
const handleCourseChange = async (courseId) => {
    params.chapterId = undefined;
    await loadChapters(courseId);
    handleFilterChange();
};
const goPractice = (item) => {
    if (item.submitted === 1 && item.practiceRecordId) {
        router.push(`/student/practice-result?recordId=${item.practiceRecordId}`);
        return;
    }
    router.push(`/student/practice/${item.id}`);
};
const goRecords = () => {
    router.push('/student/practice-records');
};
const goReview = (tab) => {
    router.push(`/student/practice-review?tab=${tab}`);
};
const typeText = (type) => {
    return {
        CHAPTER: '章节练习',
        SPECIAL: '专题练习',
        MOCK: '模拟练习',
        FINAL_EXAM: '期末考试'
    }[type] || type;
};
const typeTag = (type) => {
    return {
        CHAPTER: 'success',
        SPECIAL: 'warning',
        MOCK: 'danger',
        FINAL_EXAM: 'info'
    }[type] || '';
};
const durationText = (durationMinutes) => {
    return durationMinutes ? `${durationMinutes} 分钟` : '不限时';
};
onMounted(async () => {
    await loadCourses();
    await load();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-footer']} */ ;
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
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索练习标题",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
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
const __VLS_8 = {
    onKeyup: (__VLS_ctx.load)
};
var __VLS_3;
const __VLS_9 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.type),
    placeholder: "练习类型",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.type),
    placeholder: "练习类型",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onChange: (__VLS_ctx.handleFilterChange)
};
__VLS_12.slots.default;
const __VLS_17 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    label: "章节练习",
    value: "CHAPTER",
}));
const __VLS_19 = __VLS_18({
    label: "章节练习",
    value: "CHAPTER",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_21 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    label: "专题练习",
    value: "SPECIAL",
}));
const __VLS_23 = __VLS_22({
    label: "专题练习",
    value: "SPECIAL",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const __VLS_25 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    label: "模拟练习",
    value: "MOCK",
}));
const __VLS_27 = __VLS_26({
    label: "模拟练习",
    value: "MOCK",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_29 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    label: "期末考试",
    value: "FINAL_EXAM",
}));
const __VLS_31 = __VLS_30({
    label: "期末考试",
    value: "FINAL_EXAM",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
var __VLS_12;
const __VLS_33 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.courseId),
    placeholder: "所属课程",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}));
const __VLS_35 = __VLS_34({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.courseId),
    placeholder: "所属课程",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_37;
let __VLS_38;
let __VLS_39;
const __VLS_40 = {
    onChange: (__VLS_ctx.handleCourseChange)
};
__VLS_36.slots.default;
for (const [course] of __VLS_getVForSourceType((__VLS_ctx.courseOptions))) {
    const __VLS_41 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }));
    const __VLS_43 = __VLS_42({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
}
var __VLS_36;
const __VLS_45 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "所属章节",
    clearable: true,
    filterable: true,
    disabled: (!__VLS_ctx.params.courseId),
    ...{ style: {} },
}));
const __VLS_47 = __VLS_46({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "所属章节",
    clearable: true,
    filterable: true,
    disabled: (!__VLS_ctx.params.courseId),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
let __VLS_51;
const __VLS_52 = {
    onChange: (__VLS_ctx.handleFilterChange)
};
__VLS_48.slots.default;
for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.chapterOptions))) {
    const __VLS_53 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        key: (chapter.id),
        label: (chapter.title),
        value: (chapter.id),
    }));
    const __VLS_55 = __VLS_54({
        key: (chapter.id),
        label: (chapter.title),
        value: (chapter.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
}
var __VLS_48;
const __VLS_57 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_59 = __VLS_58({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_61;
let __VLS_62;
let __VLS_63;
const __VLS_64 = {
    onClick: (__VLS_ctx.load)
};
__VLS_60.slots.default;
var __VLS_60;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goRecords) },
    ...{ class: "nav-card" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goReview('wrong');
        } },
    ...{ class: "nav-card warning" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goReview('favorite');
        } },
    ...{ class: "nav-card success" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-desc" },
});
if (__VLS_ctx.list.records?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "practice-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "practice-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "practice-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "practice-desc" },
        });
        (item.description || '暂无练习说明');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-tags" },
        });
        const __VLS_65 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
            type: (__VLS_ctx.typeTag(item.type)),
            effect: "light",
        }));
        const __VLS_67 = __VLS_66({
            type: (__VLS_ctx.typeTag(item.type)),
            effect: "light",
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        __VLS_68.slots.default;
        (__VLS_ctx.typeText(item.type));
        var __VLS_68;
        const __VLS_69 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            type: (item.submitted === 1 ? 'success' : 'info'),
            effect: "plain",
        }));
        const __VLS_71 = __VLS_70({
            type: (item.submitted === 1 ? 'success' : 'info'),
            effect: "plain",
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        (item.submitted === 1 ? '已完成' : '未完成');
        var __VLS_72;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.questionCount || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.totalScore || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.durationText(item.durationMinutes));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card wide" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.courseName || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "practice-footer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
        (item.submitted === 1 ? '本练习已完成，不能再次作答。' : '本练习仅有一次作答机会。');
        const __VLS_73 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_75 = __VLS_74({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        let __VLS_77;
        let __VLS_78;
        let __VLS_79;
        const __VLS_80 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records?.length))
                    return;
                __VLS_ctx.goPractice(item);
            }
        };
        __VLS_76.slots.default;
        (item.submitted === 1 ? '查看结果' : '开始练习');
        var __VLS_76;
    }
}
else {
    const __VLS_81 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        description: "当前没有可用练习",
    }));
    const __VLS_83 = __VLS_82({
        description: "当前没有可用练习",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination-row" },
});
const __VLS_85 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_87 = __VLS_86({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_89;
let __VLS_90;
let __VLS_91;
const __VLS_92 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_88;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-card']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-card']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-title']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['card-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['wide']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            courseOptions: courseOptions,
            chapterOptions: chapterOptions,
            params: params,
            list: list,
            load: load,
            handleFilterChange: handleFilterChange,
            handleCourseChange: handleCourseChange,
            goPractice: goPractice,
            goRecords: goRecords,
            goReview: goReview,
            typeText: typeText,
            typeTag: typeTag,
            durationText: durationText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
