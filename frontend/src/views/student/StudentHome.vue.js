import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCategoriesApi } from '@/api/category';
import { getStudentCoursesApi } from '@/api/course';
import { getMyStudyProgressApi } from '@/api/progress';
import { applyEnrollmentApi, getMyApplicationsApi, getMyApprovedCoursesApi } from '@/api/enrollment';
const router = useRouter();
const params = reactive({
    current: 1,
    size: 8,
    keyword: '',
    categoryId: undefined,
    sort: 'latest'
});
const list = reactive({
    total: 0,
    size: 8,
    current: 1,
    pages: 0,
    records: []
});
const categoryOptions = ref([]);
const applicationMap = ref({});
const approvedCourseIds = ref([]);
const progressMap = ref(new Map());
const joinedCourseCount = computed(() => approvedCourseIds.value.length);
const pendingCourseCount = computed(() => Object.values(applicationMap.value).filter(item => item.status === 'PENDING').length);
const continueCourse = computed(() => {
    const joinedCards = list.records
        .filter(item => approvedCourseIds.value.includes(item.id))
        .map(item => {
        const progress = progressMap.value.get(item.id);
        return {
            ...item,
            progressPercent: progress?.progressPercent || 0,
            completedResources: progress?.completedResources || 0,
            totalResources: progress?.totalResources || 0,
            lastLearnedAt: progress?.lastLearnedAt || null
        };
    })
        .sort((left, right) => {
        const leftTime = left.lastLearnedAt ? new Date(left.lastLearnedAt).getTime() : 0;
        const rightTime = right.lastLearnedAt ? new Date(right.lastLearnedAt).getTime() : 0;
        if (leftTime !== rightTime) {
            return rightTime - leftTime;
        }
        return right.progressPercent - left.progressPercent;
    });
    return joinedCards[0] || null;
});
const normalizeCourseList = (res) => {
    if (res?.records) {
        return res;
    }
    return {
        total: 0,
        size: params.size,
        current: params.current,
        pages: 0,
        records: []
    };
};
const normalizeApplicationList = (res) => {
    if (Array.isArray(res))
        return res;
    if (Array.isArray(res?.records))
        return res.records;
    if (Array.isArray(res?.data))
        return res.data;
    return [];
};
const pickLatestApplicationMap = (rows) => {
    const nextMap = {};
    for (const item of rows) {
        const current = nextMap[item.courseId];
        const currentTime = new Date(current?.updatedAt || current?.createdAt || 0).getTime();
        const nextTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        if (!current || nextTime >= currentTime) {
            nextMap[item.courseId] = item;
        }
    }
    applicationMap.value = nextMap;
};
const splitTags = (value) => {
    if (!value)
        return [];
    return value
        .split(/[，、,\s]+/)
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 4);
};
const teacherName = (course) => String(course.teacherName || course.teacherNickname || course.teacherRealName || '').trim() ||
    (course.teacherId ? `#${course.teacherId}` : '待分配');
