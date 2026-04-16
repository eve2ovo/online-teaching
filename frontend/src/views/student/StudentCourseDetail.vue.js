import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCourseDetailApi } from '@/api/course';
import { getChaptersApi } from '@/api/chapter';
import { getCourseStudyProgressApi } from '@/api/progress';
import { applyEnrollmentApi, getMyCourseApplicationStatusApi } from '@/api/enrollment';
const route = useRoute();
const router = useRouter();
const courseId = computed(() => Number(route.params.id));
const course = reactive({
    id: 0,
    teacherId: 0,
    title: '',
    status: ''
});
const chapters = ref([]);
const progress = ref(null);
const applicationStatus = reactive({
    courseId: 0,
    applicationId: null,
    applicationStatus: null,
    learningStatus: 'NOT_JOINED',
    canApply: true,
    canReapply: false,
    canEnterLearning: false,
    applyReason: null,
    reviewRemark: null,
    appliedAt: null,
    reviewedAt: null
});
const teacherDisplayName = computed(() => String(course.teacherName || course.teacherNickname || course.teacherRealName || '').trim() ||
    (course.teacherId ? `教师 #${course.teacherId}` : '课程教师'));
const canEnterLearning = computed(() => applicationStatus.canEnterLearning || applicationStatus.applicationStatus === 'APPROVED');
const canReapply = computed(() => applicationStatus.canReapply ||
    applicationStatus.applicationStatus === 'REJECTED' ||
    applicationStatus.applicationStatus === 'REMOVED' ||
    applicationStatus.applicationStatus === 'CANCELLED');
