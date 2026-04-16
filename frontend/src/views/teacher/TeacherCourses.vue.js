import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTeacherCoursesApi, getTeacherCourseDetailApi, getTeacherCourseStudentsApi, saveCourseApi, submitCourseAuditApi } from '@/api/course';
import { getChaptersApi } from '@/api/chapter';
import { getResourceListByCourseApi } from '@/api/resource';
import { getAssignmentsApi } from '@/api/assignment';
import { getTeacherCourseApplicationsApi } from '@/api/enrollment';
import CourseDialog from '@/components/CourseDialog.vue';
const router = useRouter();
const params = reactive({
    current: 1,
    size: 8,
    keyword: ''
});
const list = reactive({
    total: 0,
    records: []
});
const visible = ref(false);
const form = reactive({
    id: undefined,
    categoryId: 1,
    title: '',
    description: '',
    coverUrl: '',
    tags: ''
});
const buildSummaryMap = reactive({});
const summaryLoadingMap = reactive({});
const applicationStatsMap = reactive({});
const studentCountMap = reactive({});
const totalPendingApplications = computed(() => Object.values(applicationStatsMap).reduce((sum, item) => sum + (item.pending || 0), 0));
const approvedCourseCount = computed(() => list.records.filter(item => item.status === 'APPROVED').length);
const totalJoinedStudents = computed(() => Object.values(studentCountMap).reduce((sum, count) => sum + (count || 0), 0));
const normalizeApplicationRows = (res) => {
    if (Array.isArray(res))
        return res;
    if (Array.isArray(res?.records))
        return res.records;
    if (Array.isArray(res?.data))
        return res.data;
    return [];
};
const isAuditReady = (summary) => !!summary?.titleReady && summary.chapterCount > 0 && summary.resourceCount > 0;
const resolvePhaseStatus = (row) => row.status === 'DRAFT' && isAuditReady(buildSummaryMap[row.id]) ? 'READY' : row.status;
const phaseStatusText = (status) => ({
    DRAFT: '待完善',
    READY: '待提审',
    REJECTED: '已驳回',
    PENDING: '审核中',
    APPROVED: '已发布'
}[status || ''] || '未定义');
const phaseTagType = (status) => ({
    DRAFT: 'info',
    READY: 'warning',
    REJECTED: 'danger',
    PENDING: 'warning',
    APPROVED: 'success'
}[status || ''] || 'info');
const nextStepText = (row) => ({
    DRAFT: '补齐章节与资源',
    READY: '提交课程审核',
    REJECTED: '修改后重新提交',
    PENDING: '等待管理员审核',
    APPROVED: '进入教学运行'
}[resolvePhaseStatus(row) || ''] || '查看课程');
const canSubmitAudit = (row) => row.status === 'DRAFT'
    ? isAuditReady(buildSummaryMap[row.id])
    : ['REJECTED', 'APPROVED'].includes(row.status || '');
