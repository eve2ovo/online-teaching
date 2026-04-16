import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { getCategoriesApi } from '@/api/category';
import { resetPasswordApi } from '@/api/auth';
const router = useRouter();
const auth = useAuthStore();
const activeTab = ref('login');
const categoryOptions = ref([]);
const loginLoading = ref(false);
const registerLoading = ref(false);
const resetLoading = ref(false);
const particleCanvas = ref(null);
const shellRef = ref(null);
const pointerX = ref(0.5);
const pointerY = ref(0.5);
let animationFrameId = 0;
let resizeHandler = null;
const demoAccounts = [
    { label: '管理员test', username: 'admin', password: '123456' },
    { label: '教师test', username: 'teacher1', password: '123456' },
    { label: '学生test', username: 'stu1', password: '123456' }
];
const loginForm = reactive({
    username: 'admin',
    password: '123456'
});
const resetDialogVisible = ref(false);
const resetForm = reactive({
    username: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
});
const registerForm = reactive({
    username: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    majorDirection: '',
    interestTags: '',
    email: '',
    phone: ''
});
const shellGradientStyle = computed(() => ({
    transform: `translate(${(pointerX.value - 0.5) * 80}px, ${(pointerY.value - 0.5) * 80}px)`
}));
const brandFloatStyle = computed(() => ({
    transform: `translate(${(pointerX.value - 0.5) * 16}px, ${(pointerY.value - 0.5) * 16}px)`
}));
const resetRegisterForm = () => {
    registerForm.username = '';
    registerForm.nickname = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
    registerForm.majorDirection = '';
    registerForm.interestTags = '';
    registerForm.email = '';
    registerForm.phone = '';
};
const resetResetForm = () => {
    resetForm.username = '';
    resetForm.phone = '';
    resetForm.newPassword = '';
    resetForm.confirmPassword = '';
};
const fillDemoAccount = (account) => {
    activeTab.value = 'login';
    loginForm.username = account.username;
    loginForm.password = account.password;
    ElMessage.success(`已填充${account.label}`);
};
const handleShellMouseMove = (event) => {
    if (!shellRef.value)
        return;
    const rect = shellRef.value.getBoundingClientRect();
    pointerX.value = (event.clientX - rect.left) / rect.width;
    pointerY.value = (event.clientY - rect.top) / rect.height;
};
const handleShellMouseLeave = () => {
    pointerX.value = 0.5;
    pointerY.value = 0.5;
};
const openResetDialog = () => {
    resetForm.username = loginForm.username || '';
    resetDialogVisible.value = true;
};
const initParticleScene = () => {
    const canvas = particleCanvas.value;
    const shell = shellRef.value;
    if (!canvas || !shell)
        return;
    const context = canvas.getContext('2d');
    if (!context)
        return;
    let width = 0;
    let height = 0;
    let particles = [];
    const resizeCanvas = () => {
        width = shell.clientWidth;
        height = shell.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.max(40, Math.min(96, Math.floor((width * height) / 20000)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 1 + Math.random() * 2.2,
            alpha: 0.2 + Math.random() * 0.4
        }));
    };
    const render = () => {
        context.clearRect(0, 0, width, height);
        const driftX = (pointerX.value - 0.5) * 0.36;
        const driftY = (pointerY.value - 0.5) * 0.36;
        for (const particle of particles) {
            particle.x += particle.vx + driftX;
            particle.y += particle.vy + driftY;
            if (particle.x < -24)
                particle.x = width + 24;
            if (particle.x > width + 24)
                particle.x = -24;
            if (particle.y < -24)
                particle.y = height + 24;
            if (particle.y > height + 24)
                particle.y = -24;
        }
        for (let i = 0; i < particles.length; i += 1) {
            const a = particles[i];
            context.beginPath();
            context.fillStyle = `rgba(226, 232, 240, ${a.alpha})`;
            context.arc(a.x, a.y, a.size, 0, Math.PI * 2);
            context.fill();
            for (let j = i + 1; j < particles.length; j += 1) {
                const b = particles[j];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance > 138)
                    continue;
                context.beginPath();
                context.strokeStyle = `rgba(110, 231, 255, ${(1 - distance / 138) * 0.16})`;
                context.lineWidth = 1;
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            }
        }
        animationFrameId = window.requestAnimationFrame(render);
    };
    resizeCanvas();
    render();
    resizeHandler = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);
};
const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        ElMessage.warning('请输入用户名和密码');
        return;
    }
    loginLoading.value = true;
    try {
        await auth.login(loginForm);
        ElMessage.success('登录成功');
        if (auth.role === 'STUDENT')
            router.push('/student/home');
        else if (auth.role === 'TEACHER')
            router.push('/teacher/courses');
        else
            router.push('/admin/courses');
    }
    finally {
        loginLoading.value = false;
    }
};
const handleRegister = async () => {
    if (!registerForm.username || !registerForm.nickname || !registerForm.password) {
        ElMessage.warning('请先完成用户名、昵称和密码');
        return;
    }
    if (!registerForm.majorDirection) {
        ElMessage.warning('请选择专业方向');
        return;
    }
    if (!registerForm.interestTags.trim()) {
        ElMessage.warning('请输入兴趣标签');
        return;
    }
    if (!registerForm.phone) {
        ElMessage.warning('请输入手机号');
        return;
    }
    if (registerForm.password.length < 6) {
        ElMessage.warning('密码长度不能少于 6 位');
        return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
        ElMessage.warning('两次输入的密码不一致');
        return;
    }
    registerLoading.value = true;
    try {
        await auth.register({
            username: registerForm.username,
            nickname: registerForm.nickname,
            password: registerForm.password,
            majorDirection: registerForm.majorDirection,
            interestTags: registerForm.interestTags,
            email: registerForm.email,
            phone: registerForm.phone
        });
        ElMessage.success('注册成功，请使用新账号登录');
        loginForm.username = registerForm.username;
        loginForm.password = registerForm.password;
        resetRegisterForm();
        activeTab.value = 'login';
    }
    finally {
        registerLoading.value = false;
    }
};
const handleResetPassword = async () => {
    if (!resetForm.username || !resetForm.phone || !resetForm.newPassword) {
        ElMessage.warning('请输入登录名、手机号和新密码');
        return;
    }
    if (resetForm.newPassword.length < 6) {
        ElMessage.warning('新密码至少 6 位');
        return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
        ElMessage.warning('两次输入的新密码不一致');
        return;
    }
    resetLoading.value = true;
    try {
        await resetPasswordApi({
            username: resetForm.username,
            phone: resetForm.phone,
            newPassword: resetForm.newPassword
        });
        ElMessage.success('密码修改成功，请重新登录');
        loginForm.username = resetForm.username;
        loginForm.password = '';
        resetDialogVisible.value = false;
        resetResetForm();
    }
    finally {
        resetLoading.value = false;
    }
};
onMounted(async () => {
    categoryOptions.value = await getCategoriesApi();
    initParticleScene();
});
onBeforeUnmount(() => {
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
    }
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['particle-canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-gradient']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-entry__button']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-link']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy--bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title--footer']} */ ;
/** @type {__VLS_StyleScopedClasses['login-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title--footer']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-frame__ring']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['register-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMousemove: (__VLS_ctx.handleShellMouseMove) },
    ...{ onMouseleave: (__VLS_ctx.handleShellMouseLeave) },
    ref: "shellRef",
    ...{ class: "login-shell" },
});
/** @type {typeof __VLS_ctx.shellRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "particleCanvas",
    ...{ class: "particle-canvas" },
});
/** @type {typeof __VLS_ctx.particleCanvas} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell-gradient" },
    ...{ style: (__VLS_ctx.shellGradientStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "brand-copy brand-copy--top" },
    ...{ style: (__VLS_ctx.brandFloatStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "brand-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "auth-stage" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "auth-frame" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-frame__ring" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-title" },
});
const __VLS_0 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "auth-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "auth-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "登录",
    name: "login",
}));
const __VLS_6 = __VLS_5({
    label: "登录",
    name: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-block" },
});
const __VLS_8 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.loginForm),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.loginForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onSubmit: () => { }
};
__VLS_11.slots.default;
const __VLS_16 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "用户名",
}));
const __VLS_18 = __VLS_17({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.loginForm.username),
    size: "large",
    placeholder: "请输入用户名",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.loginForm.username),
    size: "large",
    placeholder: "请输入用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "密码",
}));
const __VLS_26 = __VLS_25({
    label: "密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.loginForm.password),
    size: "large",
    showPassword: true,
    placeholder: "请输入密码",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.loginForm.password),
    size: "large",
    showPassword: true,
    placeholder: "请输入密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
const __VLS_32 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.loginLoading),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.loginLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.handleLogin)
};
__VLS_35.slots.default;
var __VLS_35;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "forgot-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (__VLS_ctx.openResetDialog) },
    ...{ class: "forgot-link" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-entry" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-entry__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "quick-entry__actions" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.demoAccounts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.fillDemoAccount(item);
            } },
        key: (item.username),
        type: "button",
        ...{ class: "quick-entry__button" },
    });
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'register';
        } },
    ...{ class: "switch-link" },
});
var __VLS_7;
const __VLS_40 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "注册",
    name: "register",
}));
const __VLS_42 = __VLS_41({
    label: "注册",
    name: "register",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-block" },
});
const __VLS_44 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.registerForm),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onSubmit': {} },
    model: (__VLS_ctx.registerForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onSubmit: () => { }
};
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "register-grid" },
});
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "用户名",
}));
const __VLS_54 = __VLS_53({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.registerForm.username),
    size: "large",
    placeholder: "用于登录",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.registerForm.username),
    size: "large",
    placeholder: "用于登录",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "昵称",
}));
const __VLS_62 = __VLS_61({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.registerForm.nickname),
    size: "large",
    placeholder: "平台展示名称",
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.registerForm.nickname),
    size: "large",
    placeholder: "平台展示名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
const __VLS_68 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "密码",
}));
const __VLS_70 = __VLS_69({
    label: "密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.registerForm.password),
    size: "large",
    showPassword: true,
    placeholder: "不少于 6 位",
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.registerForm.password),
    size: "large",
    showPassword: true,
    placeholder: "不少于 6 位",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
const __VLS_76 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "确认密码",
}));
const __VLS_78 = __VLS_77({
    label: "确认密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.registerForm.confirmPassword),
    size: "large",
    showPassword: true,
    placeholder: "再次输入密码",
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.registerForm.confirmPassword),
    size: "large",
    showPassword: true,
    placeholder: "再次输入密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "secondary-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "secondary-section__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "register-grid" },
});
const __VLS_84 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "专业方向",
}));
const __VLS_86 = __VLS_85({
    label: "专业方向",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.registerForm.majorDirection),
    size: "large",
    placeholder: "请选择专业方向",
    ...{ style: {} },
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.registerForm.majorDirection),
    size: "large",
    placeholder: "请选择专业方向",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categoryOptions))) {
    const __VLS_92 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        key: (item.id),
        label: (item.name),
        value: (item.name),
    }));
    const __VLS_94 = __VLS_93({
        key: (item.id),
        label: (item.name),
        value: (item.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
}
var __VLS_91;
var __VLS_87;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "兴趣标签",
}));
const __VLS_98 = __VLS_97({
    label: "兴趣标签",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.registerForm.interestTags),
    size: "large",
    placeholder: "例如：Java、算法、数据结构",
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.registerForm.interestTags),
    size: "large",
    placeholder: "例如：Java、算法、数据结构",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "secondary-section secondary-section--plain" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "secondary-section__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "secondary-section__desc" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "register-grid" },
});
const __VLS_104 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "邮箱（选填）",
}));
const __VLS_106 = __VLS_105({
    label: "邮箱（选填）",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.registerForm.email),
    size: "large",
    placeholder: "请输入邮箱",
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.registerForm.email),
    size: "large",
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_107;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "手机号（选填）",
}));
const __VLS_114 = __VLS_113({
    label: "手机号（选填）",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.registerForm.phone),
    size: "large",
    placeholder: "请输入手机号",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.registerForm.phone),
    size: "large",
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
const __VLS_120 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.registerLoading),
}));
const __VLS_122 = __VLS_121({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.registerLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
let __VLS_124;
let __VLS_125;
let __VLS_126;
const __VLS_127 = {
    onClick: (__VLS_ctx.handleRegister)
};
__VLS_123.slots.default;
var __VLS_123;
var __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'login';
        } },
    ...{ class: "switch-link" },
});
var __VLS_43;
var __VLS_3;
const __VLS_128 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.resetDialogVisible),
    title: "找回密码",
    width: "420px",
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.resetDialogVisible),
    title: "找回密码",
    width: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    model: (__VLS_ctx.resetForm),
    labelPosition: "top",
}));
const __VLS_134 = __VLS_133({
    model: (__VLS_ctx.resetForm),
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "登录名",
}));
const __VLS_138 = __VLS_137({
    label: "登录名",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.resetForm.username),
    placeholder: "请输入登录名",
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.resetForm.username),
    placeholder: "请输入登录名",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "手机号",
}));
const __VLS_146 = __VLS_145({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.resetForm.phone),
    placeholder: "请输入手机号",
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.resetForm.phone),
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
var __VLS_147;
const __VLS_152 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    label: "新密码",
}));
const __VLS_154 = __VLS_153({
    label: "新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.resetForm.newPassword),
    showPassword: true,
    placeholder: "请输入新密码",
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.resetForm.newPassword),
    showPassword: true,
    placeholder: "请输入新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
var __VLS_155;
const __VLS_160 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "确认新密码",
}));
const __VLS_162 = __VLS_161({
    label: "确认新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.resetForm.confirmPassword),
    showPassword: true,
    placeholder: "请再次输入新密码",
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.resetForm.confirmPassword),
    showPassword: true,
    placeholder: "请再次输入新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_163;
var __VLS_135;
{
    const { footer: __VLS_thisSlot } = __VLS_131.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_168 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        ...{ 'onClick': {} },
    }));
    const __VLS_170 = __VLS_169({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    let __VLS_172;
    let __VLS_173;
    let __VLS_174;
    const __VLS_175 = {
        onClick: (...[$event]) => {
            __VLS_ctx.resetDialogVisible = false;
        }
    };
    __VLS_171.slots.default;
    var __VLS_171;
    const __VLS_176 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.resetLoading),
    }));
    const __VLS_178 = __VLS_177({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.resetLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    let __VLS_180;
    let __VLS_181;
    let __VLS_182;
    const __VLS_183 = {
        onClick: (__VLS_ctx.handleResetPassword)
    };
    __VLS_179.slots.default;
    var __VLS_179;
}
var __VLS_131;
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "brand-copy brand-copy--bottom" },
    ...{ style: (__VLS_ctx.brandFloatStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-title brand-title--footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
/** @type {__VLS_StyleScopedClasses['login-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['particle-canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['shell-gradient']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy--top']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-frame__ring']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-header']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-title']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['form-block']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-row']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-link']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-entry__title']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-entry__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-entry__button']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-link']} */ ;
/** @type {__VLS_StyleScopedClasses['form-block']} */ ;
/** @type {__VLS_StyleScopedClasses['register-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section__title']} */ ;
/** @type {__VLS_StyleScopedClasses['register-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section--plain']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section__title']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-section__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['register-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-link']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy--bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title--footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeTab: activeTab,
            categoryOptions: categoryOptions,
            loginLoading: loginLoading,
            registerLoading: registerLoading,
            resetLoading: resetLoading,
            particleCanvas: particleCanvas,
            shellRef: shellRef,
            demoAccounts: demoAccounts,
            loginForm: loginForm,
            resetDialogVisible: resetDialogVisible,
            resetForm: resetForm,
            registerForm: registerForm,
            shellGradientStyle: shellGradientStyle,
            brandFloatStyle: brandFloatStyle,
            fillDemoAccount: fillDemoAccount,
            handleShellMouseMove: handleShellMouseMove,
            handleShellMouseLeave: handleShellMouseLeave,
            openResetDialog: openResetDialog,
            handleLogin: handleLogin,
            handleRegister: handleRegister,
            handleResetPassword: handleResetPassword,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
