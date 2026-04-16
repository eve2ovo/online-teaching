import axios from 'axios';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getToken } from '@/utils/auth';
import { createForumPostApi, getForumSectionsApi } from '@/api/forum';
const router = useRouter();
const sections = ref([]);
const submitting = ref(false);
const form = reactive({
    sectionId: undefined,
    title: '',
    content: '',
    mediaList: []
});
const loadSections = async () => {
    sections.value = await getForumSectionsApi();
};
const doUpload = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await axios.post('/api/files/upload', fd, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    const data = res.data.data;
    // 兼容两种后端返回：
    // 1. data 直接就是字符串 url
    // 2. data 是对象，例如 { url: 'xxx' }
    if (typeof data === 'string')
        return data;
    if (data && typeof data.url === 'string')
        return data.url;
    throw new Error('上传接口返回的文件地址格式不正确');
};
const uploadImage = async (options) => {
    try {
        const url = await doUpload(options.file);
        form.mediaList.push({
            mediaType: 'IMAGE',
            mediaUrl: url
        });
        ElMessage.success('图片上传成功');
        options.onSuccess?.(url);
    }
    catch (e) {
        options.onError?.(e);
    }
};
const uploadVideo = async (options) => {
    try {
        const url = await doUpload(options.file);
        form.mediaList.push({
            mediaType: 'VIDEO',
            mediaUrl: url
        });
        ElMessage.success('视频上传成功');
        options.onSuccess?.(url);
    }
    catch (e) {
        options.onError?.(e);
    }
};
const submit = async () => {
    if (!form.sectionId) {
        ElMessage.warning('请选择分区');
        return;
    }
    if (!form.title?.trim()) {
        ElMessage.warning('请输入标题');
        return;
    }
    if (!form.content?.trim() && form.mediaList.length === 0) {
        ElMessage.warning('内容和媒体至少填写一个');
        return;
    }
    const payload = {
        sectionId: form.sectionId,
        title: form.title,
        content: form.content,
        mediaList: form.mediaList.map((item) => ({
            mediaType: String(item.mediaType),
            mediaUrl: typeof item.mediaUrl === 'string' ? item.mediaUrl : String(item.mediaUrl?.url || '')
        }))
    };
    console.log('发帖 payload =', JSON.stringify(payload, null, 2));
    submitting.value = true;
    try {
        const id = await createForumPostApi(payload);
        ElMessage.success('发布成功');
        router.push(`/forum/${id}`);
    }
    finally {
        submitting.value = false;
    }
};
onMounted(loadSections);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-desc" },
});
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    labelWidth: "90px",
}));
const __VLS_2 = __VLS_1({
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "分区",
}));
const __VLS_6 = __VLS_5({
    label: "分区",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.form.sectionId),
    placeholder: "请选择分区",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.form.sectionId),
    placeholder: "请选择分区",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.sections))) {
    const __VLS_12 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }));
    const __VLS_14 = __VLS_13({
        key: (item.id),
        label: (item.name),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_11;
var __VLS_7;
const __VLS_16 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "标题",
}));
const __VLS_18 = __VLS_17({
    label: "标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.form.title),
    maxlength: "200",
    showWordLimit: true,
    placeholder: "请输入帖子标题",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.form.title),
    maxlength: "200",
    showWordLimit: true,
    placeholder: "请输入帖子标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_19;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "内容",
}));
const __VLS_26 = __VLS_25({
    label: "内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.form.content),
    type: "textarea",
    rows: (8),
    placeholder: "请输入帖子内容",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.form.content),
    type: "textarea",
    rows: (8),
    placeholder: "请输入帖子内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
const __VLS_32 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "图片上传",
}));
const __VLS_34 = __VLS_33({
    label: "图片上传",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    httpRequest: (__VLS_ctx.uploadImage),
    showFileList: (true),
    listType: "picture-card",
    accept: "image/*",
}));
const __VLS_38 = __VLS_37({
    httpRequest: (__VLS_ctx.uploadImage),
    showFileList: (true),
    listType: "picture-card",
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
var __VLS_39;
var __VLS_35;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "视频上传",
}));
const __VLS_50 = __VLS_49({
    label: "视频上传",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    httpRequest: (__VLS_ctx.uploadVideo),
    showFileList: (true),
    accept: "video/*",
}));
const __VLS_54 = __VLS_53({
    httpRequest: (__VLS_ctx.uploadVideo),
    showFileList: (true),
    accept: "video/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
var __VLS_59;
var __VLS_55;
var __VLS_51;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
__VLS_67.slots.default;
var __VLS_67;
const __VLS_72 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.submit)
};
__VLS_75.slots.default;
var __VLS_75;
var __VLS_63;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            router: router,
            sections: sections,
            submitting: submitting,
            form: form,
            uploadImage: uploadImage,
            uploadVideo: uploadVideo,
            submit: submit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
