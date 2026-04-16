import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTeacherCourseStudentsApi, getTeacherCoursesApi } from '@/api/course';
import { approveCourseApplicationApi, getTeacherCourseApplicationsApi, rejectCourseApplicationApi } from '@/api/enrollment';
const route = useRoute();
const router = useRouter();
const teacherCourses = ref([]);
const selectedCourseId = ref(undefined);
const joinedStudentCount = ref(0);
const params = reactive({
    current: 1,
    size: 10,
    keyword: '',
    status: undefined
});
const applicationList = reactive({
    records: [],
    total: 0,
    size: 10,
    current: 1,
    pages: 0
});
const statsMap = reactive({});
const selectedStats = computed(() => statsMap[selectedCourseId.value || 0] || { pending: 0, approved: 0, rejected: 0 });
const selectedCourseTitle = computed(() => teacherCourses.value.find(item => item.id === selectedCourseId.value)?.title || '请选择课程');
const normalizeCoursePage = (res) => {
    if (Array.isArray(res))
        return res;
    if (Array.isArray(res?.records))
        return res.records;
    if (Array.isArray(res?.data))
        return res.data;
    return [];
};
const normalizeApplicationPage = (res) => {
    if (res?.records) {
        return res;
    }
    return {
        records: [],
        total: 0,
        size: params.size,
        current: params.current,
        pages: 0
    };
};
const formatTime = (value) => {
    if (!value)
        return '--';
    return value.replace('T', ' ').slice(0, 16);
};
const statusText = (status) => ({
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
}[status || ''] || status || '--');
const statusTagType = (status) => ({
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
}[status || ''] || 'info');
const loadCourseStats = async (courseId) => {
    const res = await getTeacherCourseApplicationsApi(courseId, {
        current: 1,
        size: 100
    });
    const rows = normalizeApplicationPage(res).records;
    statsMap[courseId] = {
        pending: rows.filter(item => item.status === 'PENDING').length,
        approved: rows.filter(item => item.status === 'APPROVED').length,
        rejected: rows.filter(item => item.status === 'REJECTED').length
    };
};
const loadApplications = async () => {
    if (!selectedCourseId.value) {
        Object.assign(applicationList, {
            records: [],
            total: 0,
            size: params.size,
            current: params.current,
            pages: 0
        });
        joinedStudentCount.value = 0;
        return;
    }
    const [applicationRes, studentsRes] = await Promise.all([
        getTeacherCourseApplicationsApi(selectedCourseId.value, params),
        getTeacherCourseStudentsApi(selectedCourseId.value)
    ]);
    Object.assign(applicationList, normalizeApplicationPage(applicationRes));
    joinedStudentCount.value = (studentsRes || []).length;
    await loadCourseStats(selectedCourseId.value);
};
const loadCourses = async () => {
    const res = await getTeacherCoursesApi({
        current: 1,
        size: 100,
        keyword: ''
    });
    teacherCourses.value = normalizeCoursePage(res);
    await Promise.all(teacherCourses.value.map(course => loadCourseStats(course.id)));
    const routeCourseId = Number(route.params.courseId);
    const targetCourseId = Number.isFinite(routeCourseId) && routeCourseId > 0
        ? routeCourseId
        : teacherCourses.value[0]?.id;
    selectedCourseId.value = targetCourseId;
};
const pickCourse = (courseId) => {
    selectedCourseId.value = courseId;
};
const handleCourseChange = async (courseId) => {
    selectedCourseId.value = courseId;
};
const approve = async (row) => {
    await ElMessageBox.confirm('确认通过这条选课申请吗？通过后学生将正式加入课程。', '通过申请', {
        type: 'warning',
        confirmButtonText: '确认通过',
        cancelButtonText: '取消'
    });
    await approveCourseApplicationApi(selectedCourseId.value, row.id, {});
    ElMessage.success('已通过申请');
    await loadApplications();
};
const reject = async (row) => {
    const { value } = await ElMessageBox.prompt('请填写拒绝原因', '拒绝申请', {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        inputPlaceholder: '拒绝原因',
        inputValidator: (input) => !!input?.trim() || '请填写拒绝原因'
    });
    await rejectCourseApplicationApi(selectedCourseId.value, row.id, {
        reviewRemark: value.trim()
    });
    ElMessage.success('已拒绝申请');
    await loadApplications();
};
watch(selectedCourseId, async (value) => {
    if (!value)
        return;
    params.current = 1;
    router.replace(`/teacher/applications/${value}`);
    await loadApplications();
});
watch(() => route.params.courseId, (value) => {
    const nextId = Number(value);
    if (Number.isFinite(nextId) && nextId > 0 && nextId !== selectedCourseId.value) {
        selectedCourseId.value = nextId;
    }
});
onMounted(async () => {
    await loadCourses();
    await loadApplications();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['course-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['course-tab']} */ ;
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
const __VLS_0 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCourseId),
    placeholder: "选择课程",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedCourseId),
    placeholder: "选择课程",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.handleCourseChange)
};
__VLS_3.slots.default;
for (const [course] of __VLS_getVForSourceType((__VLS_ctx.teacherCourses))) {
    const __VLS_8 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }));
    const __VLS_10 = __VLS_9({
        key: (course.id),
        label: (course.title),
        value: (course.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_3;
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
(__VLS_ctx.selectedStats.pending);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.selectedStats.approved);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.selectedStats.rejected);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metric-value" },
});
(__VLS_ctx.joinedStudentCount);
if (__VLS_ctx.teacherCourses.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "course-tabs" },
    });
    for (const [course] of __VLS_getVForSourceType((__VLS_ctx.teacherCourses))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.teacherCourses.length))
                        return;
                    __VLS_ctx.pickCourse(course.id);
                } },
            key: (course.id),
            ...{ class: "course-tab" },
            ...{ class: ({ active: __VLS_ctx.selectedCourseId === course.id }) },
            type: "button",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tab-title" },
        });
        (course.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tab-count" },
        });
        (__VLS_ctx.statsMap[course.id]?.pending || 0);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "split-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
