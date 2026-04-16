import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeacherCourseGradebookApi } from '@/api/course';
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const keyword = ref('');
const gradebook = reactive({
    courseId,
    courseTitle: '',
    studentCount: 0,
    assignmentCount: 0,
    practiceSetCount: 0,
    averageProgressPercent: 0,
    assignmentCompletionRate: 0,
    practiceCompletionRate: 0,
    averageOverallScore: 0,
    students: []
});
const formatTime = (value) => {
    if (!value) {
        return '暂无';
    }
    return value.replace('T', ' ').slice(0, 16);
};
const formatScore = (value) => Number(value || 0).toFixed(2);
const load = async () => {
    const res = await getTeacherCourseGradebookApi(courseId, {
        keyword: keyword.value || undefined
    });
    Object.assign(gradebook, res);
};
const goStudents = () => {
    router.push(`/teacher/course-students/${courseId}`);
};
const goBack = () => {
    router.push('/teacher/courses');
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-5']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-5']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-5']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "gradebook-page" },
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
if (__VLS_ctx.gradebook.courseTitle) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "course-title" },
    });
    (__VLS_ctx.gradebook.courseTitle);
}
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
    onClick: (__VLS_ctx.goStudents)
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
    ...{ class: "grid-5" },
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
(__VLS_ctx.gradebook.studentCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.formatScore(__VLS_ctx.gradebook.averageOverallScore));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.gradebook.averageProgressPercent);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.gradebook.assignmentCompletionRate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.gradebook.practiceCompletionRate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.gradebook.assignmentCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.gradebook.practiceSetCount);
if (__VLS_ctx.gradebook.students.length) {
    const __VLS_25 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        data: (__VLS_ctx.gradebook.students),
        border: true,
        ...{ style: {} },
    }));
    const __VLS_27 = __VLS_26({
        data: (__VLS_ctx.gradebook.students),
        border: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    const __VLS_29 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        prop: "rank",
        label: "排名",
        width: "80",
    }));
    const __VLS_31 = __VLS_30({
        prop: "rank",
        label: "排名",
        width: "80",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    const __VLS_33 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        label: "学生信息",
        minWidth: "210",
    }));
    const __VLS_35 = __VLS_34({
        label: "学生信息",
        minWidth: "210",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_36.slots;
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
    }
    var __VLS_36;
    const __VLS_37 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        label: "学习情况",
        minWidth: "180",
    }));
    const __VLS_39 = __VLS_38({
        label: "学习情况",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_40.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.progressPercent);
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
    const __VLS_41 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        label: "作业成绩",
        minWidth: "180",
    }));
    const __VLS_43 = __VLS_42({
        label: "作业成绩",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_44.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.assignmentCompletionRate);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.submittedAssignmentCount);
        (row.assignmentCount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatScore(row.averageAssignmentScore));
    }
    var __VLS_44;
    const __VLS_45 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        label: "练习成绩",
        minWidth: "180",
    }));
    const __VLS_47 = __VLS_46({
        label: "练习成绩",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_48.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.practiceCompletionRate);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.submittedPracticeCount);
        (row.practiceSetCount);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatScore(row.averagePracticeScore));
    }
    var __VLS_48;
    const __VLS_49 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        label: "综合成绩",
        minWidth: "160",
    }));
    const __VLS_51 = __VLS_50({
        label: "综合成绩",
        minWidth: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_52.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "overall-score" },
        });
        (__VLS_ctx.formatScore(row.overallScore));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (__VLS_ctx.formatTime(row.enrolledAt));
    }
    var __VLS_52;
    var __VLS_28;
}
else {
    const __VLS_53 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        description: "当前课程暂无成绩汇总数据，可能还没有学生选课或尚未产生作业、练习成绩。",
    }));
    const __VLS_55 = __VLS_54({
        description: "当前课程暂无成绩汇总数据，可能还没有学生选课或尚未产生作业、练习成绩。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
}
/** @type {__VLS_StyleScopedClasses['gradebook-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['course-title']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-5']} */ ;
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
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
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
/** @type {__VLS_StyleScopedClasses['overall-score']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            keyword: keyword,
            gradebook: gradebook,
            formatTime: formatTime,
            formatScore: formatScore,
            load: load,
            goStudents: goStudents,
            goBack: goBack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