const applicationStatusText = computed(() => {
    if (canEnterLearning.value)
        return '已加入';
    if (applicationStatus.applicationStatus === 'PENDING')
        return '待审核';
    if (applicationStatus.applicationStatus === 'REJECTED')
        return '已拒绝';
    if (applicationStatus.applicationStatus === 'REMOVED')
        return '已被移出';
    if (applicationStatus.applicationStatus === 'CANCELLED')
        return '已退出';
    return '未申请';
});
const applicationTagType = computed(() => {
    if (canEnterLearning.value)
        return 'success';
    if (applicationStatus.applicationStatus === 'PENDING')
        return 'warning';
    if (applicationStatus.applicationStatus === 'REJECTED')
        return 'danger';
    return 'info';
});
const statusDescription = computed(() => {
    if (canEnterLearning.value) {
        return '审核通过，可进入课程学习。';
    }
    if (applicationStatus.applicationStatus === 'PENDING') {
        return '申请已提交，等待老师审核。';
    }
    if (applicationStatus.applicationStatus === 'REJECTED') {
        return applicationStatus.reviewRemark || '申请未通过，可修改后重新申请。';
    }
    if (applicationStatus.applicationStatus === 'REMOVED') {
        return applicationStatus.reviewRemark || '你已被老师移出课程，可重新申请。';
    }
    if (applicationStatus.applicationStatus === 'CANCELLED') {
        return '你已退出该课程，可重新申请。';
    }
    return '提交申请后由老师审核。';
});
const primaryActionText = computed(() => {
    if (canEnterLearning.value)
        return '进入学习';
    if (applicationStatus.applicationStatus === 'PENDING')
        return '待审核';
    if (canReapply.value)
        return '重新申请';
    return '申请选课';
});
const primaryActionType = computed(() => {
    if (canEnterLearning.value)
        return 'success';
    if (applicationStatus.applicationStatus === 'PENDING')
        return 'info';
    return 'primary';
});
const primaryActionDisabled = computed(() => applicationStatus.applicationStatus === 'PENDING');
const progressText = computed(() => (canEnterLearning.value ? `${progress.value?.progressPercent || 0}%` : '待加入'));
const reviewBoxClass = computed(() => applicationStatus.applicationStatus === 'REJECTED' ? 'danger' : 'info');
const splitTags = (value) => {
    if (!value)
        return [];
    return value
        .split(/[，、,\s]+/)
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 5);
};
const coursePublishText = (status) => ({
    DRAFT: '草稿',
    PENDING: '待发布',
    APPROVED: '已发布',
    REJECTED: '已驳回'
}[status || ''] || '已发布');
const formatTime = (value) => {
    if (!value) {
        return '暂无';
    }
    return value.replace('T', ' ').slice(0, 16);
};
const loadProgressIfNeeded = async () => {
    if (!canEnterLearning.value) {
        progress.value = null;
        return;
    }
    try {
        progress.value = await getCourseStudyProgressApi(courseId.value);
    }
    catch {
        progress.value = null;
    }
};
const load = async () => {
    const [courseRes, chapterRes, statusRes] = await Promise.all([
        getCourseDetailApi(courseId.value),
        getChaptersApi(courseId.value),
        getMyCourseApplicationStatusApi(courseId.value)
    ]);
    Object.assign(course, courseRes);
    chapters.value = chapterRes || [];
    Object.assign(applicationStatus, statusRes);
    await loadProgressIfNeeded();
};
const goBack = () => {
    router.push('/student/home');
};
const goLearn = () => {
    if (!canEnterLearning.value) {
        ElMessage.warning('当前还不能进入学习');
        return;
    }
    router.push(`/student/learn/${courseId.value}`);
};
const handleApply = async () => {
    try {
        const title = canReapply.value ? '重新申请选课' : '申请选课';
        const { value } = await ElMessageBox.prompt('可填写申请说明，帮助老师更快了解你的学习诉求。', title, {
            confirmButtonText: '提交申请',
            cancelButtonText: '取消',
            inputValue: '',
            inputPlaceholder: '申请说明（选填）'
        });
        await applyEnrollmentApi(courseId.value, {
            applyReason: value?.trim() || undefined
        });
        ElMessage.success('申请已提交');
        await load();
    }
    catch {
        // ignore cancel
    }
};
const handlePrimaryAction = async () => {
    if (canEnterLearning.value) {
        goLearn();
        return;
    }
    if (!applicationStatus.applicationStatus || canReapply.value || applicationStatus.canApply) {
        await handleApply();
    }
};
watch(courseId, load);
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['review-box']} */ ;
/** @type {__VLS_StyleScopedClasses['review-box']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card detail-hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-title" },
});
(__VLS_ctx.course.title || '课程详情');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-desc" },
});
(__VLS_ctx.course.description || '暂无课程简介');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-tags" },
});
const __VLS_0 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    round: true,
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    round: true,
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.course.categoryName || '综合课程');
var __VLS_3;
const __VLS_4 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    round: true,
}));
const __VLS_6 = __VLS_5({
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
(__VLS_ctx.coursePublishText(__VLS_ctx.course.status));
var __VLS_7;
const __VLS_8 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    round: true,
    type: (__VLS_ctx.applicationTagType),
}));
const __VLS_10 = __VLS_9({
    round: true,
    type: (__VLS_ctx.applicationTagType),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
(__VLS_ctx.applicationStatusText);
var __VLS_11;
for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.splitTags(__VLS_ctx.course.tags)))) {
    const __VLS_12 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (tag),
        round: true,
        effect: "plain",
    }));
    const __VLS_14 = __VLS_13({
        key: (tag),
        round: true,
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (tag);
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-value" },
});
(__VLS_ctx.applicationStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-desc" },
});
(__VLS_ctx.statusDescription);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-actions" },
});
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
    onClick: (__VLS_ctx.goBack)
};
__VLS_19.slots.default;
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.primaryActionType),
    disabled: (__VLS_ctx.primaryActionDisabled),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.primaryActionType),
    disabled: (__VLS_ctx.primaryActionDisabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.handlePrimaryAction)
};
__VLS_27.slots.default;
(__VLS_ctx.primaryActionText);
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "detail-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card content-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title inner-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-paragraph" },
});
(__VLS_ctx.course.description || '暂无课程介绍');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.teacherDisplayName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.course.id || '-');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.chapters.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.progressText);
if (__VLS_ctx.applicationStatus.reviewRemark) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "review-box" },
        ...{ class: (__VLS_ctx.reviewBoxClass) },
    });
    (__VLS_ctx.applicationStatus.reviewRemark);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card sidebar-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title inner-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.applicationStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.formatTime(__VLS_ctx.applicationStatus.appliedAt));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.formatTime(__VLS_ctx.applicationStatus.reviewedAt));
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    ...{ class: "wide-button" },
    type: (__VLS_ctx.primaryActionType),
    disabled: (__VLS_ctx.primaryActionDisabled),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    ...{ class: "wide-button" },
    type: (__VLS_ctx.primaryActionType),
    disabled: (__VLS_ctx.primaryActionDisabled),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handlePrimaryAction)
};
__VLS_35.slots.default;
(__VLS_ctx.primaryActionText);
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "split-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title inner-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chapter-pill" },
});
(__VLS_ctx.chapters.length);
if (__VLS_ctx.chapters.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chapter-list" },
    });
    for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.chapters))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (chapter.id),
            ...{ class: "chapter-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-index" },
        });
        (chapter.sortNo);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-title" },
        });
        (chapter.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
    }
}
else {
    const __VLS_40 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        description: "当前课程暂无章节内容",
    }));
    const __VLS_42 = __VLS_41({
        description: "当前课程暂无章节内容",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
}
/** @type {__VLS_StyleScopedClasses['detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-value']} */ ;
/** @type {__VLS_StyleScopedClasses['status-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['content-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['content-paragraph']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['review-box']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-list']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['wide-button']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-list']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-index']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            course: course,
            chapters: chapters,
            applicationStatus: applicationStatus,
            teacherDisplayName: teacherDisplayName,
            applicationStatusText: applicationStatusText,
            applicationTagType: applicationTagType,
            statusDescription: statusDescription,
            primaryActionText: primaryActionText,
            primaryActionType: primaryActionType,
            primaryActionDisabled: primaryActionDisabled,
            progressText: progressText,
            reviewBoxClass: reviewBoxClass,
            splitTags: splitTags,
            coursePublishText: coursePublishText,
            formatTime: formatTime,
            goBack: goBack,
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
