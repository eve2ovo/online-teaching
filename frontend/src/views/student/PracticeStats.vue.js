import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getChaptersApi } from '@/api/chapter';
import { getMyLearningCoursesApi } from '@/api/course';
import { getFavoriteQuestionPageApi, getWrongQuestionPageApi, removeFavoriteQuestionApi, removeWrongQuestionApi } from '@/api/practice';
const route = useRoute();
const router = useRouter();
const activeTab = ref(route.query.tab === 'favorite' ? 'favorite' : 'wrong');
const courseOptions = ref([]);
const chapterOptions = ref([]);
const params = reactive({
    current: 1,
    size: 10,
    keyword: '',
    courseId: undefined,
    chapterId: undefined
});
const list = reactive({
    total: 0,
    records: []
});
const selectedChapterName = computed(() => chapterOptions.value.find(item => item.id === params.chapterId)?.title || '');
const uniqueCourseCount = computed(() => new Set(list.records.map(item => item.courseId).filter(Boolean)).size);
const secondaryMetric = computed(() => {
    if (activeTab.value === 'wrong') {
        return list.records.reduce((sum, item) => sum + (item.wrongCount || 0), 0);
    }
    return list.records.filter(item => !!item.analysis).length;
});
const courseText = (courseId) => {
    if (!courseId)
        return '';
    return courseOptions.value.find(item => item.id === courseId)?.title || `课程 ${courseId}`;
};
const chapterText = (chapterId) => {
    if (!chapterId)
        return '';
    return chapterOptions.value.find(item => item.id === chapterId)?.title || `章节 ${chapterId}`;
};
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
const loadCurrentTab = async () => {
    const res = activeTab.value === 'wrong'
        ? await getWrongQuestionPageApi(params)
        : await getFavoriteQuestionPageApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const handleFilterChange = () => {
    params.current = 1;
    loadCurrentTab();
};
const handleCourseChange = async (courseId) => {
    params.chapterId = undefined;
    await loadChapters(courseId);
    handleFilterChange();
};
const handleTabChange = () => {
    params.current = 1;
    loadCurrentTab();
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
const formatTime = (value) => {
    if (!value)
        return '-';
    return value.replace('T', ' ');
};
const goPracticeCenter = () => {
    router.push('/student/practices');
};
const removeItem = async (questionId) => {
    if (activeTab.value === 'wrong') {
        await removeWrongQuestionApi(questionId);
        ElMessage.success('已移出错题本');
    }
    else {
        await removeFavoriteQuestionApi(questionId);
        ElMessage.success('已取消收藏');
    }
    loadCurrentTab();
};
watch(() => route.query.tab, (tab) => {
    activeTab.value = tab === 'favorite' ? 'favorite' : 'wrong';
    params.current = 1;
    loadCurrentTab();
});
onMounted(async () => {
    await loadCourses();
    if (params.courseId) {
        await loadChapters(params.courseId);
    }
    await loadCurrentTab();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['highlight-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['review-card']} */ ;
/** @type {__VLS_StyleScopedClasses['head-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-box']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-box']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['review-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "review-page" },
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
    placeholder: "搜索题干",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索题干",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.handleFilterChange)
};
var __VLS_3;
const __VLS_8 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.courseId),
    placeholder: "选择课程",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.courseId),
    placeholder: "选择课程",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onChange: (__VLS_ctx.handleCourseChange)
};
__VLS_11.slots.default;
for (const [course] of __VLS_getVForSourceType((__VLS_ctx.courseOptions))) {
    const __VLS_16 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }));
    const __VLS_18 = __VLS_17({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
var __VLS_11;
const __VLS_20 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "选择章节",
    clearable: true,
    filterable: true,
    disabled: (!__VLS_ctx.params.courseId),
    ...{ style: {} },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.chapterId),
    placeholder: "选择章节",
    clearable: true,
    filterable: true,
    disabled: (!__VLS_ctx.params.courseId),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onChange: (__VLS_ctx.handleFilterChange)
};
__VLS_23.slots.default;
for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.chapterOptions))) {
    const __VLS_28 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (chapter.id),
        label: (chapter.title),
        value: (chapter.id),
    }));
    const __VLS_30 = __VLS_29({
        key: (chapter.id),
        label: (chapter.title),
        value: (chapter.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_23;
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.loadCurrentTab)
};
__VLS_35.slots.default;
var __VLS_35;
const __VLS_40 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onTabChange: (__VLS_ctx.handleTabChange)
};
__VLS_43.slots.default;
const __VLS_48 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "错题本",
    name: "wrong",
}));
const __VLS_50 = __VLS_49({
    label: "错题本",
    name: "wrong",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "收藏夹",
    name: "favorite",
}));
const __VLS_54 = __VLS_53({
    label: "收藏夹",
    name: "favorite",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "review-highlight soft-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-title" },
});
(__VLS_ctx.activeTab === 'wrong' ? '错题复盘区' : '收藏回看区');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-desc" },
});
(__VLS_ctx.activeTab === 'wrong'
    ? `当前共 ${__VLS_ctx.list.total || 0} 道错题，优先按错题次数和最近出错时间安排复盘。`
    : `当前共 ${__VLS_ctx.list.total || 0} 道收藏题，可以按课程和章节继续二刷。`);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-tags" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "highlight-chip" },
});
(__VLS_ctx.activeTab === 'wrong' ? '累计错题次数' : '含解析题目数');
(__VLS_ctx.secondaryMetric);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "highlight-chip light" },
});
(__VLS_ctx.uniqueCourseCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.activeTab === 'wrong' ? '错题总数' : '收藏总数');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.list.total || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.uniqueCourseCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
(__VLS_ctx.activeTab === 'wrong' ? '累计错题次数' : '含解析题目数');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.secondaryMetric);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value small" },
});
(__VLS_ctx.selectedChapterName || '全部章节');
if (__VLS_ctx.list.records.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "review-list" },
    });
    for (const [row] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${__VLS_ctx.activeTab}-${row.questionId}`),
            ...{ class: "review-card" },
            ...{ class: ({ 'wrong-mode': __VLS_ctx.activeTab === 'wrong' }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "review-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "head-tags" },
        });
        const __VLS_56 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        (__VLS_ctx.typeText(row.type));
        var __VLS_59;
        if (__VLS_ctx.courseText(row.courseId)) {
            const __VLS_60 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                type: "info",
                effect: "plain",
            }));
            const __VLS_62 = __VLS_61({
                type: "info",
                effect: "plain",
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            __VLS_63.slots.default;
            (__VLS_ctx.courseText(row.courseId));
            var __VLS_63;
        }
        if (__VLS_ctx.chapterText(row.chapterId)) {
            const __VLS_64 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                type: "success",
                effect: "plain",
            }));
            const __VLS_66 = __VLS_65({
                type: "success",
                effect: "plain",
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            __VLS_67.slots.default;
            (__VLS_ctx.chapterText(row.chapterId));
            var __VLS_67;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "head-side" },
        });
        if (__VLS_ctx.activeTab === 'wrong') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "head-badge danger" },
            });
            (row.wrongCount || 0);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "head-badge" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "review-stem" },
        });
        (row.stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "review-meta-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (row.knowledgePoint || '未标注');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.activeTab === 'wrong' ? '最近错题时间' : '收藏时间');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.activeTab === 'wrong' ? __VLS_ctx.formatTime(row.lastWrongTime) : __VLS_ctx.formatTime(row.favoriteTime));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "analysis-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (row.answerText || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block success-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (row.analysis || '暂无解析');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions review-actions" },
        });
        const __VLS_68 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (__VLS_ctx.goPracticeCenter)
        };
        __VLS_71.slots.default;
        var __VLS_71;
        const __VLS_76 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            ...{ 'onClick': {} },
            type: "danger",
            plain: true,
        }));
        const __VLS_78 = __VLS_77({
            ...{ 'onClick': {} },
            type: "danger",
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        let __VLS_80;
        let __VLS_81;
        let __VLS_82;
        const __VLS_83 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.removeItem(row.questionId);
            }
        };
        __VLS_79.slots.default;
        (__VLS_ctx.activeTab === 'wrong' ? '移出错题本' : '取消收藏');
        var __VLS_79;
    }
}
else {
    const __VLS_84 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        description: "暂无符合条件的题目",
        ...{ style: {} },
    }));
    const __VLS_86 = __VLS_85({
        description: "暂无符合条件的题目",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination-row" },
});
const __VLS_88 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_90 = __VLS_89({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
let __VLS_92;
let __VLS_93;
let __VLS_94;
const __VLS_95 = {
    onCurrentChange: (__VLS_ctx.loadCurrentTab)
};
var __VLS_91;
/** @type {__VLS_StyleScopedClasses['review-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['review-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['soft-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-main']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['light']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['review-list']} */ ;
/** @type {__VLS_StyleScopedClasses['review-card']} */ ;
/** @type {__VLS_StyleScopedClasses['review-head']} */ ;
/** @type {__VLS_StyleScopedClasses['head-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['head-side']} */ ;
/** @type {__VLS_StyleScopedClasses['head-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['head-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['review-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['review-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-box']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-box']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['success-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['review-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            courseOptions: courseOptions,
            chapterOptions: chapterOptions,
            params: params,
            list: list,
            selectedChapterName: selectedChapterName,
            uniqueCourseCount: uniqueCourseCount,
            secondaryMetric: secondaryMetric,
            courseText: courseText,
            chapterText: chapterText,
            loadCurrentTab: loadCurrentTab,
            handleFilterChange: handleFilterChange,
            handleCourseChange: handleCourseChange,
            handleTabChange: handleTabChange,
            typeText: typeText,
            formatTime: formatTime,
            goPracticeCenter: goPracticeCenter,
            removeItem: removeItem,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
