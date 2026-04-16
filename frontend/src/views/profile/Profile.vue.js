import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadAvatarApi } from '@/api/resource';
import { getMeApi, updateMeApi } from '@/api/user';
import { useAuthStore } from '@/store/auth';
import { normalizeAvatarUrl } from '@/utils/avatar';
const roleMetaMap = {
    STUDENT: {
        label: '学生',
        description: '聚焦课程学习、练习记录和个人成长轨迹。',
        tagType: 'info',
        theme: 'student'
    },
    TEACHER: {
        label: '教师',
        description: '聚焦课程建设、资源管理和班级教学协同。',
        tagType: 'success',
        theme: 'teacher'
    },
    ADMIN: {
        label: '管理员',
        description: '聚焦平台审核、用户治理和全局运营维护。',
        tagType: 'danger',
        theme: 'admin'
    }
};
const auth = useAuthStore();
const uploadingAvatar = ref(false);
const editDialogVisible = ref(false);
const form = reactive({
    nickname: '',
    avatar: '',
    email: '',
    phone: ''
});
const syncForm = (user) => {
    Object.assign(form, {
        id: user?.id,
        userId: user?.userId,
        username: user?.username,
        role: user?.role,
        nickname: user?.nickname || '',
        avatar: normalizeAvatarUrl(user?.avatar),
        email: user?.email || '',
        phone: user?.phone || ''
    });
};
const displayName = computed(() => form.nickname || auth.user?.nickname || auth.user?.username || '未设置昵称');
const displayEmail = computed(() => form.email || auth.user?.email || '');
const displayPhone = computed(() => form.phone || auth.user?.phone || '');
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase());
const roleMeta = computed(() => {
    const role = auth.user?.role || form.role || '';
    return roleMetaMap[role] || {
        label: role || '未知角色',
        description: '当前账号已进入平台，可继续维护个人资料与显示信息。',
        tagType: 'info',
        theme: 'default'
    };
});
const roleText = computed(() => roleMeta.value.label);
const roleDescription = computed(() => roleMeta.value.description);
const roleTagType = computed(() => roleMeta.value.tagType);
const roleThemeClass = computed(() => `theme-${roleMeta.value.theme}`);
const completionItems = computed(() => [
    { label: '头像', ready: !!form.avatar },
    { label: '昵称', ready: !!form.nickname },
    { label: '邮箱', ready: !!displayEmail.value },
    { label: '电话', ready: !!displayPhone.value }
]);
const profileCompleteness = computed(() => {
    const total = completionItems.value.length;
    const readyCount = completionItems.value.filter((item) => item.ready).length;
    return Math.round((readyCount / total) * 100);
});
const boundContactCount = computed(() => [displayEmail.value, displayPhone.value].filter(Boolean).length);
const accountStatusText = computed(() => (auth.isLogin ? '状态正常' : '未登录'));
const accountStatusDescription = computed(() => auth.isLogin
    ? '当前账号处于正常登录状态，主页面以资料卡方式展示，编辑动作则统一收口到弹窗中。'
    : '当前账号未处于登录状态，部分资料显示与账号能力会受到限制。');
