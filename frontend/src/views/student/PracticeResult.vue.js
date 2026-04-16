import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { addWrongQuestionApi, addWrongQuestionsFromRecordApi, getPracticeResultApi } from '@/api/practice';
const route = useRoute();
const router = useRouter();
const result = ref(null);
const addingQuestionIds = ref([]);
const addingAllWrongQuestions = ref(false);
const practiceRecordId = computed(() => {
    const value = Number(route.query.recordId);
    return Number.isFinite(value) && value > 0 ? value : undefined;
});
const isFinalExam = computed(() => result.value?.practiceType === 'FINAL_EXAM');
const accuracyRate = computed(() => {
    if (!result.value?.totalCount) {
        return 0;
    }
    return Math.round((result.value.correctCount / result.value.totalCount) * 100);
});
const wrongAnswers = computed(() => (result.value?.answers || []).filter(item => !item.isCorrect));
const canAddAnyWrongQuestion = computed(() => wrongAnswers.value.some(item => item.inWrongBook !== 1));
const resultSummaryText = computed(() => {
    if (!result.value) {
        return '';
    }
    if (accuracyRate.value >= 90) {
        return `本次完成 ${result.value.correctCount} 题正确，用时 ${formatSeconds(result.value.usedSeconds)}。`;
    }
    if (accuracyRate.value >= 60) {
        return `本次已提交完成，错题 ${result.value.wrongCount} 题，可在下方查看答案并决定是否加入错题本。`;
    }
    return '本次作答已结束，建议先复盘错题，再回到课程中继续学习。';
});
const formatSeconds = (seconds = 0) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
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
const updateWrongQuestionState = (questionIds) => {
    if (!result.value || !questionIds.length) {
        return;
    }
    result.value.answers = (result.value.answers || []).map(item => questionIds.includes(item.questionId)
        ? { ...item, inWrongBook: 1 }
        : item);
};
const loadResult = async () => {
    const raw = sessionStorage.getItem('practice_result');
    const cached = raw ? JSON.parse(raw) : null;
    if (cached) {
        result.value = cached;
    }
    if (!practiceRecordId.value) {
        return;
    }
    if (cached?.practiceRecordId === practiceRecordId.value) {
        return;
    }
    result.value = await getPracticeResultApi(practiceRecordId.value);
};
const addWrongQuestion = async (questionId) => {
    if (!questionId || addingQuestionIds.value.includes(questionId)) {
        return;
    }
    addingQuestionIds.value = [...addingQuestionIds.value, questionId];
    try {
        await addWrongQuestionApi(questionId);
        updateWrongQuestionState([questionId]);
        ElMessage.success('已加入错题本');
    }
    finally {
        addingQuestionIds.value = addingQuestionIds.value.filter(id => id !== questionId);
    }
};
const addAllWrongQuestions = async () => {
    if (!result.value?.practiceRecordId || !canAddAnyWrongQuestion.value || addingAllWrongQuestions.value) {
        return;
    }
    addingAllWrongQuestions.value = true;
    try {
        await addWrongQuestionsFromRecordApi(result.value.practiceRecordId);
        updateWrongQuestionState(wrongAnswers.value.map(item => item.questionId));
        ElMessage.success('错题已加入错题本');
    }
    finally {
        addingAllWrongQuestions.value = false;
    }
};
const goRecords = () => {
    router.push('/student/practice-records');
};
const goPracticeCenter = () => {
    router.push('/student/practices');
};
onMounted(loadResult);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['result-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "result-page" },
});
if (__VLS_ctx.result) {
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
    (__VLS_ctx.isFinalExam ? '期末考试结果' : '练习结果');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-desc" },
    });
    (__VLS_ctx.resultSummaryText);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-actions" },
    });
    const __VLS_0 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.goPracticeCenter)
    };
    __VLS_3.slots.default;
    var __VLS_3;
    const __VLS_8 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.goRecords)
    };
    __VLS_11.slots.default;
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "score-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "score-value" },
    });
    (__VLS_ctx.result.totalScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "score-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "overview-grid" },
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
    (__VLS_ctx.result.correctCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    (__VLS_ctx.result.wrongCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    (__VLS_ctx.accuracyRate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value small" },
    });
    (__VLS_ctx.formatSeconds(__VLS_ctx.result.usedSeconds));
}
if (__VLS_ctx.result && __VLS_ctx.isFinalExam) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ranking-grid" },
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
    (__VLS_ctx.result.myRank || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stat-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "value" },
    });
    (__VLS_ctx.result.rankingTotal || 0);
    const __VLS_16 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        data: (__VLS_ctx.result.topRanks || []),
        border: true,
        ...{ style: {} },
    }));
    const __VLS_18 = __VLS_17({
        data: (__VLS_ctx.result.topRanks || []),
        border: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        prop: "rank",
        label: "排名",
        width: "80",
    }));
    const __VLS_22 = __VLS_21({
        prop: "rank",
        label: "排名",
        width: "80",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        prop: "studentName",
        label: "学生",
        width: "160",
    }));
    const __VLS_26 = __VLS_25({
        prop: "studentName",
        label: "学生",
        width: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        prop: "score",
        label: "成绩",
        width: "100",
    }));
    const __VLS_30 = __VLS_29({
        prop: "score",
        label: "成绩",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        label: "用时",
        width: "120",
    }));
    const __VLS_34 = __VLS_33({
        label: "用时",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_35.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatSeconds(row.usedSeconds));
    }
    var __VLS_35;
    var __VLS_19;
}
if (__VLS_ctx.result && __VLS_ctx.wrongAnswers.length) {
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
    const __VLS_36 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        type: "warning",
        plain: true,
        disabled: (!__VLS_ctx.canAddAnyWrongQuestion || __VLS_ctx.addingAllWrongQuestions),
        loading: (__VLS_ctx.addingAllWrongQuestions),
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        type: "warning",
        plain: true,
        disabled: (!__VLS_ctx.canAddAnyWrongQuestion || __VLS_ctx.addingAllWrongQuestions),
        loading: (__VLS_ctx.addingAllWrongQuestions),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (__VLS_ctx.addAllWrongQuestions)
    };
    __VLS_39.slots.default;
    var __VLS_39;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "answer-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.wrongAnswers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.questionId),
            ...{ class: "answer-card wrong-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-index" },
        });
        (index + 1);
        const __VLS_44 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
            plain: true,
            disabled: (item.inWrongBook === 1 || __VLS_ctx.addingQuestionIds.includes(item.questionId)),
            loading: (__VLS_ctx.addingQuestionIds.includes(item.questionId)),
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
            plain: true,
            disabled: (item.inWrongBook === 1 || __VLS_ctx.addingQuestionIds.includes(item.questionId)),
            loading: (__VLS_ctx.addingQuestionIds.includes(item.questionId)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.result && __VLS_ctx.wrongAnswers.length))
                    return;
                __VLS_ctx.addWrongQuestion(item.questionId);
            }
        };
        __VLS_47.slots.default;
        (item.inWrongBook === 1 ? '已加入错题本' : '加入错题本');
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-type" },
        });
        (__VLS_ctx.typeText(item.type));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-stem" },
        });
        (item.stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block my-answer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (item.studentAnswer || '未作答');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block success-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (item.correctAnswer || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block analysis-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (item.analysis || '暂无解析');
    }
}
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "answer-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.result.answers || []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${item.questionId}-${index}`),
            ...{ class: "answer-card" },
            ...{ class: ({ 'wrong-card-lite': !item.isCorrect }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-index" },
        });
        (index + 1);
        const __VLS_52 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            type: (item.isCorrect ? 'success' : 'danger'),
        }));
        const __VLS_54 = __VLS_53({
            type: (item.isCorrect ? 'success' : 'danger'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        (item.isCorrect ? '答对' : '答错');
        var __VLS_55;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-type" },
        });
        (__VLS_ctx.typeText(item.type));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-stem" },
        });
        (item.stem);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-grid" },
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
        (item.studentAnswer || '未作答');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block success-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (item.correctAnswer || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-block analysis-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "answer-value" },
        });
        (item.analysis || '暂无解析');
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card" },
    });
    const __VLS_56 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        description: "未找到本次练习结果",
    }));
    const __VLS_58 = __VLS_57({
        description: "未找到本次练习结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
}
/** @type {__VLS_StyleScopedClasses['result-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['result-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['score-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['score-label']} */ ;
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
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['wrong-card']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-head']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-index']} */ ;
/** @type {__VLS_StyleScopedClasses['question-type']} */ ;
/** @type {__VLS_StyleScopedClasses['question-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['my-answer']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['success-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-head']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-index']} */ ;
/** @type {__VLS_StyleScopedClasses['question-type']} */ ;
/** @type {__VLS_StyleScopedClasses['question-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['success-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-block']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-block']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            result: result,
            addingQuestionIds: addingQuestionIds,
            addingAllWrongQuestions: addingAllWrongQuestions,
            isFinalExam: isFinalExam,
            accuracyRate: accuracyRate,
            wrongAnswers: wrongAnswers,
            canAddAnyWrongQuestion: canAddAnyWrongQuestion,
            resultSummaryText: resultSummaryText,
            formatSeconds: formatSeconds,
            typeText: typeText,
            addWrongQuestion: addWrongQuestion,
            addAllWrongQuestions: addAllWrongQuestions,
            goRecords: goRecords,
            goPracticeCenter: goPracticeCenter,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
