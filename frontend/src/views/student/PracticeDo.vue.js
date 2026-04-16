import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPracticeQuestionsApi, submitPracticeApi } from '@/api/practice';
const router = useRouter();
const route = useRoute();
const practiceSetId = Number(route.params.id);
const questions = ref([]);
const currentIndex = ref(0);
const usedSeconds = ref(0);
let timer = null;
const answerMap = reactive({});
const multipleAnswerMap = reactive({});
const markedMap = reactive({});
const favoriteMap = reactive({});
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isAnswered = (questionId) => !!String(answerMap[questionId]?.studentAnswer || '').trim();
const answeredCount = computed(() => questions.value.filter(item => isAnswered(item.questionId)).length);
const markedCount = computed(() => questions.value.filter(item => !!answerMap[item.questionId]?.isMarked).length);
const unansweredCount = computed(() => Math.max(questions.value.length - answeredCount.value, 0));
const progressPercent = computed(() => {
    if (!questions.value.length) {
        return 0;
    }
    return Math.round((answeredCount.value / questions.value.length) * 100);
});
const currentQuestionStatus = computed(() => {
    const questionId = currentQuestion.value?.questionId;
    if (!questionId) {
        return '未开始';
    }
    if (answerMap[questionId]?.isMarked) {
        return '已标记';
    }
    return isAnswered(questionId) ? '已作答' : '未作答';
});
const initAnswerState = () => {
    questions.value.forEach((item) => {
        answerMap[item.questionId] = {
            questionId: item.questionId,
            studentAnswer: '',
            isMarked: 0,
            isFavorite: 0
        };
        multipleAnswerMap[item.questionId] = [];
        markedMap[item.questionId] = false;
        favoriteMap[item.questionId] = false;
    });
};
const load = async () => {
    try {
        const res = await getPracticeQuestionsApi(practiceSetId);
        questions.value = res || [];
        currentIndex.value = 0;
        usedSeconds.value = 0;
        initAnswerState();
    }
    catch {
        router.push('/student/practice-records');
    }
};
const onMultipleChange = (questionId) => {
    const list = multipleAnswerMap[questionId] || [];
    answerMap[questionId].studentAnswer = [...list].sort().join(',');
};
const syncMarked = (questionId) => {
    answerMap[questionId].isMarked = markedMap[questionId] ? 1 : 0;
};
const syncFavorite = (questionId) => {
    answerMap[questionId].isFavorite = favoriteMap[questionId] ? 1 : 0;
};
const prevQuestion = () => {
    if (currentIndex.value > 0)
        currentIndex.value--;
};
const nextQuestion = () => {
    if (currentIndex.value < questions.value.length - 1)
        currentIndex.value++;
};
const goQuestion = (index) => {
    currentIndex.value = index;
};
const cardStatusText = (questionId, index) => {
    if (currentIndex.value === index) {
        return '当前题';
    }
    if (answerMap[questionId]?.isMarked) {
        return '已标记';
    }
    return isAnswered(questionId) ? '已作答' : '未作答';
};
const cardClass = (questionId, index) => ({
    active: currentIndex.value === index,
    done: isAnswered(questionId),
    marked: !!answerMap[questionId]?.isMarked,
    empty: !isAnswered(questionId)
});
const handleSubmit = async () => {
    const confirmHtml = `
    <div class="submit-confirm">
      <p>已作答 <strong>${answeredCount.value}</strong> 题，未作答 <strong>${unansweredCount.value}</strong> 题。</p>
      <p>已用时间 <strong>${formatSeconds(usedSeconds.value)}</strong>，提交后将立即判题并生成结果页。</p>
      <p>确认现在提交吗？</p>
    </div>
  `;
    await ElMessageBox.confirm(confirmHtml, '提交确认', {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确认提交',
        cancelButtonText: '继续作答'
    });
    const payload = {
        practiceSetId,
        usedSeconds: usedSeconds.value,
        answers: Object.values(answerMap)
    };
    const res = await submitPracticeApi(payload);
    sessionStorage.setItem('practice_result', JSON.stringify(res));
    ElMessage.success('提交成功');
    router.push(`/student/practice-result?recordId=${res.practiceRecordId}`);
};
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
const statusTag = (status) => {
    return {
        已作答: 'success',
        已标记: 'warning',
        未作答: 'info',
        未开始: 'info'
    }[status] || 'info';
};
onMounted(async () => {
    await load();
    timer = window.setInterval(() => {
        usedSeconds.value++;
    }, 1000);
});
onBeforeUnmount(() => {
    if (timer)
        window.clearInterval(timer);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['marked']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['question-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "practice-page" },
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
    ...{ class: "session-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "session-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "session-value" },
});
(__VLS_ctx.answeredCount);
(__VLS_ctx.questions.length || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "session-subtitle" },
});
(__VLS_ctx.progressPercent);
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
(__VLS_ctx.questions.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.answeredCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.questions.length ? __VLS_ctx.currentIndex + 1 : 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.formatSeconds(__VLS_ctx.usedSeconds));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.markedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.answeredCount);
(__VLS_ctx.questions.length || 0);
const __VLS_0 = {}.ElProgress;
/** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    percentage: (__VLS_ctx.progressPercent),
    strokeWidth: (10),
}));
const __VLS_2 = __VLS_1({
    percentage: (__VLS_ctx.progressPercent),
    strokeWidth: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.unansweredCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.currentQuestionStatus);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "practice-layout" },
});
if (__VLS_ctx.currentQuestion) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card main-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-tags" },
    });
    const __VLS_4 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        effect: "light",
    }));
    const __VLS_6 = __VLS_5({
        effect: "light",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.typeText(__VLS_ctx.currentQuestion.type));
    var __VLS_7;
    const __VLS_8 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        type: "warning",
        effect: "plain",
    }));
    const __VLS_10 = __VLS_9({
        type: "warning",
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (__VLS_ctx.currentQuestion.score);
    var __VLS_11;
    const __VLS_12 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: (__VLS_ctx.statusTag(__VLS_ctx.currentQuestionStatus)),
        effect: "plain",
    }));
    const __VLS_14 = __VLS_13({
        type: (__VLS_ctx.statusTag(__VLS_ctx.currentQuestionStatus)),
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.currentQuestionStatus);
    var __VLS_15;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-position" },
    });
    (__VLS_ctx.currentIndex + 1);
    (__VLS_ctx.questions.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-mini-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-stem" },
    });
    (__VLS_ctx.currentQuestion.stem);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-mini-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-tip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "question-body" },
    });
    if (__VLS_ctx.currentQuestion.type === 'SINGLE') {
        const __VLS_16 = {}.ElRadioGroup;
        /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            ...{ class: "answer-group" },
        }));
        const __VLS_18 = __VLS_17({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            ...{ class: "answer-group" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentQuestion.options || []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.optionLabel),
                ...{ class: "option-item" },
            });
            const __VLS_20 = {}.ElRadio;
            /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                value: (item.optionLabel),
            }));
            const __VLS_22 = __VLS_21({
                value: (item.optionLabel),
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            __VLS_23.slots.default;
            (item.optionLabel);
            (item.optionContent);
            var __VLS_23;
        }
        var __VLS_19;
    }
    else if (__VLS_ctx.currentQuestion.type === 'MULTIPLE') {
        const __VLS_24 = {}.ElCheckboxGroup;
        /** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.multipleAnswerMap[__VLS_ctx.currentQuestion.questionId]),
            ...{ class: "answer-group" },
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.multipleAnswerMap[__VLS_ctx.currentQuestion.questionId]),
            ...{ class: "answer-group" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onChange: (...[$event]) => {
                if (!(__VLS_ctx.currentQuestion))
                    return;
                if (!!(__VLS_ctx.currentQuestion.type === 'SINGLE'))
                    return;
                if (!(__VLS_ctx.currentQuestion.type === 'MULTIPLE'))
                    return;
                __VLS_ctx.onMultipleChange(__VLS_ctx.currentQuestion.questionId);
            }
        };
        __VLS_27.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentQuestion.options || []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.optionLabel),
                ...{ class: "option-item" },
            });
            const __VLS_32 = {}.ElCheckbox;
            /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                value: (item.optionLabel),
            }));
            const __VLS_34 = __VLS_33({
                value: (item.optionLabel),
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            __VLS_35.slots.default;
            (item.optionLabel);
            (item.optionContent);
            var __VLS_35;
        }
        var __VLS_27;
    }
    else if (__VLS_ctx.currentQuestion.type === 'JUDGE') {
        const __VLS_36 = {}.ElRadioGroup;
        /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            ...{ class: "answer-group" },
        }));
        const __VLS_38 = __VLS_37({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            ...{ class: "answer-group" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-item" },
        });
        const __VLS_40 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            value: "T",
        }));
        const __VLS_42 = __VLS_41({
            value: "T",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        var __VLS_43;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-item" },
        });
        const __VLS_44 = {}.ElRadio;
        /** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            value: "F",
        }));
        const __VLS_46 = __VLS_45({
            value: "F",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        var __VLS_47;
        var __VLS_39;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-answer-box" },
        });
        const __VLS_48 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            type: "textarea",
            rows: (6),
            placeholder: "请输入你的答案",
        }));
        const __VLS_50 = __VLS_49({
            modelValue: (__VLS_ctx.answerMap[__VLS_ctx.currentQuestion.questionId].studentAnswer),
            type: "textarea",
            rows: (6),
            placeholder: "请输入你的答案",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-row question-tools" },
    });
    const __VLS_52 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.markedMap[__VLS_ctx.currentQuestion.questionId]),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.markedMap[__VLS_ctx.currentQuestion.questionId]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onChange: (...[$event]) => {
            if (!(__VLS_ctx.currentQuestion))
                return;
            __VLS_ctx.syncMarked(__VLS_ctx.currentQuestion.questionId);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_60 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.favoriteMap[__VLS_ctx.currentQuestion.questionId]),
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.favoriteMap[__VLS_ctx.currentQuestion.questionId]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onChange: (...[$event]) => {
            if (!(__VLS_ctx.currentQuestion))
                return;
            __VLS_ctx.syncFavorite(__VLS_ctx.currentQuestion.questionId);
        }
    };
    __VLS_63.slots.default;
    var __VLS_63;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "footer-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "inline-actions" },
    });
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.currentIndex === 0),
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.currentIndex === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (__VLS_ctx.prevQuestion)
    };
    __VLS_71.slots.default;
    var __VLS_71;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.currentIndex === __VLS_ctx.questions.length - 1),
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.currentIndex === __VLS_ctx.questions.length - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (__VLS_ctx.nextQuestion)
    };
    __VLS_79.slots.default;
    var __VLS_79;
    const __VLS_84 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    __VLS_87.slots.default;
    var __VLS_87;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card side-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-card active" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.currentQuestion ? 1 : 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-card done" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.answeredCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-card marked" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.markedCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-card empty" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.unansweredCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-grid" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.questions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goQuestion(index);
            } },
        key: (item.questionId),
        ...{ class: "card-item" },
        ...{ class: (__VLS_ctx.cardClass(item.questionId, index)) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-number" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-state" },
    });
    (__VLS_ctx.cardStatusText(item.questionId, index));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot active-dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot done-dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot marked-dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot empty-dot" },
});
/** @type {__VLS_StyleScopedClasses['practice-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['session-box']} */ ;
/** @type {__VLS_StyleScopedClasses['session-label']} */ ;
/** @type {__VLS_StyleScopedClasses['session-value']} */ ;
/** @type {__VLS_StyleScopedClasses['session-subtitle']} */ ;
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
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['practice-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['main-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['question-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['question-header']} */ ;
/** @type {__VLS_StyleScopedClasses['question-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['question-position']} */ ;
/** @type {__VLS_StyleScopedClasses['section-mini-title']} */ ;
/** @type {__VLS_StyleScopedClasses['question-stem']} */ ;
/** @type {__VLS_StyleScopedClasses['section-mini-title']} */ ;
/** @type {__VLS_StyleScopedClasses['question-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['question-body']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['answer-group']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['text-answer-box']} */ ;
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
/** @type {__VLS_StyleScopedClasses['question-tools']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['side-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['side-head']} */ ;
/** @type {__VLS_StyleScopedClasses['side-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['marked']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['card-number']} */ ;
/** @type {__VLS_StyleScopedClasses['card-state']} */ ;
/** @type {__VLS_StyleScopedClasses['legend']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['active-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['done-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['marked-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-dot']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            questions: questions,
            currentIndex: currentIndex,
            usedSeconds: usedSeconds,
            answerMap: answerMap,
            multipleAnswerMap: multipleAnswerMap,
            markedMap: markedMap,
            favoriteMap: favoriteMap,
            currentQuestion: currentQuestion,
            answeredCount: answeredCount,
            markedCount: markedCount,
            unansweredCount: unansweredCount,
            progressPercent: progressPercent,
            currentQuestionStatus: currentQuestionStatus,
            onMultipleChange: onMultipleChange,
            syncMarked: syncMarked,
            syncFavorite: syncFavorite,
            prevQuestion: prevQuestion,
            nextQuestion: nextQuestion,
            goQuestion: goQuestion,
            cardStatusText: cardStatusText,
            cardClass: cardClass,
            handleSubmit: handleSubmit,
            formatSeconds: formatSeconds,
            typeText: typeText,
            statusTag: statusTag,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
