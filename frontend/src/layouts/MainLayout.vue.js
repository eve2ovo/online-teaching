import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUnreadNotificationCountApi } from '@/api/notification';
import { useAuthStore } from '@/store/auth';
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const unreadCount = ref(0);
let unreadTimer = null;
let unreadLoadErrorShown = false;
const roleText = computed(() => {
    if (auth.role === 'STUDENT')
        return '学生端';
    if (auth.role === 'TEACHER')
        return '教师端';
    if (auth.role === 'ADMIN')
        return '管理员端';
    return '未登录';
});
const currentTitle = computed(() => String(route.meta?.title || '在线学习平台'));
const activeMenu = computed(() => String(route.meta?.activeMenu || route.path));
const userInitial = computed(() => (auth.user?.nickname || auth.user?.username || 'U').slice(0, 1).toUpperCase());
const loadUnreadCount = async () => {
    if (!auth.isLogin) {
        unreadCount.value = 0;
        return;
    }
    try {
        const res = await getUnreadNotificationCountApi();
        unreadCount.value = res.count || 0;
        unreadLoadErrorShown = false;
    }
    catch {
        unreadCount.value = 0;
        if (!unreadLoadErrorShown) {
            unreadLoadErrorShown = true;
            ElMessage.warning('通知中心暂时不可用，请确认后端通知表已初始化');
        }
    }
};
const goNotifications = () => {
    router.push('/notifications');
};
const handleNotificationUpdated = () => {
    loadUnreadCount();
};
const logout = () => {
    auth.logout();
    router.push('/login');
};
onMounted(() => {
    loadUnreadCount();
    unreadTimer = window.setInterval(() => {
        loadUnreadCount();
    }, 30000);
    window.addEventListener('notification-updated', handleNotificationUpdated);
});
watch(() => route.fullPath, () => {
    loadUnreadCount();
});
onBeforeUnmount(() => {
    if (unreadTimer) {
        window.clearInterval(unreadTimer);
    }
    window.removeEventListener('notification-updated', handleNotificationUpdated);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['side-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['side-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['shell']} */ ;
/** @type {__VLS_StyleScopedClasses['sider']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-user']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sider soft-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-sub" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-user" },
});
const __VLS_0 = {}.ElAvatar;
/** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: (52),
    src: (__VLS_ctx.auth.user?.avatar || undefined),
    ...{ class: "welcome-avatar" },
}));
const __VLS_2 = __VLS_1({
    size: (52),
    src: (__VLS_ctx.auth.user?.avatar || undefined),
    ...{ class: "welcome-avatar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.userInitial);
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-name" },
});
(__VLS_ctx.roleText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc welcome-sub" },
});
(__VLS_ctx.auth.user?.nickname || __VLS_ctx.auth.user?.username || '未登录用户');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-heading" },
});
const __VLS_4 = {}.ElMenu;
/** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    defaultActive: (__VLS_ctx.activeMenu),
    router: true,
    ...{ class: "side-menu" },
    backgroundColor: "transparent",
    textColor: "#334155",
    activeTextColor: "#0f172a",
}));
const __VLS_6 = __VLS_5({
    defaultActive: (__VLS_ctx.activeMenu),
    router: true,
    ...{ class: "side-menu" },
    backgroundColor: "transparent",
    textColor: "#334155",
    activeTextColor: "#0f172a",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElMenuItem;
/** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    index: "/profile",
}));
const __VLS_10 = __VLS_9({
    index: "/profile",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
if (__VLS_ctx.auth.role === 'STUDENT') {
    const __VLS_12 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        index: "/student/home",
    }));
    const __VLS_14 = __VLS_13({
        index: "/student/home",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
    const __VLS_16 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        index: "/student/learning",
    }));
    const __VLS_18 = __VLS_17({
        index: "/student/learning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_20 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        index: "/student/practices",
    }));
    const __VLS_22 = __VLS_21({
        index: "/student/practices",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
    const __VLS_24 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        index: "/student/practice-records",
    }));
    const __VLS_26 = __VLS_25({
        index: "/student/practice-records",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_28 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        index: "/student/practice-review",
    }));
    const __VLS_30 = __VLS_29({
        index: "/student/practice-review",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
}
if (__VLS_ctx.auth.role === 'TEACHER') {
    const __VLS_32 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        index: "/teacher/courses",
    }));
    const __VLS_34 = __VLS_33({
        index: "/teacher/courses",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    var __VLS_35;
    const __VLS_36 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        index: "/teacher/applications",
    }));
    const __VLS_38 = __VLS_37({
        index: "/teacher/applications",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    var __VLS_39;
    const __VLS_40 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        index: "/teacher/questions",
    }));
    const __VLS_42 = __VLS_41({
        index: "/teacher/questions",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    var __VLS_43;
    const __VLS_44 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        index: "/teacher/practices",
    }));
    const __VLS_46 = __VLS_45({
        index: "/teacher/practices",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    var __VLS_47;
    const __VLS_48 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        index: "/teacher/practice-stats",
    }));
    const __VLS_50 = __VLS_49({
        index: "/teacher/practice-stats",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    var __VLS_51;
}
if (__VLS_ctx.auth.role === 'ADMIN') {
    const __VLS_52 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        index: "/admin/courses",
    }));
    const __VLS_54 = __VLS_53({
        index: "/admin/courses",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_56 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        index: "/admin/users",
    }));
    const __VLS_58 = __VLS_57({
        index: "/admin/users",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_60 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        index: "/admin/course-manage",
    }));
    const __VLS_62 = __VLS_61({
        index: "/admin/course-manage",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    var __VLS_63;
    const __VLS_64 = {}.ElMenuItem;
    /** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        index: "/admin/forum",
    }));
    const __VLS_66 = __VLS_65({
        index: "/admin/forum",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    var __VLS_67;
}
const __VLS_68 = {}.ElMenuItem;
/** @type {[typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    index: "/forum",
}));
const __VLS_70 = __VLS_69({
    index: "/forum",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sider-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "footer-title" },
});
(__VLS_ctx.currentTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar-title" },
});
(__VLS_ctx.currentTitle);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-text topbar-sub" },
});
(__VLS_ctx.auth.user?.nickname || __VLS_ctx.auth.user?.username);
(__VLS_ctx.roleText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "topbar-actions" },
});
const __VLS_72 = {}.ElBadge;
/** @type {[typeof __VLS_components.ElBadge, typeof __VLS_components.elBadge, typeof __VLS_components.ElBadge, typeof __VLS_components.elBadge, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: (__VLS_ctx.unreadCount),
    hidden: (__VLS_ctx.unreadCount === 0),
    ...{ class: "notification-trigger" },
}));
const __VLS_74 = __VLS_73({
    value: (__VLS_ctx.unreadCount),
    hidden: (__VLS_ctx.unreadCount === 0),
    ...{ class: "notification-trigger" },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
    plain: true,
    ...{ class: "notification-button" },
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
    plain: true,
    ...{ class: "notification-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onClick: (__VLS_ctx.goNotifications)
};
__VLS_79.slots.default;
var __VLS_79;
var __VLS_75;
const __VLS_84 = {}.ElAvatar;
/** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    size: (40),
    src: (__VLS_ctx.auth.user?.avatar || undefined),
    ...{ class: "topbar-avatar" },
}));
const __VLS_86 = __VLS_85({
    size: (40),
    src: (__VLS_ctx.auth.user?.avatar || undefined),
    ...{ class: "topbar-avatar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
(__VLS_ctx.userInitial);
var __VLS_87;
const __VLS_88 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    type: "info",
    round: true,
}));
const __VLS_90 = __VLS_89({
    type: "info",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
(__VLS_ctx.roleText);
var __VLS_91;
const __VLS_92 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    type: "danger",
    plain: true,
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    type: "danger",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.logout)
};
__VLS_95.slots.default;
var __VLS_95;
const __VLS_100 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
/** @type {__VLS_StyleScopedClasses['shell']} */ ;
/** @type {__VLS_StyleScopedClasses['sider']} */ ;
/** @type {__VLS_StyleScopedClasses['soft-card']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-card']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-user']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-name']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-section']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['side-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['sider-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-button']} */ ;
/** @type {__VLS_StyleScopedClasses['topbar-avatar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            auth: auth,
            unreadCount: unreadCount,
            roleText: roleText,
            currentTitle: currentTitle,
            activeMenu: activeMenu,
            userInitial: userInitial,
            goNotifications: goNotifications,
            logout: logout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
