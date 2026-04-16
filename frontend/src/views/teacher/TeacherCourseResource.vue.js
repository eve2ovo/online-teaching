import { computed, reactive, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getChaptersApi } from '@/api/chapter';
import { addResourceApi, deleteResourceApi, getResourceListByCourseApi, uploadVideoApi } from '@/api/resource';
const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const chapters = ref([]);
const groups = ref([]);
const selectedFile = ref(null);
const uploading = ref(false);
const saving = ref(false);
const activeChapterId = ref();
const uploaded = reactive({
    url: '',
    fileName: '',
    fileSize: 0,
    storageType: 'local'
});
const form = reactive({
    chapterId: undefined,
    title: '',
    type: 'video',
    sortNo: 1
});
const resourceCount = computed(() => groups.value.reduce((sum, item) => sum + (item.resources?.length || 0), 0));
const displayGroups = computed(() => {
    if (!activeChapterId.value)
        return groups.value;
    return groups.value.filter(item => item.chapterId === activeChapterId.value);
});
const applyChapterQuery = () => {
    const chapterId = Number(route.query.chapterId);
    if (!Number.isNaN(chapterId) && chapterId > 0) {
        activeChapterId.value = chapterId;
        form.chapterId = chapterId;
        return;
    }
    activeChapterId.value = undefined;
};
const load = async () => {
    chapters.value = await getChaptersApi(courseId);
    groups.value = await getResourceListByCourseApi(courseId);
};
const handleSelectFile = (file) => {
    selectedFile.value = file.raw || file;
};
const uploadVideo = async () => {
    if (!selectedFile.value) {
        ElMessage.warning('请先选择视频文件');
        return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    uploading.value = true;
    try {
        const res = await uploadVideoApi(formData);
        uploaded.url = res.url;
        uploaded.fileName = res.fileName;
        uploaded.fileSize = res.fileSize;
        uploaded.storageType = res.storageType || 'local';
        if (!form.title) {
            const pureName = res.fileName || selectedFile.value.name;
            form.title = pureName.replace(/\.[^.]+$/, '');
        }
        ElMessage.success('视频上传成功');
    }
    finally {
        uploading.value = false;
    }
};
const saveResource = async () => {
    if (!form.chapterId) {
        ElMessage.warning('请选择章节');
        return;
    }
    if (!form.title) {
        ElMessage.warning('请输入资源标题');
        return;
    }
    if (!uploaded.url) {
        ElMessage.warning('请先上传视频');
        return;
    }
    saving.value = true;
    try {
        await addResourceApi({
            chapterId: form.chapterId,
            title: form.title,
            type: form.type,
            fileName: uploaded.fileName,
            fileSize: uploaded.fileSize,
            duration: null,
            sortNo: form.sortNo,
            storageType: uploaded.storageType,
            url: uploaded.url
        });
        ElMessage.success('资源保存成功');
        activeChapterId.value = form.chapterId;
        resetForm();
        await load();
    }
    finally {
        saving.value = false;
    }
};
const removeResource = async (id) => {
    await ElMessageBox.confirm('确定删除该资源吗？', '提示', { type: 'warning' });
    await deleteResourceApi(id);
    ElMessage.success('删除成功');
    await load();
};
const preview = (url) => {
    window.open(url, '_blank');
};
const resetForm = () => {
    form.chapterId = activeChapterId.value;
    form.title = '';
    form.type = 'video';
    form.sortNo = 1;
    selectedFile.value = null;
    uploaded.url = '';
    uploaded.fileName = '';
    uploaded.fileSize = 0;
    uploaded.storageType = 'local';
};
const goBack = () => {
    router.push('/teacher/courses');
};
const goContent = () => {
    router.push(`/teacher/content/${courseId}`);
};
watch(() => route.query.chapterId, () => {
    applyChapterQuery();
    resetForm();
}, { immediate: true });
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.load)
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
    onClick: (__VLS_ctx.goContent)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.goBack)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-3" },
    ...{ style: {} },
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
(__VLS_ctx.courseId);
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
const __VLS_24 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    model: (__VLS_ctx.form),
    labelWidth: "96px",
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    model: (__VLS_ctx.form),
    labelWidth: "96px",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "所属章节",
}));
const __VLS_30 = __VLS_29({
    label: "所属章节",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.form.chapterId),
    placeholder: "请选择章节",
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.form.chapterId),
    placeholder: "请选择章节",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.chapters))) {
    const __VLS_36 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        key: (item.id),
        label: (`${item.sortNo}. ${item.title}`),
        value: (item.id),
    }));
    const __VLS_38 = __VLS_37({
        key: (item.id),
        label: (`${item.sortNo}. ${item.title}`),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
var __VLS_35;
var __VLS_31;
const __VLS_40 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "资源标题",
}));
const __VLS_42 = __VLS_41({
    label: "资源标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：第一课 课程导学",
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "例如：第一课 课程导学",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "资源类型",
}));
const __VLS_50 = __VLS_49({
    label: "资源类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.form.type),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "视频",
    value: "video",
}));
const __VLS_58 = __VLS_57({
    label: "视频",
    value: "video",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
var __VLS_51;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "排序号",
}));
const __VLS_62 = __VLS_61({
    label: "排序号",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.form.sortNo),
    min: (1),
    step: (1),
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.form.sortNo),
    min: (1),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
