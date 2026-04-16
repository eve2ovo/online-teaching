import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { createForumCommentApi, deleteForumCommentApi, deleteForumPostApi, getForumCommentsApi, getForumPostDetailApi, likeForumCommentApi, likeForumPostApi, unlikeForumCommentApi, unlikeForumPostApi } from '@/api/forum';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const postId = Number(route.params.id);
const post = reactive({});
const comments = ref([]);
const commentForm = reactive({
    content: ''
});
const replyingId = ref(null);
const replyContent = ref('');
const currentUserId = computed(() => Number(auth.user?.userId || auth.user?.id || 0));
const currentUserRole = computed(() => auth.user?.role || '');
const canDelete = (creatorId) => {
    if (!creatorId || !currentUserId.value)
        return false;
    return currentUserId.value === Number(creatorId) || currentUserRole.value === 'ADMIN';
};
const loadDetail = async () => {
    const res = await getForumPostDetailApi(postId);
    console.log('当前登录用户 auth.user =', auth.user);
    console.log('currentUserId =', currentUserId.value);
    console.log('帖子详情 res =', res);
    console.log('post.userId =', res?.userId);
    Object.assign(post, res);
};
const loadComments = async () => {
    const res = await getForumCommentsApi(postId);
    console.log('评论列表 res =', res);
    if (res?.length) {
        console.log('一级评论第一个 userId =', res[0]?.userId);
        console.log('一级评论 children =', res[0]?.children);
    }
    comments.value = res;
};
const submitComment = async () => {
    if (!commentForm.content.trim()) {
        ElMessage.warning('请输入评论内容');
        return;
    }
    await createForumCommentApi({
        postId,
        parentId: null,
        replyUserId: null,
        content: commentForm.content
    });
    commentForm.content = '';
    ElMessage.success('评论成功');
    await loadComments();
    await loadDetail();
};
const openReply = (item) => {
    replyingId.value = item.id;
    replyContent.value = '';
};
const cancelReply = () => {
    replyingId.value = null;
    replyContent.value = '';
};
const submitReply = async (item) => {
    if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容');
        return;
    }
    await createForumCommentApi({
        postId,
        parentId: item.id,
        replyUserId: item.userId,
        content: replyContent.value
    });
    ElMessage.success('回复成功');
    cancelReply();
    await loadComments();
    await loadDetail();
};
const togglePostLike = async () => {
    if (post.liked) {
        await unlikeForumPostApi(postId);
        post.liked = false;
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
    }
    else {
        await likeForumPostApi(postId);
        post.liked = true;
        post.likeCount = (post.likeCount || 0) + 1;
    }
};
const toggleCommentLike = async (item) => {
    if (item.liked) {
        await unlikeForumCommentApi(item.id);
        item.liked = false;
        item.likeCount = Math.max(0, (item.likeCount || 0) - 1);
    }
    else {
        await likeForumCommentApi(item.id);
        item.liked = true;
        item.likeCount = (item.likeCount || 0) + 1;
    }
};
const handleDeletePost = async () => {
    try {
        await ElMessageBox.confirm('确定删除这篇帖子吗？删除后不可恢复。', '提示', {
            type: 'warning'
        });
        await deleteForumPostApi(postId);
        ElMessage.success('删除成功');
        router.push('/forum');
    }
    catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElMessage.error('删除失败');
        }
    }
};
const handleDeleteComment = async (commentId) => {
    try {
        await ElMessageBox.confirm('确定删除这条评论吗？删除后不可恢复。', '提示', {
            type: 'warning'
        });
        await deleteForumCommentApi(commentId);
        ElMessage.success('删除成功');
        await loadComments();
        await loadDetail();
    }
    catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElMessage.error('删除失败');
        }
    }
};
const roleText = (role) => {
    if (role === 'STUDENT')
        return '学生';
    if (role === 'TEACHER')
        return '老师';
    if (role === 'ADMIN')
        return '管理员';
    return role || '未知';
};
const roleTagType = (role) => {
    if (role === 'STUDENT')
        return 'info';
    if (role === 'TEACHER')
        return 'success';
    if (role === 'ADMIN')
        return 'danger';
    return '';
};
const formatTime = (value) => {
    if (!value)
        return '';
    return value.replace('T', ' ').slice(0, 16);
};
onMounted(async () => {
    await loadDetail();
    await loadComments();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
if (__VLS_ctx.post.id) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    if (__VLS_ctx.post.isTop === 1) {
        const __VLS_0 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            type: "danger",
            round: true,
        }));
        const __VLS_2 = __VLS_1({
            type: "danger",
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        var __VLS_3;
    }
    const __VLS_4 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "success",
        round: true,
    }));
    const __VLS_6 = __VLS_5({
        type: "success",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.post.sectionName);
    var __VLS_7;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
        ...{ style: {} },
    });
    (__VLS_ctx.post.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "post-user" },
    });
    const __VLS_8 = {}.ElAvatar;
    /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        size: (36),
        src: (__VLS_ctx.post.userAvatar || ''),
    }));
    const __VLS_10 = __VLS_9({
        size: (36),
        src: (__VLS_ctx.post.userAvatar || ''),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    ((__VLS_ctx.post.userNickname || 'U').slice(0, 1));
    var __VLS_11;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.post.userNickname || '未知用户');
    const __VLS_12 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        size: "small",
        type: (__VLS_ctx.roleTagType(__VLS_ctx.post.userRole)),
    }));
    const __VLS_14 = __VLS_13({
        size: "small",
        type: (__VLS_ctx.roleTagType(__VLS_ctx.post.userRole)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.roleText(__VLS_ctx.post.userRole));
    var __VLS_15;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-text" },
    });
    (__VLS_ctx.formatTime(__VLS_ctx.post.createdAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_16 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.post.id))
                return;
            __VLS_ctx.router.push('/forum');
        }
    };
    __VLS_19.slots.default;
    var __VLS_19;
    if (__VLS_ctx.canDelete(__VLS_ctx.post.userId)) {
        const __VLS_24 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_28;
        let __VLS_29;
        let __VLS_30;
        const __VLS_31 = {
            onClick: (__VLS_ctx.handleDeletePost)
        };
        __VLS_27.slots.default;
        var __VLS_27;
    }
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.togglePostLike)
    };
    __VLS_35.slots.default;
    (__VLS_ctx.post.liked ? '❤️' : '🤍');
    (__VLS_ctx.post.likeCount || 0);
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "post-content" },
    });
    (__VLS_ctx.post.content || '(暂无内容)');
    if (__VLS_ctx.post.mediaList?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "post-media" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.post.mediaList))) {
            (item.id);
            if (item.mediaType === 'IMAGE') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (item.mediaUrl),
                    ...{ class: "detail-img" },
                    alt: "",
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
                    src: (item.mediaUrl),
                    ...{ class: "detail-video" },
                    controls: true,
                });
            }
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_40 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.commentForm.content),
    type: "textarea",
    rows: (4),
    placeholder: "写下你的评论...",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.commentForm.content),
    type: "textarea",
    rows: (4),
    placeholder: "写下你的评论...",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_44 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.submitComment)
};
__VLS_47.slots.default;
var __VLS_47;
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
            ...{ style: {} },
        });
        const __VLS_52 = {}.ElAvatar;
        /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            size: (32),
            src: (item.userAvatar || ''),
        }));
        const __VLS_54 = __VLS_53({
            size: (32),
            src: (item.userAvatar || ''),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        ((item.userNickname || 'U').slice(0, 1));
        var __VLS_55;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.userNickname);
        const __VLS_56 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            size: "small",
            type: (__VLS_ctx.roleTagType(item.userRole)),
        }));
        const __VLS_58 = __VLS_57({
            size: "small",
            type: (__VLS_ctx.roleTagType(item.userRole)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        __VLS_59.slots.default;
        (__VLS_ctx.roleText(item.userRole));
        var __VLS_59;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "meta-text" },
        });
        (__VLS_ctx.formatTime(item.createdAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comment-content" },
        });
        (item.content);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "comment-actions" },
        });
        const __VLS_60 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_62 = __VLS_61({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_64;
        let __VLS_65;
        let __VLS_66;
        const __VLS_67 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.comments.length))
                    return;
                __VLS_ctx.toggleCommentLike(item);
            }
        };
        __VLS_63.slots.default;
        (item.liked ? '❤️' : '🤍');
        (item.likeCount || 0);
        var __VLS_63;
        const __VLS_68 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.comments.length))
                    return;
                __VLS_ctx.openReply(item);
            }
        };
        __VLS_71.slots.default;
        var __VLS_71;
        if (__VLS_ctx.canDelete(item.userId)) {
            const __VLS_76 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                ...{ 'onClick': {} },
                text: true,
                type: "danger",
            }));
            const __VLS_78 = __VLS_77({
                ...{ 'onClick': {} },
                text: true,
                type: "danger",
            }, ...__VLS_functionalComponentArgsRest(__VLS_77));
            let __VLS_80;
            let __VLS_81;
            let __VLS_82;
            const __VLS_83 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.comments.length))
                        return;
                    if (!(__VLS_ctx.canDelete(item.userId)))
                        return;
                    __VLS_ctx.handleDeleteComment(item.id);
                }
            };
            __VLS_79.slots.default;
            var __VLS_79;
        }
        if (__VLS_ctx.replyingId === item.id) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "reply-box" },
            });
            const __VLS_84 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                modelValue: (__VLS_ctx.replyContent),
                type: "textarea",
                rows: (3),
                placeholder: "请输入回复内容",
            }));
            const __VLS_86 = __VLS_85({
                modelValue: (__VLS_ctx.replyContent),
                type: "textarea",
                rows: (3),
                placeholder: "请输入回复内容",
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ style: {} },
            });
            const __VLS_88 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                ...{ 'onClick': {} },
            }));
            const __VLS_90 = __VLS_89({
                ...{ 'onClick': {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_89));
            let __VLS_92;
            let __VLS_93;
            let __VLS_94;
            const __VLS_95 = {
                onClick: (__VLS_ctx.cancelReply)
            };
            __VLS_91.slots.default;
            var __VLS_91;
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
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.comments.length))
                        return;
                    if (!(__VLS_ctx.replyingId === item.id))
                        return;
                    __VLS_ctx.submitReply(item);
                }
            };
            __VLS_99.slots.default;
            var __VLS_99;
        }
        if (item.children?.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "child-list" },
            });
            for (const [child] of __VLS_getVForSourceType((item.children))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (child.id),
                    ...{ class: "child-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "child-user" },
                });
                (child.userNickname);
                const __VLS_104 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                    size: "small",
                    type: (__VLS_ctx.roleTagType(child.userRole)),
                }));
                const __VLS_106 = __VLS_105({
                    size: "small",
                    type: (__VLS_ctx.roleTagType(child.userRole)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_105));
                __VLS_107.slots.default;
                (__VLS_ctx.roleText(child.userRole));
                var __VLS_107;
                if (child.replyUserNickname) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "meta-text" },
                    });
                    (child.replyUserNickname);
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "meta-text" },
                });
                (__VLS_ctx.formatTime(child.createdAt));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                (child.content);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                const __VLS_108 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                    ...{ 'onClick': {} },
                    text: true,
                }));
                const __VLS_110 = __VLS_109({
                    ...{ 'onClick': {} },
                    text: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_109));
                let __VLS_112;
                let __VLS_113;
                let __VLS_114;
                const __VLS_115 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.comments.length))
                            return;
                        if (!(item.children?.length))
                            return;
                        __VLS_ctx.toggleCommentLike(child);
                    }
                };
                __VLS_111.slots.default;
                (child.liked ? '❤️' : '🤍');
                (child.likeCount || 0);
                var __VLS_111;
                if (__VLS_ctx.canDelete(child.userId)) {
                    const __VLS_116 = {}.ElButton;
                    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
                        ...{ 'onClick': {} },
                        text: true,
                        type: "danger",
                    }));
                    const __VLS_118 = __VLS_117({
                        ...{ 'onClick': {} },
                        text: true,
                        type: "danger",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
                    let __VLS_120;
                    let __VLS_121;
                    let __VLS_122;
                    const __VLS_123 = {
                        onClick: (...[$event]) => {
                            if (!(__VLS_ctx.comments.length))
                                return;
                            if (!(item.children?.length))
                                return;
                            if (!(__VLS_ctx.canDelete(child.userId)))
                                return;
                            __VLS_ctx.handleDeleteComment(child.id);
                        }
                    };
                    __VLS_119.slots.default;
                    var __VLS_119;
                }
            }
        }
    }
}
else {
    const __VLS_124 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        description: "还没有评论，快来抢沙发吧",
    }));
    const __VLS_126 = __VLS_125({
        description: "还没有评论，快来抢沙发吧",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
}
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['post-user']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['post-content']} */ ;
/** @type {__VLS_StyleScopedClasses['post-media']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-img']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-video']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-box']} */ ;
/** @type {__VLS_StyleScopedClasses['child-list']} */ ;
/** @type {__VLS_StyleScopedClasses['child-item']} */ ;
/** @type {__VLS_StyleScopedClasses['child-user']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            post: post,
            comments: comments,
            commentForm: commentForm,
            replyingId: replyingId,
            replyContent: replyContent,
            canDelete: canDelete,
            submitComment: submitComment,
            openReply: openReply,
            cancelReply: cancelReply,
            submitReply: submitReply,
            togglePostLike: togglePostLike,
            toggleCommentLike: toggleCommentLike,
            handleDeletePost: handleDeletePost,
            handleDeleteComment: handleDeleteComment,
            roleText: roleText,
            roleTagType: roleTagType,
            formatTime: formatTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