const submitAuditText = (row) => ({
    DRAFT: '提交审核',
    REJECTED: '重新提交',
    APPROVED: '重新送审'
}[row.status || ''] || '提交审核');
const actionStatusText = (row) => {
    if (row.status === 'DRAFT') {
        return isAuditReady(buildSummaryMap[row.id]) ? '可提交审核' : '待完善';
    }
    if (row.status === 'PENDING')
        return '审核中';
    if (row.status === 'APPROVED')
        return '已发布';
    return row.status || '处理中';
};
const buildSummaryText = (summary) => {
    if (!summary)
        return '系统正在检查课程内容';
    if (summary.missingItems.length)
        return `还缺：${summary.missingItems.join('、')}`;
    return summary.assignmentCount > 0
        ? '内容完整，可进入课程运行'
        : '章节与资源已齐，可继续补充作业';
};
const fetchBuildSummary = async (row, force = false) => {
    if (!force && buildSummaryMap[row.id])
        return buildSummaryMap[row.id];
    summaryLoadingMap[row.id] = true;
    try {
        const [detail, chapters, groups, assignments] = await Promise.all([
            getTeacherCourseDetailApi(row.id),
            getChaptersApi(row.id),
            getResourceListByCourseApi(row.id),
            getAssignmentsApi(row.id)
        ]);
        const titleReady = !!String(detail.title || row.title || '').trim();
        const chapterCount = chapters.length;
        const resourceCount = groups.reduce((sum, item) => sum + (item.resources?.length || 0), 0);
        const assignmentCount = assignments.length;
        const missingItems = [];
        if (!titleReady)
            missingItems.push('课程标题');
        if (chapterCount < 1)
            missingItems.push('至少 1 个章节');
        if (resourceCount < 1)
            missingItems.push('至少 1 个资源');
        const completionPercent = Math.round(([titleReady, chapterCount > 0, resourceCount > 0].filter(Boolean).length / 3) * 100);
        const summary = {
            titleReady,
            chapterCount,
            resourceCount,
            assignmentCount,
            completionPercent,
            missingItems
        };
        buildSummaryMap[row.id] = summary;
        return summary;
    }
    finally {
        summaryLoadingMap[row.id] = false;
    }
};
const fetchRuntimeStats = async (courseId) => {
    const [applicationRes, studentsRes] = await Promise.all([
        getTeacherCourseApplicationsApi(courseId, { current: 1, size: 100 }),
        getTeacherCourseStudentsApi(courseId)
    ]);
    const rows = normalizeApplicationRows(applicationRes);
    applicationStatsMap[courseId] = {
        pending: rows.filter(item => item.status === 'PENDING').length,
        approved: rows.filter(item => item.status === 'APPROVED').length,
        rejected: rows.filter(item => item.status === 'REJECTED').length,
        total: rows.length
    };
    studentCountMap[courseId] = (studentsRes || []).length;
};
const load = async () => {
    Object.assign(list, await getTeacherCoursesApi(params));
    await Promise.all(list.records.map(async (row) => {
        await fetchBuildSummary(row, true);
        await fetchRuntimeStats(row.id);
    }));
};
const handleSearch = async () => {
    params.current = 1;
    await load();
};
const openCreate = () => {
    Object.assign(form, {
        id: undefined,
        categoryId: 1,
        title: '',
        description: '',
        coverUrl: '',
        tags: ''
    });
    visible.value = true;
};
const edit = (row) => {
    Object.assign(form, row);
    visible.value = true;
};
const save = async (payload) => {
    await saveCourseApi(payload);
    visible.value = false;
    ElMessage.success('课程已保存');
    await load();
};
const submitAudit = async (row) => {
    const summary = await fetchBuildSummary(row, true);
    if (!summary.titleReady) {
        ElMessage.warning('提交审核前请先填写课程标题');
        return;
    }
    if (summary.chapterCount < 1) {
        ElMessage.warning('提交审核前至少需要 1 个章节');
        return;
    }
    if (summary.resourceCount < 1) {
        ElMessage.warning('提交审核前至少需要 1 个资源');
        return;
    }
    if (row.status === 'APPROVED') {
        await ElMessageBox.confirm('当前课程已发布，重新提交后会再次进入审核流程，确认继续吗？', '重新提交审核', {
            type: 'warning',
            confirmButtonText: '继续提交',
            cancelButtonText: '取消'
        });
    }
    await submitCourseAuditApi(row.id);
    ElMessage.success('课程已提交审核');
    await load();
};
const content = (id) => {
    router.push(`/teacher/content/${id}`);
};
const resource = (id) => {
    router.push(`/teacher/resources/${id}`);
};
const students = (id) => {
    router.push(`/teacher/course-students/${id}`);
};
const gradebook = (id) => {
    router.push(`/teacher/course-gradebook/${id}`);
};
const applications = (id) => {
    router.push(`/teacher/applications/${id}`);
};
const showAuditStatus = async (row) => {
    await ElMessageBox.alert(row.auditReason || '课程正在审核中，请稍后查看结果。', '审核状态', {
        confirmButtonText: '知道了',
        type: 'info'
    });
};
const goNextStep = async (row) => {
    if (row.status === 'DRAFT' && isAuditReady(buildSummaryMap[row.id])) {
        await submitAudit(row);
        return;
    }
    if (applicationStatsMap[row.id]?.pending) {
        applications(row.id);
        return;
    }
    if (row.status === 'APPROVED') {
        students(row.id);
        return;
    }
    if (row.status === 'PENDING') {
        await showAuditStatus(row);
        return;
    }
    content(row.id);
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['teacher-course-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card dashboard-hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
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
    ...{ class: "page-actions" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程标题",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
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
    onChange: (__VLS_ctx.handleSearch)
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
    type: "primary",
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: (__VLS_ctx.openCreate)
};
__VLS_12.slots.default;
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "metric-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.list.total || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.totalPendingApplications);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.approvedCourseCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.totalJoinedStudents);
if (__VLS_ctx.list.records.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "course-grid teacher-course-grid" },
    });
    for (const [row] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (row.id),
            ...{ class: "course-card teacher-course-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-banner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "banner-title" },
        });
        (row.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "banner-sub" },
        });
        (row.categoryName || '未分类课程');
        const __VLS_17 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
            round: true,
            type: (__VLS_ctx.phaseTagType(__VLS_ctx.resolvePhaseStatus(row))),
        }));
        const __VLS_19 = __VLS_18({
            round: true,
            type: (__VLS_ctx.phaseTagType(__VLS_ctx.resolvePhaseStatus(row))),
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        __VLS_20.slots.default;
        (__VLS_ctx.phaseStatusText(__VLS_ctx.resolvePhaseStatus(row)));
        var __VLS_20;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "runtime-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "runtime-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.buildSummaryMap[row.id]?.completionPercent || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "runtime-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.applicationStatsMap[row.id]?.pending || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "runtime-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.applicationStatsMap[row.id]?.approved || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "runtime-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.studentCountMap[row.id] || 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "progress-panel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "progress-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.nextStepText(row));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.buildSummaryMap[row.id]?.completionPercent || 0);
        const __VLS_21 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
            percentage: (__VLS_ctx.buildSummaryMap[row.id]?.completionPercent || 0),
            strokeWidth: (8),
            showText: (false),
        }));
        const __VLS_23 = __VLS_22({
            percentage: (__VLS_ctx.buildSummaryMap[row.id]?.completionPercent || 0),
            strokeWidth: (8),
            showText: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
        (__VLS_ctx.buildSummaryText(__VLS_ctx.buildSummaryMap[row.id]));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "status-row" },
        });
        if (__VLS_ctx.applicationStatsMap[row.id]?.pending) {
            const __VLS_25 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
                type: "warning",
                round: true,
            }));
            const __VLS_27 = __VLS_26({
                type: "warning",
                round: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_26));
            __VLS_28.slots.default;
            (__VLS_ctx.applicationStatsMap[row.id]?.pending);
            var __VLS_28;
        }
        if (row.auditReason) {
            const __VLS_29 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
                type: "danger",
                round: true,
            }));
            const __VLS_31 = __VLS_30({
                type: "danger",
                round: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            __VLS_32.slots.default;
            var __VLS_32;
        }
        const __VLS_33 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            round: true,
            effect: "plain",
        }));
        const __VLS_35 = __VLS_34({
            round: true,
            effect: "plain",
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        __VLS_36.slots.default;
        (__VLS_ctx.buildSummaryMap[row.id]?.chapterCount || 0);
        (__VLS_ctx.buildSummaryMap[row.id]?.resourceCount || 0);
        var __VLS_36;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
        const __VLS_37 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_39 = __VLS_38({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_41;
        let __VLS_42;
        let __VLS_43;
        const __VLS_44 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.edit(row);
            }
        };
        __VLS_40.slots.default;
        var __VLS_40;
        const __VLS_45 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_47 = __VLS_46({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        let __VLS_49;
        let __VLS_50;
        let __VLS_51;
        const __VLS_52 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.content(row.id);
            }
        };
        __VLS_48.slots.default;
        var __VLS_48;
        const __VLS_53 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_55 = __VLS_54({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_57;
        let __VLS_58;
        let __VLS_59;
        const __VLS_60 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.resource(row.id);
            }
        };
        __VLS_56.slots.default;
        var __VLS_56;
        const __VLS_61 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_63 = __VLS_62({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        let __VLS_65;
        let __VLS_66;
        let __VLS_67;
        const __VLS_68 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.students(row.id);
            }
        };
        __VLS_64.slots.default;
        var __VLS_64;
        const __VLS_69 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_71 = __VLS_70({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        let __VLS_73;
        let __VLS_74;
        let __VLS_75;
        const __VLS_76 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.gradebook(row.id);
            }
        };
        __VLS_72.slots.default;
        var __VLS_72;
        const __VLS_77 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_81;
        let __VLS_82;
        let __VLS_83;
        const __VLS_84 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.applications(row.id);
            }
        };
        __VLS_80.slots.default;
        var __VLS_80;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
        if (__VLS_ctx.canSubmitAudit(row)) {
            const __VLS_85 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                ...{ 'onClick': {} },
                type: "primary",
                plain: true,
            }));
            const __VLS_87 = __VLS_86({
                ...{ 'onClick': {} },
                type: "primary",
                plain: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            let __VLS_89;
            let __VLS_90;
            let __VLS_91;
            const __VLS_92 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.list.records.length))
                        return;
                    if (!(__VLS_ctx.canSubmitAudit(row)))
                        return;
                    __VLS_ctx.submitAudit(row);
                }
            };
            __VLS_88.slots.default;
            (__VLS_ctx.submitAuditText(row));
            var __VLS_88;
        }
        else {
            const __VLS_93 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
                plain: true,
                disabled: true,
            }));
            const __VLS_95 = __VLS_94({
                plain: true,
                disabled: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_94));
            __VLS_96.slots.default;
            (__VLS_ctx.actionStatusText(row));
            var __VLS_96;
        }
        const __VLS_97 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            ...{ 'onClick': {} },
            plain: true,
        }));
        const __VLS_99 = __VLS_98({
            ...{ 'onClick': {} },
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        let __VLS_101;
        let __VLS_102;
        let __VLS_103;
        const __VLS_104 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records.length))
                    return;
                __VLS_ctx.goNextStep(row);
            }
        };
        __VLS_100.slots.default;
        var __VLS_100;
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
const __VLS_105 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_107 = __VLS_106({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_109;
let __VLS_110;
let __VLS_111;
const __VLS_112 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_108;
/** @type {[typeof CourseDialog, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(CourseDialog, new CourseDialog({
    ...{ 'onSubmit': {} },
    modelValue: (__VLS_ctx.visible),
    form: (__VLS_ctx.form),
}));
const __VLS_114 = __VLS_113({
    ...{ 'onSubmit': {} },
    modelValue: (__VLS_ctx.visible),
    form: (__VLS_ctx.form),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onSubmit: (__VLS_ctx.save)
};
var __VLS_115;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['course-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['teacher-course-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['course-card']} */ ;
/** @type {__VLS_StyleScopedClasses['teacher-course-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['banner-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['runtime-item']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-top']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['status-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CourseDialog: CourseDialog,
            params: params,
            list: list,
            visible: visible,
            form: form,
            buildSummaryMap: buildSummaryMap,
            applicationStatsMap: applicationStatsMap,
            studentCountMap: studentCountMap,
            totalPendingApplications: totalPendingApplications,
            approvedCourseCount: approvedCourseCount,
            totalJoinedStudents: totalJoinedStudents,
            resolvePhaseStatus: resolvePhaseStatus,
            phaseStatusText: phaseStatusText,
            phaseTagType: phaseTagType,
            nextStepText: nextStepText,
            canSubmitAudit: canSubmitAudit,
            submitAuditText: submitAuditText,
            actionStatusText: actionStatusText,
            buildSummaryText: buildSummaryText,
            load: load,
            handleSearch: handleSearch,
            openCreate: openCreate,
            edit: edit,
            save: save,
            submitAudit: submitAudit,
            content: content,
            resource: resource,
            students: students,
            gradebook: gradebook,
            applications: applications,
            goNextStep: goNextStep,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
