import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getForumPostsApi, getForumSectionsApi, likeForumPostApi, unlikeForumPostApi } from '@/api/forum';
const router = useRouter();
const sections = ref([]);
const list = reactive({
    total: 0,
    records: []
});
const params = reactive({
    current: 1,
    size: 10,
    sectionId: undefined,
    keyword: ''
});
const loadSections = async () => {
    sections.value = await getForumSectionsApi();
};
const load = async () => {
    const res = await getForumPostsApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const changeSection = (sectionId) => {
    params.sectionId = sectionId;
    params.current = 1;
    load();
};
const onPageChange = (page) => {
    params.current = page;
    load();
};
const goDetail = (id) => {
    router.push(`/forum/${id}`);
};
const goPublish = () => {
    router.push('/forum/publish');
};
const toggleLike = async (item) => {
    if (item.liked) {
        await unlikeForumPostApi(item.id);
        item.liked = false;
        item.likeCount = Math.max(0, (item.likeCount || 0) - 1);
        ElMessage.success('已取消点赞');
    }
    else {
        await likeForumPostApi(item.id);
        item.liked = true;
        item.likeCount = (item.likeCount || 0) + 1;
        ElMessage.success('点赞成功');
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
    await loadSections();
    await load();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['forum-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
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
    ...{ style: {} },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索标题或内容",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索标题或内容",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.load)
};
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
    onClick: (__VLS_ctx.load)
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
    onClick: (__VLS_ctx.goPublish)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_24 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    effect: (__VLS_ctx.params.sectionId === undefined ? 'dark' : 'plain'),
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    effect: (__VLS_ctx.params.sectionId === undefined ? 'dark' : 'plain'),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (...[$event]) => {
        __VLS_ctx.changeSection(undefined);
    }
};
__VLS_27.slots.default;
var __VLS_27;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.sections))) {
    const __VLS_32 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        key: (item.id),
        effect: (__VLS_ctx.params.sectionId === item.id ? 'dark' : 'plain'),
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        key: (item.id),
        effect: (__VLS_ctx.params.sectionId === item.id ? 'dark' : 'plain'),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.changeSection(item.id);
        }
    };
    __VLS_35.slots.default;
    (item.name);
    var __VLS_35;
}
if (__VLS_ctx.list.records?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "forum-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "forum-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "forum-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: {} },
        });
        if (item.isTop === 1) {
            const __VLS_40 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                type: "danger",
                round: true,
            }));
            const __VLS_42 = __VLS_41({
                type: "danger",
                round: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            __VLS_43.slots.default;
            var __VLS_43;
        }
        const __VLS_44 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            type: "success",
            round: true,
        }));
        const __VLS_46 = __VLS_45({
            type: "success",
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        (item.sectionName);
        var __VLS_47;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.list.records?.length))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "forum-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
        (__VLS_ctx.formatTime(item.createdAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "forum-user" },
        });
        const __VLS_48 = {}.ElAvatar;
        /** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            size: (34),
            src: (item.userAvatar || ''),
        }));
        const __VLS_50 = __VLS_49({
            size: (34),
            src: (item.userAvatar || ''),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        ((item.userNickname || 'U').slice(0, 1));
        var __VLS_51;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.userNickname || '未知用户');
        const __VLS_52 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            size: "small",
            type: (__VLS_ctx.roleTagType(item.userRole)),
        }));
        const __VLS_54 = __VLS_53({
            size: "small",
            type: (__VLS_ctx.roleTagType(item.userRole)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        (__VLS_ctx.roleText(item.userRole));
        var __VLS_55;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.list.records?.length))
                        return;
                    __VLS_ctx.goDetail(item.id);
                } },
            ...{ class: "forum-content" },
        });
        (item.content || '暂无内容');
        if (item.mediaList?.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "forum-media" },
            });
            for (const [m] of __VLS_getVForSourceType((item.mediaList.slice(0, 3)))) {
                (m.id);
                if (m.mediaType === 'IMAGE') {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (m.mediaUrl),
                        ...{ class: "media-thumb" },
                        alt: "",
                    });
                }
                else {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
                        src: (m.mediaUrl),
                        ...{ class: "media-thumb" },
                        controls: true,
                    });
                }
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "forum-actions" },
        });
        const __VLS_56 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records?.length))
                    return;
                __VLS_ctx.toggleLike(item);
            }
        };
        __VLS_59.slots.default;
        (item.liked ? '❤️' : '🤍');
        (item.likeCount || 0);
        var __VLS_59;
        const __VLS_64 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            ...{ 'onClick': {} },
            text: true,
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_68;
        let __VLS_69;
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.list.records?.length))
                    return;
                __VLS_ctx.goDetail(item.id);
            }
        };
        __VLS_67.slots.default;
        (item.commentCount || 0);
        var __VLS_67;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "meta-text" },
        });
        (item.viewCount || 0);
    }
}
else {
    const __VLS_72 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ class: "page-card" },
        description: "暂无帖子",
    }));
    const __VLS_74 = __VLS_73({
        ...{ class: "page-card" },
        description: "暂无帖子",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_76 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next, total",
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_78 = __VLS_77({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next, total",
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onCurrentChange: (__VLS_ctx.onPageChange)
};
var __VLS_79;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-list']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-card']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-header']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-user']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-content']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-media']} */ ;
/** @type {__VLS_StyleScopedClasses['media-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['media-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['forum-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            sections: sections,
            list: list,
            params: params,
            load: load,
            changeSection: changeSection,
            onPageChange: onPageChange,
            goDetail: goDetail,
            goPublish: goPublish,
            toggleLike: toggleLike,
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
