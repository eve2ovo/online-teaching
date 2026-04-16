import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getMyNotificationsApi, getUnreadNotificationCountApi, markAllNotificationsReadApi, markNotificationReadApi } from '@/api/notification';
const params = reactive({
    current: 1,
    size: 10
});
const list = reactive({
    total: 0,
    records: []
});
const unreadCount = ref(0);
const emitNotificationUpdated = () => {
    window.dispatchEvent(new Event('notification-updated'));
};
const loadUnreadCount = async () => {
    const res = await getUnreadNotificationCountApi();
    unreadCount.value = res.count || 0;
};
const load = async () => {
    const res = await getMyNotificationsApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
    await loadUnreadCount();
};
const markRead = async (id) => {
    await markNotificationReadApi(id);
    ElMessage.success('已标记为已读');
    await load();
    emitNotificationUpdated();
};
const markAllRead = async () => {
    await markAllNotificationsReadApi();
    ElMessage.success('全部通知已标记为已读');
    await load();
    emitNotificationUpdated();
};
const typeText = (type) => ({
    COURSE_QA: '课程问答',
    COURSE_AUDIT: '课程审核',
    COURSE_APPLICATION: '选课申请',
    COURSE_REMOVAL: '移出课程',
    FORUM_INTERACTION: '论坛互动'
}[type] || type);
const typeTag = (type) => ({
    COURSE_QA: 'primary',
    COURSE_AUDIT: 'warning',
    COURSE_APPLICATION: 'warning',
    COURSE_REMOVAL: 'danger',
    FORUM_INTERACTION: 'success'
}[type] || 'info');
const formatTime = (value) => {
    if (!value)
        return '-';
    return value.replace('T', ' ').slice(0, 19);
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['notification-card']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-head']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "notification-page" },
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
const __VLS_0 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    round: true,
    type: "info",
}));
const __VLS_2 = __VLS_1({
    round: true,
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.unreadCount);
var __VLS_3;
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.load)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (__VLS_ctx.unreadCount === 0),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (__VLS_ctx.unreadCount === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.markAllRead)
};
__VLS_15.slots.default;
var __VLS_15;
if (__VLS_ctx.list.records.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "notification-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list.records))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "notification-card" },
            ...{ class: ({ unread: item.isRead === 0 }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-title-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-title" },
        });
        (item.title);
        const __VLS_20 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            type: (__VLS_ctx.typeTag(item.type)),
            size: "small",
        }));
        const __VLS_22 = __VLS_21({
            type: (__VLS_ctx.typeTag(item.type)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        (__VLS_ctx.typeText(item.type));
        var __VLS_23;
        if (item.isRead === 0) {
            const __VLS_24 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                type: "danger",
                size: "small",
            }));
            const __VLS_26 = __VLS_25({
                type: "danger",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            __VLS_27.slots.default;
            var __VLS_27;
        }
        else {
            const __VLS_28 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                size: "small",
            }));
            const __VLS_30 = __VLS_29({
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            __VLS_31.slots.default;
            var __VLS_31;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
        (__VLS_ctx.formatTime(item.createdAt));
        if (item.isRead === 0) {
            const __VLS_32 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                ...{ 'onClick': {} },
                type: "primary",
                link: true,
            }));
            const __VLS_34 = __VLS_33({
                ...{ 'onClick': {} },
                type: "primary",
                link: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
            let __VLS_36;
            let __VLS_37;
            let __VLS_38;
            const __VLS_39 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.list.records.length))
                        return;
                    if (!(item.isRead === 0))
                        return;
                    __VLS_ctx.markRead(item.id);
                }
            };
            __VLS_35.slots.default;
            var __VLS_35;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-content" },
        });
        (item.content);
    }
}
else {
    const __VLS_40 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        description: "暂无通知",
    }));
    const __VLS_42 = __VLS_41({
        description: "暂无通知",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination-row" },
});
const __VLS_44 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    background: true,
    layout: "total, prev, pager, next",
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onCurrentChange: (__VLS_ctx.load)
};
var __VLS_47;
/** @type {__VLS_StyleScopedClasses['notification-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-list']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-card']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-head']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-content']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            params: params,
            list: list,
            unreadCount: unreadCount,
            load: load,
            markRead: markRead,
            markAllRead: markAllRead,
            typeText: typeText,
            typeTag: typeTag,
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