const accountHealthText = computed(() => auth.isLogin ? '账号可正常访问当前角色对应功能。' : '需要重新登录后才能继续使用完整功能。');
const completionText = computed(() => {
    if (profileCompleteness.value >= 100)
        return '资料已经齐全，视觉上会呈现完整资料卡效果。';
    if (profileCompleteness.value >= 75)
        return '还差一项资料，完成后整体信息会更完整。';
    return '建议继续补充资料，提升账号卡片的信息完整度。';
});
const contactSummary = computed(() => {
    if (boundContactCount.value === 2)
        return '邮箱和手机号都已完善，通知与联系更稳妥。';
    if (boundContactCount.value === 1)
        return '已完善一种联系方式，建议继续补全另一项。';
    return '尚未完善联系方式，建议补充邮箱或手机号。';
});
const accountIdText = computed(() => {
    const userId = auth.user?.userId ?? auth.user?.id ?? form.userId ?? form.id;
    return userId ? `#${String(userId).padStart(4, '0')}` : '暂未显示';
});
const patchAuthUser = () => {
    auth.patchUser({
        id: form.id,
        userId: form.userId,
        username: form.username,
        nickname: form.nickname,
        role: form.role,
        avatar: form.avatar,
        email: form.email,
        phone: form.phone
    });
};
const persistProfile = async (successMessage) => {
    await updateMeApi(form);
    patchAuthUser();
    ElMessage.success(successMessage);
};
const openEditDialog = () => {
    syncForm({
        ...auth.user,
        ...form
    });
    editDialogVisible.value = true;
};
onMounted(async () => {
    const user = await getMeApi();
    syncForm(user);
    patchAuthUser();
});
const beforeAvatarUpload = (rawFile) => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(rawFile.type);
    if (!isImage) {
        ElMessage.error('头像仅支持 JPG、PNG、GIF、WEBP 格式');
        return false;
    }
    const isLt5M = rawFile.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        ElMessage.error('头像大小不能超过 5MB');
        return false;
    }
    return true;
};
const uploadAvatar = async (options) => {
    try {
        uploadingAvatar.value = true;
        const formData = new FormData();
        formData.append('file', options.file);
        const res = await uploadAvatarApi(formData);
        form.avatar = normalizeAvatarUrl(res.url);
        await persistProfile('头像更新成功');
        options.onSuccess?.(res);
    }
    catch (error) {
        ElMessage.error('头像上传失败，请检查图片格式或稍后重试');
        options.onError?.(error);
    }
    finally {
        uploadingAvatar.value = false;
    }
};
const save = async () => {
    await persistProfile('保存成功');
    editDialogVisible.value = false;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__meta']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-panel__head']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-ready']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__meta']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-items']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-stack profile-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "page-card profile-sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__glow" },
});
const __VLS_0 = {}.ElAvatar;
/** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: (108),
    src: (__VLS_ctx.form.avatar || undefined),
    ...{ class: "profile-avatar" },
}));
const __VLS_2 = __VLS_1({
    size: (108),
    src: (__VLS_ctx.form.avatar || undefined),
    ...{ class: "profile-avatar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
(__VLS_ctx.avatarText);
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__name" },
});
(__VLS_ctx.displayName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__username" },
});
(__VLS_ctx.auth.user?.username || 'user');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__chips" },
});
const __VLS_4 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    round: true,
    effect: "light",
    type: (__VLS_ctx.roleTagType),
}));
const __VLS_6 = __VLS_5({
    round: true,
    effect: "light",
    type: (__VLS_ctx.roleTagType),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
(__VLS_ctx.roleText);
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "profile-state-badge" },
});
(__VLS_ctx.accountStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__note" },
});
(__VLS_ctx.roleDescription);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-card__actions" },
});
const __VLS_8 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "avatar-uploader" },
    accept: "image/png,image/jpeg,image/gif,image/webp",
    showFileList: (false),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    httpRequest: (__VLS_ctx.uploadAvatar),
}));
const __VLS_10 = __VLS_9({
    ...{ class: "avatar-uploader" },
    accept: "image/png,image/jpeg,image/gif,image/webp",
    showFileList: (false),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
    httpRequest: (__VLS_ctx.uploadAvatar),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    plain: true,
    loading: (__VLS_ctx.uploadingAvatar),
}));
const __VLS_14 = __VLS_13({
    plain: true,
    loading: (__VLS_ctx.uploadingAvatar),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
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
    onClick: (__VLS_ctx.openEditDialog)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-card profile-overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "split-header profile-overview__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "completion-chip" },
});
(__VLS_ctx.profileCompleteness);
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.openEditDialog)
};
__VLS_27.slots.default;
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-hero" },
    ...{ class: (__VLS_ctx.roleThemeClass) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-hero__eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-hero__title" },
});
(__VLS_ctx.roleText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-hero__desc" },
});
(__VLS_ctx.accountStatusDescription);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-hero__meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.accountIdText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.auth.isLogin ? '已登录' : '未登录');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.boundContactCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metrics" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__value" },
});
(__VLS_ctx.roleText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__desc" },
});
(__VLS_ctx.roleDescription);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__value" },
});
(__VLS_ctx.accountStatusText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__desc" },
});
(__VLS_ctx.accountHealthText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__value" },
});
(__VLS_ctx.profileCompleteness);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-metric__desc" },
});
(__VLS_ctx.completionText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-content-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.auth.user?.username || '未设置');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.form.nickname || '未设置昵称');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.displayEmail || '未绑定邮箱');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.displayPhone || '未绑定手机号');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completion-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completion-panel__head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.profileCompleteness);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completion-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "completion-bar__fill" },
    ...{ style: ({ width: `${__VLS_ctx.profileCompleteness}%` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completion-items" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.completionItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "completion-item" },
        ...{ class: ({ 'is-ready': item.ready }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.ready ? '已完成' : '待补充');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "completion-note" },
});
(__VLS_ctx.contactSummary);
const __VLS_32 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.editDialogVisible),
    title: "信息修改",
    width: "620px",
    ...{ class: "profile-edit-dialog" },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.editDialogVisible),
    title: "信息修改",
    width: "620px",
    ...{ class: "profile-edit-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
    ...{ class: "profile-edit-form" },
}));
const __VLS_38 = __VLS_37({
    model: (__VLS_ctx.form),
    labelWidth: "90px",
    ...{ class: "profile-edit-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-grid" },
});
const __VLS_40 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "用户名",
}));
const __VLS_42 = __VLS_41({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.auth.user?.username),
    disabled: true,
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.auth.user?.username),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "昵称",
}));
const __VLS_50 = __VLS_49({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.form.nickname),
    placeholder: "请输入昵称",
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.form.nickname),
    placeholder: "请输入昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "邮箱",
}));
const __VLS_58 = __VLS_57({
    label: "邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.form.email),
    placeholder: "请输入邮箱",
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.form.email),
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "电话",
}));
const __VLS_66 = __VLS_65({
    label: "电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.form.phone),
    placeholder: "请输入手机号",
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.form.phone),
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
var __VLS_39;
{
    const { footer: __VLS_thisSlot } = __VLS_35.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-actions" },
    });
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editDialogVisible = false;
        }
    };
    __VLS_75.slots.default;
    var __VLS_75;
    const __VLS_80 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_83.slots.default;
    var __VLS_83;
}
var __VLS_35;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__glow']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__name']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__username']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__chips']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-state-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__note']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-overview__header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__title']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-hero__meta']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metrics']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__label']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__value']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__label']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__value']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__label']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__value']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-metric__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['info-list']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-panel__head']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-bar__fill']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-items']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-item']} */ ;
/** @type {__VLS_StyleScopedClasses['completion-note']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-edit-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            auth: auth,
            uploadingAvatar: uploadingAvatar,
            editDialogVisible: editDialogVisible,
            form: form,
            displayName: displayName,
            displayEmail: displayEmail,
            displayPhone: displayPhone,
            avatarText: avatarText,
            roleText: roleText,
            roleDescription: roleDescription,
            roleTagType: roleTagType,
            roleThemeClass: roleThemeClass,
            completionItems: completionItems,
            profileCompleteness: profileCompleteness,
            boundContactCount: boundContactCount,
            accountStatusText: accountStatusText,
            accountStatusDescription: accountStatusDescription,
            accountHealthText: accountHealthText,
            completionText: completionText,
            contactSummary: contactSummary,
            accountIdText: accountIdText,
            openEditDialog: openEditDialog,
            beforeAvatarUpload: beforeAvatarUpload,
            uploadAvatar: uploadAvatar,
            save: save,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
