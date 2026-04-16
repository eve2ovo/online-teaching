import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { getMyStudyProgressApi } from '@/api/progress';
import { getMyApprovedCoursesApi } from '@/api/enrollment';
import { getStudentPracticeListApi } from '@/api/practice';
const router = useRouter();
const courseCards = ref([]);
const finalExamList = ref([]);
const finalExamDialogVisible = ref(false);
const finalExamLoading = ref(false);
const inProgressCount = computed(() => courseCards.value.filter(item => item.progressPercent > 0 && item.progressPercent < 100).length);
const completedCount = computed(() => courseCards.value.filter(item => item.progressPercent >= 100).length);
const finalExamCount = computed(() => finalExamList.value.length);
const finalExamGroups = computed(() => {
    const groups = new Map();
    finalExamList.value.forEach(exam => {
        const courseKey = exam.courseId ? String(exam.courseId) : `course-${exam.id}`;
        const current = groups.get(courseKey);
        if (current) {
            current.exams.push(exam);
            return;
        }
        groups.set(courseKey, {
            courseKey,
            courseName: exam.courseName || '未命名课程',
            exams: [exam]
        });
    });
    return Array.from(groups.values()).map(group => ({
        ...group,
        exams: [...group.exams].sort((left, right) => right.id - left.id)
    }));
});
const focusCourse = computed(() => {
    const rows = [...courseCards.value].sort((left, right) => {
        const leftTime = left.lastLearnedAt ? new Date(left.lastLearnedAt).getTime() : 0;
        const rightTime = right.lastLearnedAt ? new Date(right.lastLearnedAt).getTime() : 0;
        if (leftTime !== rightTime) {
            return rightTime - leftTime;
        }
        return right.progressPercent - left.progressPercent;
    });
    return rows[0] || null;
});
const buildFocusDescription = (course) => {
    if (course.progressPercent >= 100) {
        return '课程已完成，可以继续回顾重点章节。';
    }
    if (course.progressPercent > 0) {
        return `已完成 ${course.completedResources} 个资源，继续保持当前学习节奏。`;
    }
    return '课程已加入，准备开始第一段学习。';
};
const formatTime = (value) => {
    if (!value) {
        return '暂无';
    }
    return value.replace('T', ' ').slice(0, 16);
};
const learningStatusText = (progressPercent = 0) => {
    if (progressPercent >= 100)
        return '已完成';
    if (progressPercent > 0)
        return '学习中';
    return '待开始';
};
const progressTagType = (progressPercent = 0) => {
    if (progressPercent >= 100)
        return 'success';
    if (progressPercent > 0)
        return 'primary';
    return 'info';
};
const loadFinalExamList = async () => {
    finalExamLoading.value = true;
    try {
        const size = 200;
        const firstPage = await getStudentPracticeListApi({
            current: 1,
            size,
            type: 'FINAL_EXAM'
        });
        const records = [...(firstPage.records || [])];
        const total = firstPage.total || 0;
        const totalPages = firstPage.pages || Math.ceil(total / size);
        if (totalPages > 1) {
            const restPages = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => getStudentPracticeListApi({
                current: index + 2,
                size,
                type: 'FINAL_EXAM'
            })));
            restPages.forEach(page => {
                records.push(...(page.records || []));
            });
        }
        finalExamList.value = records;
    }
    finally {
        finalExamLoading.value = false;
    }
};
const load = async () => {
    const [courseRes, progressRes] = await Promise.all([
        getMyApprovedCoursesApi(),
        getMyStudyProgressApi(),
        loadFinalExamList()
    ]);
    const progressMap = new Map((progressRes || []).map(item => [item.courseId, item]));
    courseCards.value = (courseRes || []).map(item => {
        const progress = progressMap.get(item.id);
        return {
            ...item,
            progressPercent: progress?.progressPercent || 0,
            completedResources: progress?.completedResources || 0,
            totalResources: progress?.totalResources || 0,
            lastLearnedAt: progress?.lastLearnedAt || null
        };
    });
};
const detail = (id) => {
    router.push(`/student/course/${id}`);
};
const learn = (id) => {
    router.push(`/student/learn/${id}`);
};
const openFinalExamDialog = () => {
    finalExamDialogVisible.value = true;
};
const goFinalExam = async (exam) => {
    if (exam.submitted === 1 && exam.practiceRecordId) {
        finalExamDialogVisible.value = false;
        router.push(`/student/practice-result?recordId=${exam.practiceRecordId}`);
        return;
    }
    try {
        await ElMessageBox.confirm('确定参加考试？', '期末考试确认', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
        });
        finalExamDialogVisible.value = false;
        router.push(`/student/practice/${exam.id}`);
    }
    catch {
        // Keep the list dialog open when the student cancels.
    }
};
const finalExamDurationText = (durationMinutes) => {
    return durationMinutes ? `${durationMinutes} 分钟` : '不限时';
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat-button']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat-button']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-top']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-group']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-card']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['card-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "learning-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card learning-hero" },
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
    ...{ class: "hero-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.courseCards.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.inProgressCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.completedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openFinalExamDialog) },
    ...{ class: "hero-stat hero-stat-button" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.finalExamCount);
if (__VLS_ctx.focusCourse) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-card focus-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-title" },
    });
    (__VLS_ctx.focusCourse.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-desc" },
    });
    (__VLS_ctx.buildFocusDescription(__VLS_ctx.focusCourse));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.focusCourse.progressPercent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.focusCourse.completedResources);
    (__VLS_ctx.focusCourse.totalResources);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatTime(__VLS_ctx.focusCourse.lastLearnedAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "focus-actions" },
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
            if (!(__VLS_ctx.focusCourse))
                return;
            __VLS_ctx.learn(__VLS_ctx.focusCourse.id);
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
            if (!(__VLS_ctx.focusCourse))
                return;
            __VLS_ctx.detail(__VLS_ctx.focusCourse.id);
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
}
if (__VLS_ctx.courseCards.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "course-grid" },
    });
    for (const [row] of __VLS_getVForSourceType((__VLS_ctx.courseCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (row.id),
            ...{ class: "course-card learning-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "course-title" },
        });
        (row.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-subtitle" },
        });
        (row.categoryName || '综合课程');
        const __VLS_16 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            round: true,
            type: (__VLS_ctx.progressTagType(row.progressPercent)),
        }));
        const __VLS_18 = __VLS_17({
            round: true,
            type: (__VLS_ctx.progressTagType(row.progressPercent)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        (__VLS_ctx.learningStatusText(row.progressPercent));
        var __VLS_19;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "course-desc" },
        });
        (row.description || '暂无课程简介');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "progress-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "progress-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (row.progressPercent);
        const __VLS_20 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            percentage: (row.progressPercent),
            strokeWidth: (10),
            showText: (false),
        }));
        const __VLS_22 = __VLS_21({
            percentage: (row.progressPercent),
            strokeWidth: (10),
            showText: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.learningStatusText(row.progressPercent));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (row.completedResources);
        (row.totalResources);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.formatTime(row.lastLearnedAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
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
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.courseCards.length))
                    return;
                __VLS_ctx.learn(row.id);
            }
        };
        __VLS_27.slots.default;
        (row.progressPercent >= 100 ? '复习课程' : '进入学习');
        var __VLS_27;
        const __VLS_32 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            plain: true,
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.courseCards.length))
                    return;
                __VLS_ctx.detail(row.id);
            }
        };
        __VLS_35.slots.default;
        var __VLS_35;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-card empty-tip" },
    });
}
const __VLS_40 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.finalExamDialogVisible),
    title: "期末考试列表",
    width: "720px",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.finalExamDialogVisible),
    title: "期末考试列表",
    width: "720px",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "final-exam-dialog" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.finalExamLoading) }, null, null);
