import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getTeacherCourseDetailApi } from '@/api/course';
import { getChaptersApi, saveChapterApi, deleteChapterApi } from '@/api/chapter';
import { getResourcesApi } from '@/api/resource';
import { getAssignmentsApi, saveAssignmentApi, deleteAssignmentApi } from '@/api/assignment';
import { getQuestionsByAssignmentApi, answerQuestionApi } from '@/api/question';
import { getCommentsByResourceApi, replyCommentApi, likeCommentApi, likeReplyApi, pinCommentApi } from '@/api/comment';
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const course = reactive({
    id: courseId,
    teacherId: 0,
    title: '',
    status: ''
});
const chapters = ref([]);
const resourcesMap = reactive({});
const assignments = ref([]);
const questionMap = reactive({});
const answerMap = reactive({});
const comments = ref([]);
const selectedCommentResource = ref(null);
const replyBoxMap = reactive({});
const replyTextMap = reactive({});
const chapterForm = reactive({ courseId, title: '', sortNo: 1 });
const assignmentForm = reactive({ courseId, title: '', content: '', deadline: null });
const resourceCount = computed(() => Object.values(resourcesMap).reduce((sum, items) => sum + (items?.length || 0), 0));
const allResources = computed(() => chapters.value.flatMap(chapter => resourcesMap[chapter.id] || []));
const checklistItems = computed(() => [
    {
        key: 'title',
        label: '课程标题',
        done: !!String(course.title || '').trim(),
        desc: String(course.title || '').trim() ? `当前标题：${course.title}` : '请先在课程编辑弹窗中填写课程标题'
    },
    {
        key: 'chapter',
        label: '至少 1 个章节',
        done: chapters.value.length > 0,
        desc: chapters.value.length > 0 ? `已创建 ${chapters.value.length} 个章节` : '当前还没有章节'
    },
    {
        key: 'resource',
        label: '至少 1 个资源',
        done: resourceCount.value > 0,
        desc: resourceCount.value > 0 ? `当前共有 ${resourceCount.value} 个资源` : '当前还没有资源'
    },
    {
        key: 'assignment',
        label: '至少 1 个作业',
        done: assignments.value.length > 0,
        desc: assignments.value.length > 0 ? `已发布 ${assignments.value.length} 个作业` : '当前还没有作业'
    }
]);
const missingChecklistItems = computed(() => checklistItems.value.filter(item => !item.done).map(item => item.label));
const load = async () => {
    const [courseRes, chapterRes, assignmentRes] = await Promise.all([
        getTeacherCourseDetailApi(courseId),
        getChaptersApi(courseId),
        getAssignmentsApi(courseId)
    ]);
    Object.assign(course, courseRes);
    chapters.value = chapterRes;
    assignments.value = assignmentRes;
    const resourceEntries = await Promise.all(chapters.value.map(async (chapter) => [chapter.id, await getResourcesApi(chapter.id)]));
    for (const key of Object.keys(resourcesMap)) {
        delete resourcesMap[Number(key)];
    }
    for (const [chapterId, items] of resourceEntries) {
        resourcesMap[chapterId] = items;
    }
    if (selectedCommentResource.value?.id) {
        const matched = allResources.value.find(item => item.id === selectedCommentResource.value.id);
        selectedCommentResource.value = matched || null;
    }
    if (!selectedCommentResource.value && allResources.value.length) {
        selectedCommentResource.value = allResources.value[0];
    }
    await loadComments();
};
const loadAssignmentQuestions = async (assignmentId) => {
    questionMap[assignmentId] = await getQuestionsByAssignmentApi(assignmentId);
};
const loadComments = async () => {
    if (!selectedCommentResource.value?.id) {
        comments.value = [];
        return;
    }
    comments.value = await getCommentsByResourceApi(selectedCommentResource.value.id);
};
const saveChapter = async () => {
    if (!String(chapterForm.title || '').trim()) {
        ElMessage.warning('请输入章节名称');
        return;
    }
    await saveChapterApi({
        ...chapterForm,
        title: String(chapterForm.title || '').trim()
    });
    chapterForm.title = '';
    ElMessage.success('章节已保存');
    await load();
};
const deleteChapter = async (id) => {
    await deleteChapterApi(id);
    ElMessage.success('删除成功');
    await load();
};
const saveAssignment = async () => {
    if (!String(assignmentForm.title || '').trim()) {
        ElMessage.warning('请输入作业标题');
        return;
    }
    if (!String(assignmentForm.content || '').trim()) {
        ElMessage.warning('请输入作业内容');
        return;
    }
    await saveAssignmentApi({
        ...assignmentForm,
        title: String(assignmentForm.title || '').trim(),
        content: String(assignmentForm.content || '').trim()
    });
    assignmentForm.title = '';
    assignmentForm.content = '';
    ElMessage.success('作业已发布');
    await load();
};
const deleteAssignment = async (id) => {
    await deleteAssignmentApi(id);
    ElMessage.success('删除成功');
    await load();
};
const answer = async (id) => {
    const answerText = String(answerMap[id] || '').trim();
    if (!answerText) {
        ElMessage.warning('请输入回复内容');
        return;
    }
    await answerQuestionApi(id, {
        answer: answerText,
        status: 'RESOLVED'
    });
    ElMessage.success('回复成功');
    answerMap[id] = '';
    for (const assignment of assignments.value) {
        if (questionMap[assignment.id]?.some((q) => q.id === id)) {
            await loadAssignmentQuestions(assignment.id);
            break;
        }
    }
};
const viewSubs = (assignmentId) => {
    router.push(`/teacher/submissions/${assignmentId}`);
};
const goResourcePage = (chapterId) => {
    router.push({
        path: `/teacher/resources/${courseId}`,
        query: chapterId ? { chapterId: String(chapterId) } : {}
    });
};
const goCourses = () => {
    router.push('/teacher/courses');
};
const selectCommentResource = async (resource) => {
    selectedCommentResource.value = resource;
    await loadComments();
};
const selectCommentResourceById = async (resourceId) => {
    const matched = allResources.value.find(item => item.id === resourceId) || null;
    selectedCommentResource.value = matched;
    await loadComments();
};
const toggleReplyBox = (commentId) => {
    replyBoxMap[commentId] = !replyBoxMap[commentId];
};
const submitReply = async (commentId) => {
    const text = (replyTextMap[commentId] || '').trim();
    if (!text) {
        ElMessage.warning('请输入回复内容');
        return;
    }
    await replyCommentApi({
        commentId,
        parentReplyId: null,
        content: text
    });
    ElMessage.success('回复成功');
    replyTextMap[commentId] = '';
    replyBoxMap[commentId] = false;
    await loadComments();
};
const toggleLikeComment = async (commentId) => {
    await likeCommentApi(commentId);
    await loadComments();
};
const toggleLikeReply = async (replyId) => {
    await likeReplyApi(replyId);
    await loadComments();
};
const togglePin = async (commentId) => {
    await pinCommentApi(commentId);
    ElMessage.success('置顶状态已更新');
    await loadComments();
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['checklist-card']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-card']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-header']} */ ;
/** @type {__VLS_StyleScopedClasses['assignment-head']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-row']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-resource-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-submit-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-stack" },
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
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.goResourcePage();
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
    onClick: (__VLS_ctx.goCourses)
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "checklist-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.checklistItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.key),
        ...{ class: "checklist-card" },
        ...{ class: ({ done: item.done, pending: !item.done }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "checklist-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "checklist-name" },
    });
    (item.label);
    const __VLS_16 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        type: (item.done ? 'success' : 'danger'),
        round: true,
    }));
    const __VLS_18 = __VLS_17({
        type: (item.done ? 'success' : 'danger'),
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (item.done ? '已完成' : '未完成');
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "checklist-desc" },
    });
    (item.desc);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value value-small" },
});
(__VLS_ctx.course.title || '未填写');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.chapters.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.resourceCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.assignments.length);
if (__VLS_ctx.missingChecklistItems.length) {
    const __VLS_20 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "warning-alert" },
        type: "warning",
        closable: (false),
        showIcon: true,
        title: (`当前还不能提交审核，还缺少：${__VLS_ctx.missingChecklistItems.join('、')}`),
        description: "建议先完成课程标题、至少 1 个章节、至少 1 个资源、至少 1 个作业。补齐后再回到课程管理页提交审核。",
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "warning-alert" },
        type: "warning",
        closable: (false),
        showIcon: true,
        title: (`当前还不能提交审核，还缺少：${__VLS_ctx.missingChecklistItems.join('、')}`),
        description: "建议先完成课程标题、至少 1 个章节、至少 1 个资源、至少 1 个作业。补齐后再回到课程管理页提交审核。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
else {
    const __VLS_24 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ class: "warning-alert" },
        type: "success",
        closable: (false),
        showIcon: true,
        title: "当前建课内容已补齐",
        description: "课程基础结构已满足审核前检查，可以回到课程管理页提交审核。",
    }));
    const __VLS_26 = __VLS_25({
        ...{ class: "warning-alert" },
        type: "success",
        closable: (false),
        showIcon: true,
        title: "当前建课内容已补齐",
        description: "课程基础结构已满足审核前检查，可以回到课程管理页提交审核。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
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
    ...{ class: "toolbar section-toolbar" },
});
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.chapterForm.title),
    placeholder: "章节名称，例如：第一章 课程导学",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.chapterForm.title),
    placeholder: "章节名称，例如：第一章 课程导学",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.chapterForm.sortNo),
    min: (1),
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.chapterForm.sortNo),
    min: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClick: (__VLS_ctx.saveChapter)
};
__VLS_39.slots.default;
var __VLS_39;
if (!__VLS_ctx.chapters.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-hint" },
    });
}
for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.chapters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (chapter.id),
        ...{ class: "chapter-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chapter-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (chapter.sortNo);
    (chapter.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-text" },
        ...{ style: {} },
    });
    (__VLS_ctx.resourcesMap[chapter.id]?.length || 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goResourcePage(chapter.id);
        }
    };
    __VLS_47.slots.default;
    var __VLS_47;
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteChapter(chapter.id);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
    if (__VLS_ctx.resourcesMap[chapter.id]?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "resource-rows" },
        });
        for (const [res] of __VLS_getVForSourceType((__VLS_ctx.resourcesMap[chapter.id]))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (res.id),
                ...{ class: "resource-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "resource-title" },
            });
            (res.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "meta-text" },
                ...{ style: {} },
            });
            (res.url);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "table-actions" },
            });
            const __VLS_60 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                ...{ 'onClick': {} },
                link: true,
                type: "primary",
            }));
            const __VLS_62 = __VLS_61({
                ...{ 'onClick': {} },
                link: true,
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_64;
            let __VLS_65;
            let __VLS_66;
            const __VLS_67 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.resourcesMap[chapter.id]?.length))
                        return;
                    __VLS_ctx.selectCommentResource(res);
                }
            };
            __VLS_63.slots.default;
            var __VLS_63;
            const __VLS_68 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                ...{ 'onClick': {} },
                link: true,
            }));
            const __VLS_70 = __VLS_69({
                ...{ 'onClick': {} },
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            let __VLS_72;
            let __VLS_73;
            let __VLS_74;
            const __VLS_75 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.resourcesMap[chapter.id]?.length))
                        return;
                    __VLS_ctx.goResourcePage(chapter.id);
                }
            };
            __VLS_71.slots.default;
            var __VLS_71;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-tip chapter-empty" },
        });
    }
}
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
    ...{ class: "toolbar section-toolbar" },
});
const __VLS_76 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.assignmentForm.title),
    placeholder: "作业标题",
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.assignmentForm.title),
    placeholder: "作业标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.assignmentForm.content),
    placeholder: "作业内容或要求",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.assignmentForm.content),
    placeholder: "作业内容或要求",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
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
    onClick: (__VLS_ctx.saveAssignment)
};
__VLS_87.slots.default;
var __VLS_87;
if (!__VLS_ctx.assignments.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-hint" },
    });
}
for (const [a] of __VLS_getVForSourceType((__VLS_ctx.assignments))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (a.id),
        ...{ class: "chapter-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "assignment-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (a.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-text" },
        ...{ style: {} },
    });
    (a.description || a.content || '暂无作业说明');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_92 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_96;
    let __VLS_97;
    let __VLS_98;
    const __VLS_99 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewSubs(a.id);
        }
    };
    __VLS_95.slots.default;
    var __VLS_95;
    const __VLS_100 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onClick: (...[$event]) => {
            __VLS_ctx.loadAssignmentQuestions(a.id);
        }
    };
    __VLS_103.slots.default;
    var __VLS_103;
    const __VLS_108 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_110 = __VLS_109({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_112;
    let __VLS_113;
    let __VLS_114;
    const __VLS_115 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteAssignment(a.id);
        }
    };
    __VLS_111.slots.default;
    var __VLS_111;
    if (__VLS_ctx.questionMap[a.id]?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "question-list" },
        });
        for (const [q] of __VLS_getVForSourceType((__VLS_ctx.questionMap[a.id]))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (q.id),
                ...{ class: "question-box" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "question-title" },
            });
            (q.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "question-content" },
            });
            (q.content);
            const __VLS_116 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
                modelValue: (__VLS_ctx.answerMap[q.id]),
                type: "textarea",
                placeholder: (q.answer || '输入回复内容'),
                ...{ style: {} },
            }));
            const __VLS_118 = __VLS_117({
                modelValue: (__VLS_ctx.answerMap[q.id]),
                type: "textarea",
                placeholder: (q.answer || '输入回复内容'),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_117));
            const __VLS_120 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                ...{ 'onClick': {} },
                plain: true,
                ...{ style: {} },
            }));
            const __VLS_122 = __VLS_121({
                ...{ 'onClick': {} },
                plain: true,
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_121));
            let __VLS_124;
            let __VLS_125;
            let __VLS_126;
            const __VLS_127 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.questionMap[a.id]?.length))
                        return;
                    __VLS_ctx.answer(q.id);
                }
            };
            __VLS_123.slots.default;
            var __VLS_123;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-tip assignment-empty" },
        });
    }
}
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
if (__VLS_ctx.allResources.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-resource-bar" },
    });
    const __VLS_128 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectedCommentResource?.id),
        placeholder: "请选择要管理评论的资源",
        ...{ style: {} },
    }));
    const __VLS_130 = __VLS_129({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectedCommentResource?.id),
        placeholder: "请选择要管理评论的资源",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    let __VLS_132;
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = {
        onChange: (__VLS_ctx.selectCommentResourceById)
    };
    __VLS_131.slots.default;
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.allResources))) {
        const __VLS_136 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            key: (item.id),
            label: (item.title),
            value: (item.id),
        }));
        const __VLS_138 = __VLS_137({
            key: (item.id),
            label: (item.title),
            value: (item.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    }
    var __VLS_131;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-text" },
    });
    (__VLS_ctx.selectedCommentResource?.title || '未选择');
}
if (!__VLS_ctx.allResources.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-hint" },
    });
}
if (__VLS_ctx.selectedCommentResource) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.comments.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comment-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.comments))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.id),
                ...{ class: "comment-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-head" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-user" },
            });
            (item.userNickname || '用户');
            const __VLS_140 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                size: "small",
                ...{ style: {} },
            }));
            const __VLS_142 = __VLS_141({
                size: "small",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            __VLS_143.slots.default;
            (item.userRole || '-');
            var __VLS_143;
            if (item.pinned) {
                const __VLS_144 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                    type: "danger",
                    size: "small",
                    ...{ style: {} },
                }));
                const __VLS_146 = __VLS_145({
                    type: "danger",
                    size: "small",
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_145));
                __VLS_147.slots.default;
                var __VLS_147;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-time" },
            });
            (item.createdAt);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-content" },
            });
            (item.content);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-actions" },
            });
            const __VLS_148 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                ...{ 'onClick': {} },
                link: true,
            }));
            const __VLS_150 = __VLS_149({
                ...{ 'onClick': {} },
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            let __VLS_152;
            let __VLS_153;
            let __VLS_154;
            const __VLS_155 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCommentResource))
                        return;
                    if (!(__VLS_ctx.comments.length))
                        return;
                    __VLS_ctx.toggleLikeComment(item.id);
                }
            };
            __VLS_151.slots.default;
            (item.liked ? '取消点赞' : '点赞');
            (item.likeCount || 0);
            var __VLS_151;
            const __VLS_156 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                ...{ 'onClick': {} },
                link: true,
                type: "danger",
            }));
            const __VLS_158 = __VLS_157({
                ...{ 'onClick': {} },
                link: true,
                type: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_157));
            let __VLS_160;
            let __VLS_161;
            let __VLS_162;
            const __VLS_163 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCommentResource))
                        return;
                    if (!(__VLS_ctx.comments.length))
                        return;
                    __VLS_ctx.togglePin(item.id);
                }
            };
            __VLS_159.slots.default;
            (item.pinned ? '取消置顶' : '置顶');
            var __VLS_159;
            const __VLS_164 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                ...{ 'onClick': {} },
                link: true,
            }));
            const __VLS_166 = __VLS_165({
                ...{ 'onClick': {} },
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_165));
            let __VLS_168;
            let __VLS_169;
            let __VLS_170;
            const __VLS_171 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCommentResource))
                        return;
                    if (!(__VLS_ctx.comments.length))
                        return;
                    __VLS_ctx.toggleReplyBox(item.id);
                }
            };
            __VLS_167.slots.default;
            var __VLS_167;
            if (__VLS_ctx.replyBoxMap[item.id]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reply-editor" },
                });
                const __VLS_172 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                    modelValue: (__VLS_ctx.replyTextMap[item.id]),
                    type: "textarea",
                    rows: (2),
                    placeholder: "请输入回复内容",
                    maxlength: "500",
                    showWordLimit: true,
                }));
                const __VLS_174 = __VLS_173({
                    modelValue: (__VLS_ctx.replyTextMap[item.id]),
                    type: "textarea",
                    rows: (2),
                    placeholder: "请输入回复内容",
                    maxlength: "500",
                    showWordLimit: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_173));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reply-submit-row" },
                });
                const __VLS_176 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                    ...{ 'onClick': {} },
                    size: "small",
                }));
                const __VLS_178 = __VLS_177({
                    ...{ 'onClick': {} },
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_177));
                let __VLS_180;
                let __VLS_181;
                let __VLS_182;
                const __VLS_183 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.selectedCommentResource))
                            return;
                        if (!(__VLS_ctx.comments.length))
                            return;
                        if (!(__VLS_ctx.replyBoxMap[item.id]))
                            return;
                        __VLS_ctx.toggleReplyBox(item.id);
                    }
                };
                __VLS_179.slots.default;
                var __VLS_179;
                const __VLS_184 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }));
                const __VLS_186 = __VLS_185({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }, ...__VLS_functionalComponentArgsRest(__VLS_185));
                let __VLS_188;
                let __VLS_189;
                let __VLS_190;
                const __VLS_191 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.selectedCommentResource))
                            return;
                        if (!(__VLS_ctx.comments.length))
                            return;
                        if (!(__VLS_ctx.replyBoxMap[item.id]))
                            return;
                        __VLS_ctx.submitReply(item.id);
                    }
                };
                __VLS_187.slots.default;
                var __VLS_187;
            }
            if (item.replies?.length) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reply-list" },
                });
                for (const [reply] of __VLS_getVForSourceType((item.replies))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (reply.id),
                        ...{ class: "reply-item" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "reply-head" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "reply-user" },
                    });
                    (reply.userNickname || '用户');
                    const __VLS_192 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                        size: "small",
                        ...{ style: {} },
                    }));
                    const __VLS_194 = __VLS_193({
                        size: "small",
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
                    __VLS_195.slots.default;
                    (reply.userRole || '-');
                    var __VLS_195;
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "reply-time" },
                    });
                    (reply.createdAt);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "reply-content" },
                    });
                    (reply.content);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "reply-actions" },
                    });
                    const __VLS_196 = {}.ElButton;
                    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                        ...{ 'onClick': {} },
                        link: true,
                        size: "small",
                    }));
                    const __VLS_198 = __VLS_197({
                        ...{ 'onClick': {} },
                        link: true,
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
                    let __VLS_200;
                    let __VLS_201;
                    let __VLS_202;
                    const __VLS_203 = {
                        onClick: (...[$event]) => {
                            if (!(__VLS_ctx.selectedCommentResource))
                                return;
                            if (!(__VLS_ctx.comments.length))
                                return;
                            if (!(item.replies?.length))
                                return;
                            __VLS_ctx.toggleLikeReply(reply.id);
                        }
                    };
                    __VLS_199.slots.default;
                    (reply.liked ? '取消点赞' : '点赞');
                    (reply.likeCount || 0);
                    var __VLS_199;
                }
            }
        }
    }
    else {
        const __VLS_204 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
            description: "该资源下暂无评论",
        }));
        const __VLS_206 = __VLS_205({
            description: "该资源下暂无评论",
        }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    }
}
else {
    const __VLS_208 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        description: "请先从课程资源中选择一个资源",
    }));
    const __VLS_210 = __VLS_209({
        description: "请先从课程资源中选择一个资源",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
}
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-card']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-head']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-name']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['value-small']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-box']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-rows']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-row']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-box']} */ ;
/** @type {__VLS_StyleScopedClasses['assignment-head']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['question-list']} */ ;
/** @type {__VLS_StyleScopedClasses['question-box']} */ ;
/** @type {__VLS_StyleScopedClasses['question-title']} */ ;
/** @type {__VLS_StyleScopedClasses['question-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['assignment-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-resource-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['section-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-head']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-user']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-time']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-submit-row']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-list']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-item']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-head']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-user']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-time']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-content']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            course: course,
            chapters: chapters,
            resourcesMap: resourcesMap,
            assignments: assignments,
            questionMap: questionMap,
            answerMap: answerMap,
            comments: comments,
            selectedCommentResource: selectedCommentResource,
            replyBoxMap: replyBoxMap,
            replyTextMap: replyTextMap,
            chapterForm: chapterForm,
            assignmentForm: assignmentForm,
            resourceCount: resourceCount,
            allResources: allResources,
            checklistItems: checklistItems,
            missingChecklistItems: missingChecklistItems,
            loadAssignmentQuestions: loadAssignmentQuestions,
            saveChapter: saveChapter,
            deleteChapter: deleteChapter,
            saveAssignment: saveAssignment,
            deleteAssignment: deleteAssignment,
            answer: answer,
            viewSubs: viewSubs,
            goResourcePage: goResourcePage,
            goCourses: goCourses,
            selectCommentResource: selectCommentResource,
            selectCommentResourceById: selectCommentResourceById,
            toggleReplyBox: toggleReplyBox,
            submitReply: submitReply,
            toggleLikeComment: toggleLikeComment,
            toggleLikeReply: toggleLikeReply,
            togglePin: togglePin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
