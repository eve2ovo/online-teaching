import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getStudentLearnDetailApi } from '@/api/course';
import { getCommentsByResourceApi, addCommentApi, replyCommentApi, likeCommentApi, likeReplyApi } from '@/api/comment';
import { getCourseStudyProgressApi, saveStudyProgressApi } from '@/api/progress';
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.id);
const detail = reactive({
    course: {
        id: 0,
        teacherId: 0,
        title: '',
        status: ''
    },
    chapters: []
});
const progress = ref(null);
const currentVideo = ref(null);
const currentChapter = ref(null);
const videoRef = ref(null);
const comments = ref([]);
const commentText = ref('');
const replyBoxMap = reactive({});
const replyTextMap = reactive({});
const lastPersistedSecondMap = reactive({});
const restoringPosition = ref(false);
const resourceProgressMap = computed(() => {
    const map = new Map();
    for (const item of progress.value?.resources || []) {
        map.set(item.resourceId, {
            progressPercent: item.progressPercent || 0,
            learnedSeconds: item.learnedSeconds || 0,
            completed: !!item.completed
        });
    }
    return map;
});
const chapterProgressMap = computed(() => {
    const map = new Map();
    for (const item of progress.value?.chapters || []) {
        map.set(item.chapterId, {
            progressPercent: item.progressPercent || 0,
            completedResources: item.completedResources || 0,
            totalResources: item.totalResources || 0
        });
    }
    return map;
});
const flatResources = computed(() => detail.chapters.flatMap(chapter => (chapter.resources || []).map(resource => ({ chapter, resource }))));
const currentResourceIndex = computed(() => flatResources.value.findIndex(item => item.resource.id === currentVideo.value?.id));
const currentChapterResourceIndex = computed(() => {
    if (!currentVideo.value || !currentChapter.value?.resources?.length) {
        return '-';
    }
    const index = currentChapter.value.resources.findIndex(item => item.id === currentVideo.value?.id);
    return index >= 0 ? index + 1 : '-';
});
const currentPositionText = computed(() => {
    if (!currentVideo.value || !currentChapter.value) {
        return '暂无学习位置';
    }
    return `第 ${currentChapter.value.sortNo} 章 · 第 ${currentChapterResourceIndex.value} 个资源 · 共 ${flatResources.value.length} 个资源`;
});
const previousResource = computed(() => {
    const index = currentResourceIndex.value;
    return index > 0 ? flatResources.value[index - 1] : null;
});
const nextResource = computed(() => {
    const index = currentResourceIndex.value;
    return index >= 0 && index < flatResources.value.length - 1 ? flatResources.value[index + 1] : null;
});
const resourceProgress = (resourceId) => resourceProgressMap.value.get(resourceId) || { progressPercent: 0, learnedSeconds: 0, completed: false };
const chapterProgress = (chapterId) => chapterProgressMap.value.get(chapterId) || { progressPercent: 0, completedResources: 0, totalResources: 0 };
const resourceStatusText = (resourceId) => {
    if (currentVideo.value?.id === resourceId) {
        return '学习中';
    }
    const item = resourceProgress(resourceId);
    if (item.completed || item.progressPercent >= 100) {
        return '已完成';
    }
    if (item.progressPercent > 0) {
        return '学习中';
    }
    return '未开始';
};
const resourceStatusType = (resourceId) => {
    const text = resourceStatusText(resourceId);
    if (text === '已完成') {
        return 'success';
    }
    if (text === '学习中') {
        return 'primary';
    }
    return 'info';
};
const formatTime = (value) => {
    if (!value) {
        return '暂无记录';
    }
    return value.replace('T', ' ').slice(0, 16);
};
const formatSeconds = (value) => {
    const seconds = Math.max(value || 0, 0);
    const minute = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return `${minute}分 ${String(remain).padStart(2, '0')}秒`;
};
const findChapterByResourceId = (resourceId) => {
    if (!resourceId) {
        return null;
    }
    for (const chapter of detail.chapters) {
        const matched = chapter.resources?.find(item => item.id === resourceId);
        if (matched) {
            return { chapter, resource: matched };
        }
    }
    return null;
};
const initProgressSkeleton = () => {
    progress.value = {
        courseId,
        totalResources: detail.chapters.reduce((sum, chapter) => sum + (chapter.resources?.length || 0), 0),
        completedResources: 0,
        progressPercent: 0,
        currentChapterId: null,
        currentResourceId: null,
        lastLearnedAt: null,
        chapters: detail.chapters.map(chapter => ({
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sortNo: chapter.sortNo,
            totalResources: chapter.resources?.length || 0,
            completedResources: 0,
            progressPercent: 0
        })),
        resources: detail.chapters.flatMap(chapter => (chapter.resources || []).map(resource => ({
            resourceId: resource.id,
            chapterId: chapter.id,
            progressPercent: 0,
            learnedSeconds: 0,
            completed: false,
            lastLearnedAt: null
        })))
    };
};
const recomputeProgressSummary = () => {
    if (!progress.value) {
        return;
    }
    const chapterResources = new Map();
    for (const chapter of detail.chapters) {
        chapterResources.set(chapter.id, (chapter.resources || []).map(item => item.id));
    }
    const resources = progress.value.resources || [];
    progress.value.totalResources = resources.length;
    progress.value.completedResources = resources.filter(item => item.completed).length;
    const totalPercent = resources.reduce((sum, item) => sum + (item.progressPercent || 0), 0);
    progress.value.progressPercent = resources.length ? Math.round(totalPercent / resources.length) : 0;
    progress.value.chapters = detail.chapters.map(chapter => {
        const ids = chapterResources.get(chapter.id) || [];
        const current = resources.filter(item => ids.includes(item.resourceId));
        const chapterTotal = ids.length;
        const chapterCompleted = current.filter(item => item.completed).length;
        const chapterPercent = chapterTotal
            ? Math.round(current.reduce((sum, item) => sum + (item.progressPercent || 0), 0) / chapterTotal)
            : 0;
        return {
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sortNo: chapter.sortNo,
            totalResources: chapterTotal,
            completedResources: chapterCompleted,
            progressPercent: chapterPercent
        };
    });
};
const applyLocalProgressUpdate = (chapterId, resourceId, learnedSeconds, progressPercent, completed) => {
    if (!progress.value) {
        initProgressSkeleton();
    }
    const now = new Date().toISOString();
    const resourceList = progress.value.resources;
    const current = resourceList.find(item => item.resourceId === resourceId);
    if (current) {
        current.chapterId = chapterId;
        current.learnedSeconds = Math.max(learnedSeconds, 0);
        current.completed = completed || current.completed;
        current.progressPercent = current.completed ? 100 : Math.max(0, Math.min(100, progressPercent));
        current.lastLearnedAt = now;
    }
    else {
        resourceList.push({
            resourceId,
            chapterId,
            learnedSeconds: Math.max(learnedSeconds, 0),
            completed,
            progressPercent: completed ? 100 : Math.max(0, Math.min(100, progressPercent)),
            lastLearnedAt: now
        });
    }
    progress.value.currentChapterId = chapterId;
    progress.value.currentResourceId = resourceId;
    progress.value.lastLearnedAt = now;
    recomputeProgressSummary();
};
const loadComments = async () => {
    if (!currentVideo.value?.id) {
        comments.value = [];
        return;
    }
    comments.value = await getCommentsByResourceApi(currentVideo.value.id);
};
const restoreCurrentVideoPosition = () => {
    if (!currentVideo.value?.id || !videoRef.value) {
        return;
    }
    const saved = resourceProgress(currentVideo.value.id);
    if (!saved.learnedSeconds || saved.completed) {
        return;
    }
    const video = videoRef.value;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const target = duration > 0 ? Math.min(saved.learnedSeconds, Math.max(duration - 2, 0)) : saved.learnedSeconds;
    if (target <= 0) {
        return;
    }
    restoringPosition.value = true;
    video.currentTime = target;
    lastPersistedSecondMap[currentVideo.value.id] = saved.learnedSeconds;
    window.setTimeout(() => {
        restoringPosition.value = false;
    }, 300);
};
const load = async () => {
    const [detailRes, progressRes] = await Promise.all([
        getStudentLearnDetailApi(courseId),
        getCourseStudyProgressApi(courseId)
    ]);
    detail.course = detailRes.course;
    detail.chapters = detailRes.chapters || [];
    progress.value = progressRes;
    const latest = findChapterByResourceId(progressRes.currentResourceId);
    if (latest) {
        currentVideo.value = latest.resource;
        currentChapter.value = latest.chapter;
    }
    else {
        currentVideo.value = null;
        currentChapter.value = null;
        for (const chapter of detail.chapters) {
            if (chapter.resources?.length) {
                currentVideo.value = chapter.resources[0];
                currentChapter.value = chapter;
                break;
            }
        }
    }
    await loadComments();
    await nextTick();
    restoreCurrentVideoPosition();
};
const selectVideo = async (item, chapter) => {
    await persistCurrentProgress(true);
    currentVideo.value = item;
    currentChapter.value = chapter;
    await loadComments();
    await nextTick();
    restoreCurrentVideoPosition();
};
const switchResource = async (target) => {
    if (!target) {
        return;
    }
    await selectVideo(target.resource, target.chapter);
};
const goPreviousResource = async () => {
    await switchResource(previousResource.value);
};
const goNextResource = async () => {
    await switchResource(nextResource.value);
};
const persistCurrentProgress = async (force = false, completed = false) => {
    if (!currentVideo.value?.id || !currentChapter.value?.id || !videoRef.value) {
        return;
    }
    const video = videoRef.value;
    const learnedSeconds = Math.floor(video.currentTime || 0);
    const duration = Number.isFinite(video.duration) ? Math.floor(video.duration) : 0;
    let progressPercent = duration > 0 ? Math.round((learnedSeconds / duration) * 100) : resourceProgress(currentVideo.value.id).progressPercent;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
    const shouldComplete = completed || progressPercent >= 100;
    const lastPersistedSeconds = lastPersistedSecondMap[currentVideo.value.id] || 0;
    if (!force && !shouldComplete && Math.abs(learnedSeconds - lastPersistedSeconds) < 8) {
        return;
    }
    if (restoringPosition.value && !force) {
        return;
    }
    await saveStudyProgressApi({
        courseId,
        chapterId: currentChapter.value.id,
        resourceId: currentVideo.value.id,
        learnedSeconds,
        progressPercent,
        completed: shouldComplete
    });
    lastPersistedSecondMap[currentVideo.value.id] = learnedSeconds;
    applyLocalProgressUpdate(currentChapter.value.id, currentVideo.value.id, learnedSeconds, progressPercent, shouldComplete);
};
const handleLoadedMetadata = () => {
    restoreCurrentVideoPosition();
};
const handleTimeUpdate = async () => {
    await persistCurrentProgress(false);
};
const handlePause = async () => {
    await persistCurrentProgress(true);
};
const handleVideoEnded = async () => {
    await persistCurrentProgress(true, true);
};
const markCurrentVideoCompleted = async () => {
    if (!videoRef.value) {
        return;
    }
    const duration = Number.isFinite(videoRef.value.duration) ? Math.floor(videoRef.value.duration) : 0;
    if (duration > 0) {
        videoRef.value.currentTime = duration;
    }
    await persistCurrentProgress(true, true);
    ElMessage.success('当前资源已标记为完成');
};
const submitComment = async () => {
    if (!currentVideo.value?.id) {
        ElMessage.warning('请先选择一个资源再发表评论');
        return;
    }
    if (!commentText.value.trim()) {
        ElMessage.warning('请输入评论内容');
        return;
    }
    await addCommentApi({
        courseId,
        chapterId: currentChapter.value?.id || null,
        resourceId: currentVideo.value.id,
        content: commentText.value.trim()
    });
    ElMessage.success('评论已发布');
    commentText.value = '';
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
    ElMessage.success('回复已提交');
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
const goBack = () => {
    router.push('/student/home');
};
const goDetail = () => {
    router.push(`/student/course/${courseId}`);
};
onBeforeUnmount(async () => {
    await persistCurrentProgress(true);
});
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['video-item']} */ ;
/** @type {__VLS_StyleScopedClasses['video-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['top-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['learn-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['top-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['player-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['player-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['next-resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['video-row']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-submit']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['player-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "learn-page" },
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
(__VLS_ctx.detail.course?.title || '课程学习');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
(__VLS_ctx.detail.course?.description || '围绕当前学习位置继续推进课程，保持节奏，优先完成本节资源。');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
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
    onClick: (__VLS_ctx.goBack)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.goDetail)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.load)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-progress" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.progress?.progressPercent || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.progress?.completedResources || 0);
(__VLS_ctx.progress?.totalResources || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value small" },
});
(__VLS_ctx.formatTime(__VLS_ctx.progress?.lastLearnedAt));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-stat" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value small" },
});
(__VLS_ctx.currentPositionText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "continuity-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "continuity-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "continuity-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "continuity-desc" },
});
(__VLS_ctx.currentVideo ? `当前正在学习《${__VLS_ctx.currentVideo.title}》` : '当前课程还没有可学习资源');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "continuity-actions" },
});
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    plain: true,
    disabled: (!__VLS_ctx.previousResource),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    plain: true,
    disabled: (!__VLS_ctx.previousResource),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.goPreviousResource)
};
__VLS_27.slots.default;
var __VLS_27;
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.nextResource),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.nextResource),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.goNextResource)
};
__VLS_35.slots.default;
var __VLS_35;
const __VLS_40 = {}.ElProgress;
/** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    percentage: (__VLS_ctx.progress?.progressPercent || 0),
    strokeWidth: (12),
}));
const __VLS_42 = __VLS_41({
    percentage: (__VLS_ctx.progress?.progressPercent || 0),
    strokeWidth: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "learn-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card sidebar-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title sidebar-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc sidebar-desc" },
});
if (__VLS_ctx.detail.chapters.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    for (const [chapter] of __VLS_getVForSourceType((__VLS_ctx.detail.chapters))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (chapter.id),
            ...{ class: "chapter-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-name" },
        });
        (chapter.sortNo);
        (chapter.title);
        const __VLS_44 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            size: "small",
            type: (__VLS_ctx.chapterProgress(chapter.id).progressPercent >= 100 ? 'success' : 'info'),
        }));
        const __VLS_46 = __VLS_45({
            size: "small",
            type: (__VLS_ctx.chapterProgress(chapter.id).progressPercent >= 100 ? 'success' : 'info'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        (__VLS_ctx.chapterProgress(chapter.id).progressPercent);
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-meta" },
        });
        (__VLS_ctx.chapterProgress(chapter.id).completedResources);
        (__VLS_ctx.chapterProgress(chapter.id).totalResources);
        const __VLS_48 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            percentage: (__VLS_ctx.chapterProgress(chapter.id).progressPercent),
            strokeWidth: (8),
            showText: (false),
            ...{ style: {} },
        }));
        const __VLS_50 = __VLS_49({
            percentage: (__VLS_ctx.chapterProgress(chapter.id).progressPercent),
            strokeWidth: (8),
            showText: (false),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        if (chapter.resources?.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "video-list" },
            });
            for (const [item] of __VLS_getVForSourceType((chapter.resources))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.detail.chapters.length))
                                return;
                            if (!(chapter.resources?.length))
                                return;
                            __VLS_ctx.selectVideo(item, chapter);
                        } },
                    key: (item.id),
                    ...{ class: "video-item" },
                    ...{ class: ({ active: __VLS_ctx.currentVideo?.id === item.id }) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "video-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "video-title" },
                });
                (item.title);
                const __VLS_52 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                    size: "small",
                    type: (__VLS_ctx.resourceStatusType(item.id)),
                }));
                const __VLS_54 = __VLS_53({
                    size: "small",
                    type: (__VLS_ctx.resourceStatusType(item.id)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                __VLS_55.slots.default;
                (__VLS_ctx.resourceStatusText(item.id));
                var __VLS_55;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "video-meta" },
                });
                (item.type);
                if (item.fileName) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (item.fileName);
                }
            }
        }
        else {
            const __VLS_56 = {}.ElEmpty;
            /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                description: "当前章节还没有资源",
                imageSize: (70),
            }));
            const __VLS_58 = __VLS_57({
                description: "当前章节还没有资源",
                imageSize: (70),
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        }
    }
}
else {
    const __VLS_60 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        description: "当前课程还没有章节目录",
    }));
    const __VLS_62 = __VLS_61({
        description: "当前课程还没有章节目录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card player-card" },
});
if (__VLS_ctx.currentVideo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "player-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title player-title" },
    });
    (__VLS_ctx.currentVideo.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-desc" },
    });
    (__VLS_ctx.currentChapter?.sortNo || '-');
    (__VLS_ctx.resourceStatusText(__VLS_ctx.currentVideo.id));
    (__VLS_ctx.currentChapterResourceIndex);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "player-actions" },
    });
    const __VLS_64 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        plain: true,
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentVideo))
                return;
            __VLS_ctx.persistCurrentProgress(true);
        }
    };
    __VLS_67.slots.default;
    var __VLS_67;
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        type: "success",
        plain: true,
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        type: "success",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (__VLS_ctx.markCurrentVideoCompleted)
    };
    __VLS_75.slots.default;
    var __VLS_75;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "video-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        ...{ onLoadedmetadata: (__VLS_ctx.handleLoadedMetadata) },
        ...{ onTimeupdate: (__VLS_ctx.handleTimeUpdate) },
        ...{ onPause: (__VLS_ctx.handlePause) },
        ...{ onEnded: (__VLS_ctx.handleVideoEnded) },
        ref: "videoRef",
        src: (__VLS_ctx.currentVideo.url),
        controls: true,
        playsinline: true,
        preload: "metadata",
        ...{ style: {} },
    });
    /** @type {typeof __VLS_ctx.videoRef} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "resource-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentVideo.type || '未知');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.resourceProgress(__VLS_ctx.currentVideo.id).progressPercent);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formatSeconds(__VLS_ctx.resourceProgress(__VLS_ctx.currentVideo.id).learnedSeconds));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentVideo.fileName || '未提供文件名');
}
else {
    const __VLS_80 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        description: "当前课程还没有可学习资源，稍后再来看看吧。",
    }));
    const __VLS_82 = __VLS_81({
        description: "当前课程还没有可学习资源，稍后再来看看吧。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
}
if (__VLS_ctx.nextResource) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card next-resource-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "next-resource-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "next-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "next-title" },
    });
    (__VLS_ctx.nextResource.resource.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-desc" },
    });
    (__VLS_ctx.nextResource.chapter.sortNo);
    (__VLS_ctx.nextResource.chapter.title);
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
        onClick: (__VLS_ctx.goNextResource)
    };
    __VLS_87.slots.default;
    var __VLS_87;
}
if (__VLS_ctx.currentVideo) {
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
        ...{ class: "comment-editor" },
    });
    const __VLS_92 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        modelValue: (__VLS_ctx.commentText),
        type: "textarea",
        rows: (3),
        placeholder: "写下你对当前资源的理解、疑问或补充说明",
        maxlength: "1000",
        showWordLimit: true,
    }));
    const __VLS_94 = __VLS_93({
        modelValue: (__VLS_ctx.commentText),
        type: "textarea",
        rows: (3),
        placeholder: "写下你对当前资源的理解、疑问或补充说明",
        maxlength: "1000",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-submit" },
    });
    const __VLS_96 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (__VLS_ctx.submitComment)
    };
    __VLS_99.slots.default;
    var __VLS_99;
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
                ...{ class: "comment-top" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-user" },
            });
            (item.userNickname || '匿名用户');
            const __VLS_104 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                size: "small",
                ...{ style: {} },
            }));
            const __VLS_106 = __VLS_105({
                size: "small",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            __VLS_107.slots.default;
            (item.userRole || '-');
            var __VLS_107;
            if (item.pinned) {
                const __VLS_108 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                    type: "danger",
                    size: "small",
                    ...{ style: {} },
                }));
                const __VLS_110 = __VLS_109({
                    type: "danger",
                    size: "small",
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_109));
                __VLS_111.slots.default;
                var __VLS_111;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-time" },
            });
            (__VLS_ctx.formatTime(item.createdAt));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-content" },
            });
            (item.content);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "comment-actions" },
            });
            const __VLS_112 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                ...{ 'onClick': {} },
                link: true,
            }));
            const __VLS_114 = __VLS_113({
                ...{ 'onClick': {} },
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            let __VLS_116;
            let __VLS_117;
            let __VLS_118;
            const __VLS_119 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentVideo))
                        return;
                    if (!(__VLS_ctx.comments.length))
                        return;
                    __VLS_ctx.toggleLikeComment(item.id);
                }
            };
            __VLS_115.slots.default;
            (item.liked ? '已点赞' : '点赞');
            (item.likeCount || 0);
            var __VLS_115;
            const __VLS_120 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                ...{ 'onClick': {} },
                link: true,
            }));
            const __VLS_122 = __VLS_121({
                ...{ 'onClick': {} },
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_121));
            let __VLS_124;
            let __VLS_125;
            let __VLS_126;
            const __VLS_127 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.currentVideo))
                        return;
                    if (!(__VLS_ctx.comments.length))
                        return;
                    __VLS_ctx.toggleReplyBox(item.id);
                }
            };
            __VLS_123.slots.default;
            (__VLS_ctx.replyBoxMap[item.id] ? '收起回复框' : '回复');
            var __VLS_123;
            if (__VLS_ctx.replyBoxMap[item.id]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reply-editor" },
                });
                const __VLS_128 = {}.ElInput;
                /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
                // @ts-ignore
                const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
                    modelValue: (__VLS_ctx.replyTextMap[item.id]),
                    type: "textarea",
                    rows: (2),
                    placeholder: "补充你的回复内容",
                    maxlength: "500",
                    showWordLimit: true,
                }));
                const __VLS_130 = __VLS_129({
                    modelValue: (__VLS_ctx.replyTextMap[item.id]),
                    type: "textarea",
                    rows: (2),
                    placeholder: "补充你的回复内容",
                    maxlength: "500",
                    showWordLimit: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_129));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "reply-submit" },
                });
                const __VLS_132 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
                    ...{ 'onClick': {} },
                    size: "small",
                }));
                const __VLS_134 = __VLS_133({
                    ...{ 'onClick': {} },
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_133));
                let __VLS_136;
                let __VLS_137;
                let __VLS_138;
                const __VLS_139 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentVideo))
                            return;
                        if (!(__VLS_ctx.comments.length))
                            return;
                        if (!(__VLS_ctx.replyBoxMap[item.id]))
                            return;
                        __VLS_ctx.toggleReplyBox(item.id);
                    }
                };
                __VLS_135.slots.default;
                var __VLS_135;
                const __VLS_140 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }));
                const __VLS_142 = __VLS_141({
                    ...{ 'onClick': {} },
                    size: "small",
                    type: "primary",
                }, ...__VLS_functionalComponentArgsRest(__VLS_141));
                let __VLS_144;
                let __VLS_145;
                let __VLS_146;
                const __VLS_147 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.currentVideo))
                            return;
                        if (!(__VLS_ctx.comments.length))
                            return;
                        if (!(__VLS_ctx.replyBoxMap[item.id]))
                            return;
                        __VLS_ctx.submitReply(item.id);
                    }
                };
                __VLS_143.slots.default;
                var __VLS_143;
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
                    (reply.userNickname || '匿名用户');
                    const __VLS_148 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                        size: "small",
                        ...{ style: {} },
                    }));
                    const __VLS_150 = __VLS_149({
                        size: "small",
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                    __VLS_151.slots.default;
                    (reply.userRole || '-');
                    var __VLS_151;
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "reply-time" },
                    });
                    (__VLS_ctx.formatTime(reply.createdAt));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "reply-content" },
                    });
                    (reply.content);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "reply-actions" },
                    });
                    const __VLS_152 = {}.ElButton;
                    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                        ...{ 'onClick': {} },
                        text: true,
                        size: "small",
                    }));
                    const __VLS_154 = __VLS_153({
                        ...{ 'onClick': {} },
                        text: true,
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
                    let __VLS_156;
                    let __VLS_157;
                    let __VLS_158;
                    const __VLS_159 = {
                        onClick: (...[$event]) => {
                            if (!(__VLS_ctx.currentVideo))
                                return;
                            if (!(__VLS_ctx.comments.length))
                                return;
                            if (!(item.replies?.length))
                                return;
                            __VLS_ctx.toggleLikeReply(reply.id);
                        }
                    };
                    __VLS_155.slots.default;
                    (reply.liked ? '已点赞' : '点赞');
                    (reply.likeCount || 0);
                    var __VLS_155;
                }
            }
        }
    }
    else {
        const __VLS_160 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            description: "当前资源还没有评论，欢迎留下第一条学习记录。",
        }));
        const __VLS_162 = __VLS_161({
            description: "当前资源还没有评论，欢迎留下第一条学习记录。",
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    }
}
/** @type {__VLS_StyleScopedClasses['learn-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['top-progress']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['small']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-title']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['continuity-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['learn-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-box']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-head']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-name']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['video-list']} */ ;
/** @type {__VLS_StyleScopedClasses['video-item']} */ ;
/** @type {__VLS_StyleScopedClasses['video-row']} */ ;
/** @type {__VLS_StyleScopedClasses['video-title']} */ ;
/** @type {__VLS_StyleScopedClasses['video-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['player-card']} */ ;
/** @type {__VLS_StyleScopedClasses['player-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['player-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['player-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['video-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-info']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['next-resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['next-resource-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['next-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['next-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-submit']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-top']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-user']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-time']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-submit']} */ ;
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
            detail: detail,
            progress: progress,
            currentVideo: currentVideo,
            currentChapter: currentChapter,
            videoRef: videoRef,
            comments: comments,
            commentText: commentText,
            replyBoxMap: replyBoxMap,
            replyTextMap: replyTextMap,
            currentChapterResourceIndex: currentChapterResourceIndex,
            currentPositionText: currentPositionText,
            previousResource: previousResource,
            nextResource: nextResource,
            resourceProgress: resourceProgress,
            chapterProgress: chapterProgress,
            resourceStatusText: resourceStatusText,
            resourceStatusType: resourceStatusType,
            formatTime: formatTime,
            formatSeconds: formatSeconds,
            load: load,
            selectVideo: selectVideo,
            goPreviousResource: goPreviousResource,
            goNextResource: goNextResource,
            persistCurrentProgress: persistCurrentProgress,
            handleLoadedMetadata: handleLoadedMetadata,
            handleTimeUpdate: handleTimeUpdate,
            handlePause: handlePause,
            handleVideoEnded: handleVideoEnded,
            markCurrentVideoCompleted: markCurrentVideoCompleted,
            submitComment: submitComment,
            toggleReplyBox: toggleReplyBox,
            submitReply: submitReply,
            toggleLikeComment: toggleLikeComment,
            toggleLikeReply: toggleLikeReply,
            goBack: goBack,
            goDetail: goDetail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