if (__VLS_ctx.finalExamGroups.length) {
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.finalExamGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (group.courseKey),
            ...{ class: "final-exam-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "final-exam-course" },
        });
        (group.courseName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "final-exam-list" },
        });
        for (const [exam] of __VLS_getVForSourceType((group.exams))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.finalExamGroups.length))
                            return;
                        __VLS_ctx.goFinalExam(exam);
                    } },
                key: (exam.id),
                ...{ class: "final-exam-item" },
                type: "button",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "final-exam-title" },
            });
            (exam.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "final-exam-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (exam.questionCount || 0);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.finalExamDurationText(exam.durationMinutes));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (exam.totalScore || 0);
        }
    }
}
else {
    const __VLS_44 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        description: "当前已选课程还没有已发布的期末考试",
    }));
    const __VLS_46 = __VLS_45({
        description: "当前已选课程还没有已发布的期末考试",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
var __VLS_43;
/** @type {__VLS_StyleScopedClasses['learning-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['learning-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stat-button']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-card']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-title']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['course-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['course-card']} */ ;
/** @type {__VLS_StyleScopedClasses['learning-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['course-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['course-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-block']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-top']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-group']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-course']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-list']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-item']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-title']} */ ;
/** @type {__VLS_StyleScopedClasses['final-exam-meta']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            courseCards: courseCards,
            finalExamDialogVisible: finalExamDialogVisible,
            finalExamLoading: finalExamLoading,
            inProgressCount: inProgressCount,
            completedCount: completedCount,
            finalExamCount: finalExamCount,
            finalExamGroups: finalExamGroups,
            focusCourse: focusCourse,
            buildFocusDescription: buildFocusDescription,
            formatTime: formatTime,
            learningStatusText: learningStatusText,
            progressTagType: progressTagType,
            detail: detail,
            learn: learn,
            openFinalExamDialog: openFinalExamDialog,
            goFinalExam: goFinalExam,
            finalExamDurationText: finalExamDurationText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