const coursePublishText = (status) => ({
    DRAFT: '草稿',
    PENDING: '待发布',
    APPROVED: '已发布',
    REJECTED: '已驳回'
}[status || ''] || '已发布');
const resolveCourseState = (courseId) => {
    if (approvedCourseIds.value.includes(courseId)) {
        return {
            status: 'APPROVED',
            statusText: '已加入',
            buttonText: '进入学习',
            buttonType: 'success',
            helperText: '审核通过，可直接进入学习。',
            disabled: false
        };
    }
    const application = applicationMap.value[courseId];
    if (!application) {
        return {
            status: 'NOT_APPLIED',
            statusText: '未申请',
            buttonText: '申请选课',
            buttonType: 'primary',
            helperText: '提交申请后由老师审核。',
            disabled: false
        };
    }
    if (application.status === 'PENDING') {
        return {
            status: 'PENDING',
            statusText: '待审核',
            buttonText: '待审核',
            buttonType: 'info',
            helperText: '申请已提交，请等待老师处理。',
            disabled: true
        };
    }
    if (application.status === 'REJECTED') {
        return {
            status: 'REJECTED',
            statusText: '已拒绝',
            buttonText: '重新申请',
            buttonType: 'warning',
            helperText: application.reviewRemark || '申请未通过，可修改后重新申请。',
            disabled: false
        };
    }
    if (application.status === 'REMOVED') {
        return {
            status: 'REMOVED',
            statusText: '已被移出',
            buttonText: '重新申请',
            buttonType: 'warning',
            helperText: application.reviewRemark || '你已被老师移出课程，可重新申请。',
            disabled: false
        };
    }
    if (application.status === 'CANCELLED') {
        return {
            status: 'CANCELLED',
            statusText: '已退出',
            buttonText: '重新申请',
            buttonType: 'warning',
            helperText: '你已退出本课程，可重新申请。',
            disabled: false
        };
    }
    return {
        status: 'NOT_APPLIED',
        statusText: '未申请',
        buttonText: '申请选课',
        buttonType: 'primary',
        helperText: '提交申请后由老师审核。',
        disabled: false
    };
};
const stateTagType = (status) => ({
    NOT_APPLIED: '',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    REMOVED: 'info',
    CANCELLED: 'info'
}[status] || '');
const coverStyle = (coverUrl) => ({
    backgroundImage: coverUrl
        ? `linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.72)), url(${coverUrl})`
        : 'linear-gradient(135deg, #0f172a, #1d4ed8 55%, #38bdf8)'
});
const loadCourses = async () => {
    Object.assign(list, normalizeCourseList(await getStudentCoursesApi(params)));
};
const loadSupportData = async () => {
    const [categoryRes, applicationRes, approvedRes, progressRes] = await Promise.all([
        getCategoriesApi(),
        getMyApplicationsApi({ current: 1, size: 200 }),
        getMyApprovedCoursesApi(),
        getMyStudyProgressApi()
    ]);
    categoryOptions.value = categoryRes || [];
    pickLatestApplicationMap(normalizeApplicationList(applicationRes));
    approvedCourseIds.value = (approvedRes || []).map(item => item.id);
    progressMap.value = new Map((progressRes || []).map(item => [item.courseId, item]));
};
const load = async () => {
    await Promise.all([loadCourses(), loadSupportData()]);
};
const handleSearch = async () => {
    params.current = 1;
    await loadCourses();
};
const resetFilters = async () => {
    params.current = 1;
    params.keyword = '';
    params.categoryId = undefined;
    params.sort = 'latest';
    await loadCourses();
};
const detail = (id) => {
    router.push(`/student/course/${id}`);
};
const learn = (id) => {
    router.push(`/student/learn/${id}`);
};
const openApplyDialog = async (course, isReapply = false) => {
    try {
        const { value } = await ElMessageBox.prompt(isReapply ? '可补充新的申请说明，帮助老师重新评估。' : '可填写申请说明，方便老师了解你的学习诉求。', isReapply ? '重新申请选课' : '申请选课', {
            confirmButtonText: '提交申请',
            cancelButtonText: '取消',
            inputValue: '',
            inputPlaceholder: '申请说明（选填）'
        });
        await applyEnrollmentApi(course.id, {
            applyReason: value?.trim() || undefined
        });
        ElMessage.success('申请已提交');
        await loadSupportData();
    }
    catch {
        // ignore cancel
    }
};
const handlePrimaryAction = async (course) => {
    const state = resolveCourseState(course.id);
    if (state.status === 'APPROVED') {
        learn(course.id);
        return;
    }
    if (state.status === 'NOT_APPLIED') {
        await openApplyDialog(course, false);
        return;
    }
    if (state.status === 'REJECTED' || state.status === 'REMOVED' || state.status === 'CANCELLED') {
        await openApplyDialog(course, true);
    }
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-top']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "student-home" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card plaza-hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.list.total || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.joinedCourseCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.pendingCourseCount);
if (__VLS_ctx.continueCourse) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "continue-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-title" },
    });
    (__VLS_ctx.continueCourse.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-meta" },
    });
    (__VLS_ctx.continueCourse.progressPercent);
    (__VLS_ctx.continueCourse.completedResources);
    (__VLS_ctx.continueCourse.totalResources);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel-actions" },
    });
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.continueCourse))
                return;
            __VLS_ctx.learn(__VLS_ctx.continueCourse.id);
        }
    };
    __VLS_3.slots.default;
    var __VLS_3;
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        plain: true,
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.continueCourse))
                return;
            __VLS_ctx.detail(__VLS_ctx.continueCourse.id);
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-bar" },
});
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程标题或简介",
    clearable: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程标题或简介",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onKeyup: (__VLS_ctx.handleSearch)
};
var __VLS_19;
const __VLS_24 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.categoryId),
    placeholder: "课程分类",
    clearable: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.categoryId),
    placeholder: "课程分类",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_27.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categoryOptions))) {
    const __VLS_32 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_34 = __VLS_33({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
var __VLS_27;
const __VLS_36 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.sort),
}));
const __VLS_38 = __VLS_37({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.sort),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_39.slots.default;
const __VLS_44 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "最新发布",
    value: "latest",
}));
const __VLS_46 = __VLS_45({
    label: "最新发布",
    value: "latest",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "热门优先",
    value: "popular",
}));
const __VLS_50 = __VLS_49({
    label: "热门优先",
    value: "popular",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "标题排序",
    value: "titleAsc",
}));
const __VLS_54 = __VLS_53({
    label: "标题排序",
    value: "titleAsc",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_39;
const __VLS_56 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: (__VLS_ctx.resetFilters)
};
__VLS_59.slots.default;
var __VLS_59;
if (__VLS_ctx.list.records.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "course-grid" },
    });
    for (const [course] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (course.id),
            ...{ class: "course-card plaza-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cover-shell" },
            ...{ style: (__VLS_ctx.coverStyle(course.coverUrl)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cover-top" },
        });
        const __VLS_64 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            round: true,
            effect: "dark",
            ...{ class: "cover-tag" },
        }));
        const __VLS_66 = __VLS_65({
            round: true,
            effect: "dark",
            ...{ class: "cover-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        (course.categoryName || '综合课程');
        var __VLS_67;
        const __VLS_68 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            round: true,
            type: (__VLS_ctx.stateTagType(__VLS_ctx.resolveCourseState(course.id).status)),
        }));
        const __VLS_70 = __VLS_69({
            round: true,
            type: (__VLS_ctx.stateTagType(__VLS_ctx.resolveCourseState(course.id).status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        __VLS_71.slots.default;
        (__VLS_ctx.resolveCourseState(course.id).statusText);
        var __VLS_71;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cover-bottom" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cover-title" },
        });
        (course.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cover-sub" },
        });
        (__VLS_ctx.teacherName(course));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "course-summary" },
        });
        (course.description || '暂无课程简介');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-list" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-item" },
        });
        (course.id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-item" },
        });
        (__VLS_ctx.coursePublishText(course.status));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-item" },
        });
        (course.popularityCount || 0);
        if (__VLS_ctx.splitTags(course.tags).length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tag-row" },
            });
            for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.splitTags(course.tags)))) {
                const __VLS_72 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                    key: (`${course.id}-${tag}`),
                    size: "small",
                    effect: "plain",
                }));
                const __VLS_74 = __VLS_73({
                    key: (`${course.id}-${tag}`),
                    size: "small",
                    effect: "plain",
                }, ...__VLS_functionalComponentArgsRest(__VLS_73));
                __VLS_75.slots.default;
                (tag);
                var __VLS_75;
            }
        }
        if (__VLS_ctx.resolveCourseState(course.id).helperText) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "helper-text" },
            });
            (__VLS_ctx.resolveCourseState(course.id).helperText);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
        const __VLS_76 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            ...{ 'onClick': {} },
            plain: true,
        }));
        const __VLS_78 = __VLS_77({
            ...{ 'onClick': {} },
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        let __VLS_80;
        let __VLS_81;
        let __VLS_82;
        const __VLS_83 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.detail(course.id);
            }
        };
        __VLS_79.slots.default;
        var __VLS_79;
        const __VLS_84 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            ...{ 'onClick': {} },
            type: (__VLS_ctx.resolveCourseState(course.id).buttonType),
            disabled: (__VLS_ctx.resolveCourseState(course.id).disabled),
        }));
        const __VLS_86 = __VLS_85({
            ...{ 'onClick': {} },
            type: (__VLS_ctx.resolveCourseState(course.id).buttonType),
            disabled: (__VLS_ctx.resolveCourseState(course.id).disabled),
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        let __VLS_88;
        let __VLS_89;
        let __VLS_90;
        const __VLS_91 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.handlePrimaryAction(course);
            }
        };
        __VLS_87.slots.default;
        (__VLS_ctx.resolveCourseState(course.id).buttonText);
        var __VLS_87;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-card empty-tip" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card pagination-card" },
});
const __VLS_92 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_94 = __VLS_93({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onCurrentChange: (__VLS_ctx.loadCourses)
};
var __VLS_95;
/** @type {__VLS_StyleScopedClasses['student-home']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plaza-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['continue-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-label']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['course-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['course-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plaza-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-top']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-title']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['course-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-list']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-row']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            params: params,
            list: list,
            categoryOptions: categoryOptions,
            joinedCourseCount: joinedCourseCount,
            pendingCourseCount: pendingCourseCount,
            continueCourse: continueCourse,
            splitTags: splitTags,
            teacherName: teacherName,
            coursePublishText: coursePublishText,
            resolveCourseState: resolveCourseState,
            stateTagType: stateTagType,
            coverStyle: coverStyle,
            loadCourses: loadCourses,
            handleSearch: handleSearch,
            resetFilters: resetFilters,
            detail: detail,
            learn: learn,
            handlePrimaryAction: handlePrimaryAction,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