(__VLS_ctx.selectedCourseTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar" },
});
const __VLS_12 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onKeyup': {} },
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索学生昵称或账号",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    ...{ 'onKeyup': {} },
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索学生昵称或账号",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onKeyup: (__VLS_ctx.loadApplications)
};
const __VLS_20 = {
    onChange: (__VLS_ctx.loadApplications)
};
var __VLS_15;
const __VLS_21 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.status),
    placeholder: "状态筛选",
    clearable: true,
}));
const __VLS_23 = __VLS_22({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.status),
    placeholder: "状态筛选",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onChange: (__VLS_ctx.loadApplications)
};
__VLS_24.slots.default;
const __VLS_29 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    label: "待审核",
    value: "PENDING",
}));
const __VLS_31 = __VLS_30({
    label: "待审核",
    value: "PENDING",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const __VLS_33 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    label: "已通过",
    value: "APPROVED",
}));
const __VLS_35 = __VLS_34({
    label: "已通过",
    value: "APPROVED",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: "已拒绝",
    value: "REJECTED",
}));
const __VLS_39 = __VLS_38({
    label: "已拒绝",
    value: "REJECTED",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
var __VLS_24;
if (__VLS_ctx.selectedCourseId && __VLS_ctx.applicationList.records.length) {
    const __VLS_41 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        data: (__VLS_ctx.applicationList.records),
        border: true,
    }));
    const __VLS_43 = __VLS_42({
        data: (__VLS_ctx.applicationList.records),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    const __VLS_45 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        label: "学生信息",
        minWidth: "180",
    }));
    const __VLS_47 = __VLS_46({
        label: "学生信息",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_48.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-name" },
        });
        (row.studentNickname || row.studentUsername);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-sub" },
        });
        (row.studentUsername);
        if (row.studentEmail) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "student-sub" },
            });
            (row.studentEmail);
        }
    }
    var __VLS_48;
    const __VLS_49 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        label: "申请说明",
        minWidth: "220",
    }));
    const __VLS_51 = __VLS_50({
        label: "申请说明",
        minWidth: "220",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_52.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "application-text" },
        });
        (row.applyReason || '未填写申请说明');
    }
    var __VLS_52;
    const __VLS_53 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        label: "申请时间",
        width: "170",
    }));
    const __VLS_55 = __VLS_54({
        label: "申请时间",
        width: "170",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_56.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatTime(row.createdAt));
    }
    var __VLS_56;
    const __VLS_57 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        label: "状态",
        width: "110",
    }));
    const __VLS_59 = __VLS_58({
        label: "状态",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_60.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_61 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            round: true,
            type: (__VLS_ctx.statusTagType(row.status)),
        }));
        const __VLS_63 = __VLS_62({
            round: true,
            type: (__VLS_ctx.statusTagType(row.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        __VLS_64.slots.default;
        (__VLS_ctx.statusText(row.status));
        var __VLS_64;
    }
    var __VLS_60;
    const __VLS_65 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        label: "审核备注",
        minWidth: "180",
    }));
    const __VLS_67 = __VLS_66({
        label: "审核备注",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_68.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.reviewRemark || '--');
    }
    var __VLS_68;
    const __VLS_69 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        label: "操作",
        width: "180",
    }));
    const __VLS_71 = __VLS_70({
        label: "操作",
        width: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_72.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-actions" },
        });
        if (row.status === 'PENDING') {
            const __VLS_73 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
                ...{ 'onClick': {} },
                link: true,
                type: "success",
            }));
            const __VLS_75 = __VLS_74({
                ...{ 'onClick': {} },
                link: true,
                type: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_74));
            let __VLS_77;
            let __VLS_78;
            let __VLS_79;
            const __VLS_80 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCourseId && __VLS_ctx.applicationList.records.length))
                        return;
                    if (!(row.status === 'PENDING'))
                        return;
                    __VLS_ctx.approve(row);
                }
            };
            __VLS_76.slots.default;
            var __VLS_76;
            const __VLS_81 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
                ...{ 'onClick': {} },
                link: true,
                type: "danger",
            }));
            const __VLS_83 = __VLS_82({
                ...{ 'onClick': {} },
                link: true,
                type: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            let __VLS_85;
            let __VLS_86;
            let __VLS_87;
            const __VLS_88 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCourseId && __VLS_ctx.applicationList.records.length))
                        return;
                    if (!(row.status === 'PENDING'))
                        return;
                    __VLS_ctx.reject(row);
                }
            };
            __VLS_84.slots.default;
            var __VLS_84;
        }
        else {
            const __VLS_89 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
                link: true,
                disabled: true,
            }));
            const __VLS_91 = __VLS_90({
                link: true,
                disabled: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            __VLS_92.slots.default;
            (__VLS_ctx.statusText(row.status));
            var __VLS_92;
        }
    }
    var __VLS_72;
    var __VLS_44;
}
else {
    const __VLS_93 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        description: (__VLS_ctx.teacherCourses.length ? '当前筛选条件下暂无申请记录' : '你还没有可管理的课程'),
    }));
    const __VLS_95 = __VLS_94({
        description: (__VLS_ctx.teacherCourses.length ? '当前筛选条件下暂无申请记录' : '你还没有可管理的课程'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
}
if (__VLS_ctx.selectedCourseId) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-card" },
    });
    const __VLS_97 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.params.current),
        pageSize: (__VLS_ctx.params.size),
        background: true,
        layout: "total, prev, pager, next",
        total: (__VLS_ctx.applicationList.total || 0),
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.params.current),
        pageSize: (__VLS_ctx.params.size),
        background: true,
        layout: "total, prev, pager, next",
        total: (__VLS_ctx.applicationList.total || 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_101;
    let __VLS_102;
    let __VLS_103;
    const __VLS_104 = {
        onCurrentChange: (__VLS_ctx.loadApplications)
    };
    var __VLS_100;
}
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
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['course-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['course-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['student-name']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['student-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['application-text']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            teacherCourses: teacherCourses,
            selectedCourseId: selectedCourseId,
            joinedStudentCount: joinedStudentCount,
            params: params,
            applicationList: applicationList,
            statsMap: statsMap,
            selectedStats: selectedStats,
            selectedCourseTitle: selectedCourseTitle,
            formatTime: formatTime,
            statusText: statusText,
            statusTagType: statusTagType,
            loadApplications: loadApplications,
            pickCourse: pickCourse,
            handleCourseChange: handleCourseChange,
            approve: approve,
            reject: reject,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