const __VLS_68 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "上传视频",
}));
const __VLS_70 = __VLS_69({
    label: "上传视频",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_72 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    showFileList: (false),
    autoUpload: (false),
    onChange: (__VLS_ctx.handleSelectFile),
    accept: "video/*",
}));
const __VLS_74 = __VLS_73({
    showFileList: (false),
    autoUpload: (false),
    onChange: (__VLS_ctx.handleSelectFile),
    accept: "video/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    plain: true,
}));
const __VLS_78 = __VLS_77({
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
var __VLS_75;
if (__VLS_ctx.selectedFile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-tip" },
    });
    (__VLS_ctx.selectedFile.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "inline-actions" },
});
const __VLS_80 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    plain: true,
    loading: (__VLS_ctx.uploading),
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    plain: true,
    loading: (__VLS_ctx.uploading),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.uploadVideo)
};
__VLS_83.slots.default;
var __VLS_83;
if (__VLS_ctx.uploaded.url) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "meta-text" },
    });
    (__VLS_ctx.uploaded.fileName);
}
var __VLS_71;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "视频地址",
}));
const __VLS_90 = __VLS_89({
    label: "视频地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.uploaded.url),
    readonly: true,
    placeholder: "上传后自动生成",
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.uploaded.url),
    readonly: true,
    placeholder: "上传后自动生成",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    ...{ class: "form-actions" },
}));
const __VLS_98 = __VLS_97({
    ...{ class: "form-actions" },
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_102 = __VLS_101({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onClick: (__VLS_ctx.saveResource)
};
__VLS_103.slots.default;
var __VLS_103;
const __VLS_108 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_110 = __VLS_109({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_112;
let __VLS_113;
let __VLS_114;
const __VLS_115 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_111.slots.default;
var __VLS_111;
var __VLS_99;
var __VLS_27;
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
    ...{ class: "toolbar" },
    ...{ style: {} },
});
const __VLS_116 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.activeChapterId),
    clearable: true,
    placeholder: "筛选章节",
    ...{ style: {} },
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.activeChapterId),
    clearable: true,
    placeholder: "筛选章节",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.chapters))) {
    const __VLS_120 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        key: (item.id),
        label: (`${item.sortNo}. ${item.title}`),
        value: (item.id),
    }));
    const __VLS_122 = __VLS_121({
        key: (item.id),
        label: (`${item.sortNo}. ${item.title}`),
        value: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
}
var __VLS_119;
const __VLS_124 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (...[$event]) => {
        __VLS_ctx.activeChapterId = undefined;
    }
};
__VLS_127.slots.default;
var __VLS_127;
if (__VLS_ctx.displayGroups.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.displayGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (group.chapterId),
            ...{ class: "chapter-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chapter-title" },
        });
        (group.sortNo);
        (group.chapterTitle);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-text" },
        });
        (group.resources.length);
        if (group.resources.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "resource-list" },
            });
            for (const [item] of __VLS_getVForSourceType((group.resources))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (item.id),
                    ...{ class: "resource-card" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "resource-title" },
                });
                (item.title);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "meta-text" },
                    ...{ style: {} },
                });
                (item.type);
                (item.fileName || '未记录');
                (item.sortNo ?? '-');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "resource-url" },
                });
                (item.url);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "table-actions" },
                });
                if (item.url) {
                    const __VLS_132 = {}.ElButton;
                    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                    // @ts-ignore
                    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
                        ...{ 'onClick': {} },
                        type: "primary",
                        link: true,
                    }));
                    const __VLS_134 = __VLS_133({
                        ...{ 'onClick': {} },
                        type: "primary",
                        link: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
                    let __VLS_136;
                    let __VLS_137;
                    let __VLS_138;
                    const __VLS_139 = {
                        onClick: (...[$event]) => {
                            if (!(__VLS_ctx.displayGroups.length))
                                return;
                            if (!(group.resources.length))
                                return;
                            if (!(item.url))
                                return;
                            __VLS_ctx.preview(item.url);
                        }
                    };
                    __VLS_135.slots.default;
                    var __VLS_135;
                }
                const __VLS_140 = {}.ElButton;
                /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
                // @ts-ignore
                const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                    ...{ 'onClick': {} },
                    type: "danger",
                    link: true,
                }));
                const __VLS_142 = __VLS_141({
                    ...{ 'onClick': {} },
                    type: "danger",
                    link: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_141));
                let __VLS_144;
                let __VLS_145;
                let __VLS_146;
                const __VLS_147 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.displayGroups.length))
                            return;
                        if (!(group.resources.length))
                            return;
                        __VLS_ctx.removeResource(item.id);
                    }
                };
                __VLS_143.slots.default;
                var __VLS_143;
            }
        }
        else {
            const __VLS_148 = {}.ElEmpty;
            /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                description: "本章节还没有资源",
            }));
            const __VLS_150 = __VLS_149({
                description: "本章节还没有资源",
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        }
    }
}
else {
    const __VLS_152 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        description: "当前筛选条件下还没有资源",
    }));
    const __VLS_154 = __VLS_153({
        description: "当前筛选条件下还没有资源",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
}
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-block']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-header']} */ ;
/** @type {__VLS_StyleScopedClasses['chapter-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-list']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-title']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-text']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-url']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            courseId: courseId,
            chapters: chapters,
            selectedFile: selectedFile,
            uploading: uploading,
            saving: saving,
            activeChapterId: activeChapterId,
            uploaded: uploaded,
            form: form,
            resourceCount: resourceCount,
            displayGroups: displayGroups,
            load: load,
            handleSelectFile: handleSelectFile,
            uploadVideo: uploadVideo,
            saveResource: saveResource,
            removeResource: removeResource,
            preview: preview,
            resetForm: resetForm,
            goBack: goBack,
            goContent: goContent,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
