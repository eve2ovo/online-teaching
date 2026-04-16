import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTeacherCourseStudentsApi, removeTeacherCourseStudentApi } from '@/api/course';
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const keyword = ref('');
const students = ref([]);
const removingStudentId = ref(null);
const averageProgress = computed(() => {
    if (!students.value.length) {
        return 0;
    }
    const total = students.value.reduce((sum, item) => sum + (item.progressPercent || 0), 0);
    return Math.round(total / students.value.length);
});
const averageAssignmentCompletion = computed(() => {
    if (!students.value.length) {
        return 0;
    }
    const total = students.value.reduce((sum, item) => sum + Number(item.assignmentCompletionRate || 0), 0);
    return Math.round(total / students.value.length);
});
const averagePracticeScore = computed(() => {
    const scored = students.value.filter(item => Number(item.averagePracticeScore || 0) > 0);
    if (!scored.length) {
        return '0.00';
    }
    const total = scored.reduce((sum, item) => sum + Number(item.averagePracticeScore || 0), 0);
    return (total / scored.length).toFixed(2);
});
const formatTime = (value) => {
    if (!value) {
        return '暂无';
    }
    return value.replace('T', ' ').slice(0, 16);
};
const formatScore = (value) => Number(value || 0).toFixed(2);
const load = async () => {
    students.value = await getTeacherCourseStudentsApi(courseId, {
        keyword: keyword.value || undefined
    });
};
const removeStudent = async (student) => {
    const displayName = student.nickname || student.username;
    try {
        const { value } = await ElMessageBox.prompt(`确认将“${displayName}”移出课程吗？移出后该学生将无法继续进入本课程学习。`, '移出课程', {
            confirmButtonText: '确认移出',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入移出原因',
            inputValidator: (input) => !!input?.trim() || '请输入移出原因',
            inputType: 'textarea'
        });
        removingStudentId.value = student.studentId;
        await removeTeacherCourseStudentApi(courseId, student.studentId, {
            reviewRemark: value.trim()
        });
        ElMessage.success('已将该学生移出课程');
        await load();
    }
    catch {
        // ignore cancel
    }
    finally {
        removingStudentId.value = null;
    }
};
const goBack = () => {
    router.push('/teacher/courses');
};
const goGradebook = () => {
    router.push(`/teacher/course-gradebook/${courseId}`);
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-4']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-4']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "student-page" },
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
    ...{ class: "toolbar" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索昵称、账号、邮箱或手机号",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索昵称、账号、邮箱或手机号",
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
    onClick: (__VLS_ctx.goGradebook)
};
__VLS_12.slots.default;
var __VLS_12;
const __VLS_17 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_19 = __VLS_18({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_20.slots.default;
var __VLS_20;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.students.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.averageProgress);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.averageAssignmentCompletion);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.averagePracticeScore);
if (__VLS_ctx.students.length) {
    const __VLS_25 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        data: (__VLS_ctx.students),
        border: true,
        ...{ style: {} },
    }));
    const __VLS_27 = __VLS_26({
        data: (__VLS_ctx.students),
        border: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    const __VLS_29 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        label: "学生信息",
        minWidth: "220",
    }));
    const __VLS_31 = __VLS_30({
        label: "学生信息",
        minWidth: "220",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_32.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-name" },
        });
        (row.nickname || row.username);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.username);
        if (row.email) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "student-sub" },
            });
            (row.email);
        }
        if (row.phone) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "student-sub" },
            });
            (row.phone);
        }
    }
    var __VLS_32;
    const __VLS_33 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        label: "选课信息",
        minWidth: "170",
    }));
    const __VLS_35 = __VLS_34({
        label: "选课信息",
        minWidth: "170",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_36.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatTime(row.enrolledAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.majorDirection || '未填写');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.interestTags || '未填写');
    }
    var __VLS_36;
    const __VLS_37 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        label: "学习进度",
        minWidth: "220",
    }));
    const __VLS_39 = __VLS_38({
        label: "学习进度",
        minWidth: "220",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_40.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.progressPercent);
        const __VLS_41 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            percentage: (row.progressPercent),
            strokeWidth: (8),
        }));
        const __VLS_43 = __VLS_42({
            percentage: (row.progressPercent),
            strokeWidth: (8),
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.completedResources);
        (row.totalResources);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatTime(row.lastLearnedAt));
    }
    var __VLS_40;
    const __VLS_45 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        label: "作业情况",
        minWidth: "180",
    }));
    const __VLS_47 = __VLS_46({
        label: "作业情况",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_48.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.submittedAssignmentCount);
        (row.assignmentCount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatScore(row.averageAssignmentScore));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatTime(row.lastAssignmentSubmitTime));
    }
    var __VLS_48;
    const __VLS_49 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        label: "练习情况",
        minWidth: "180",
    }));
    const __VLS_51 = __VLS_50({
        label: "练习情况",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_52.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.submittedPracticeCount);
        (row.practiceSetCount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatScore(row.averagePracticeScore));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatTime(row.lastPracticeSubmitTime));
    }
    var __VLS_52;
    const __VLS_53 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        label: "操作",
        width: "140",
        fixed: "right",
    }));
    const __VLS_55 = __VLS_54({
        label: "操作",
        width: "140",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_56.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_57 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
            loading: (__VLS_ctx.removingStudentId === row.studentId),
        }));
        const __VLS_59 = __VLS_58({
            ...{ 'onClick': {} },
            link: true,
            type: "danger",
            loading: (__VLS_ctx.removingStudentId === row.studentId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        let __VLS_61;
        let __VLS_62;
        let __VLS_63;
        const __VLS_64 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.students.length))
                    return;
                __VLS_ctx.removeStudent(row);
            }
        };
        __VLS_60.slots.default;
        var __VLS_60;
    }
    var __VLS_56;
    var __VLS_28;
}
else {
    const __VLS_65 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        description: "当前课程还没有已加入的学生，或没有符合条件的搜索结果。",
    }));
    const __VLS_67 = __VLS_66({
        description: "当前课程还没有已加入的学生，或没有符合条件的搜索结果。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
}
/** @type {__VLS_StyleScopedClasses['student-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-4']} */ ;
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
/** @type {__VLS_StyleScopedClasses['student-name']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            keyword: keyword,
            students: students,
            removingStudentId: removingStudentId,
            averageProgress: averageProgress,
            averageAssignmentCompletion: averageAssignmentCompletion,
            averagePracticeScore: averagePracticeScore,
            formatTime: formatTime,
            formatScore: formatScore,
            load: load,
            removeStudent: removeStudent,
            goBack: goBack,
            goGradebook: goGradebook,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
