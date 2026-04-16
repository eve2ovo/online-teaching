import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getAdminCoursesApi, auditCourseApi } from '@/api/course';
const params = reactive({
    current: 1,
    size: 10,
    keyword: ''
});
const list = reactive({
    total: 0,
    records: []
});
const load = async () => {
    Object.assign(list, await getAdminCoursesApi(params));
};
const audit = async (id, status) => {
    const result = await ElMessageBox.prompt('请输入审核意见', '课程审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: status === 'APPROVED' ? '审核通过' : '审核驳回'
    });
    await auditCourseApi(id, {
        status,
        auditReason: result.value
    });
    ElMessage.success('审核完成');
    await load();
};
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索课程",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.load)
};
const __VLS_8 = {
    onKeyup: (__VLS_ctx.load)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-2" },
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
(__VLS_ctx.list.total || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
const __VLS_9 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    data: (__VLS_ctx.list.records),
    border: true,
}));
const __VLS_11 = __VLS_10({
    data: (__VLS_ctx.list.records),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    prop: "id",
    label: "ID",
    width: "70",
}));
const __VLS_15 = __VLS_14({
    prop: "id",
    label: "ID",
    width: "70",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const __VLS_17 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    prop: "title",
    label: "课程标题",
    minWidth: "220",
}));
const __VLS_19 = __VLS_18({
    prop: "title",
    label: "课程标题",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_21 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    label: "状态",
    width: "120",
}));
const __VLS_23 = __VLS_22({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_24.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.status === 'DRAFT') {
        const __VLS_25 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
        const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_28.slots.default;
        var __VLS_28;
    }
    else if (row.status === 'PENDING') {
        const __VLS_29 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            type: "warning",
        }));
        const __VLS_31 = __VLS_30({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        __VLS_32.slots.default;
        var __VLS_32;
    }
    else if (row.status === 'APPROVED') {
        const __VLS_33 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            type: "success",
        }));
        const __VLS_35 = __VLS_34({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        __VLS_36.slots.default;
        var __VLS_36;
    }
    else if (row.status === 'REJECTED') {
        const __VLS_37 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            type: "danger",
        }));
        const __VLS_39 = __VLS_38({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        __VLS_40.slots.default;
        var __VLS_40;
    }
    else {
        const __VLS_41 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({}));
        const __VLS_43 = __VLS_42({}, ...__VLS_functionalComponentArgsRest(__VLS_42));
        __VLS_44.slots.default;
        (row.status);
        var __VLS_44;
    }
}
var __VLS_24;
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    prop: "auditReason",
    label: "审核意见",
    minWidth: "220",
}));
const __VLS_47 = __VLS_46({
    prop: "auditReason",
    label: "审核意见",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
const __VLS_49 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    label: "操作",
    width: "300",
}));
const __VLS_51 = __VLS_50({
    label: "操作",
    width: "300",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_52.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.status === 'PENDING') {
        const __VLS_53 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
        }));
        const __VLS_55 = __VLS_54({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        let __VLS_57;
        let __VLS_58;
        let __VLS_59;
        const __VLS_60 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'PENDING'))
                    return;
                __VLS_ctx.audit(row.id, 'APPROVED');
            }
        };
        __VLS_56.slots.default;
        var __VLS_56;
        const __VLS_61 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
        }));
        const __VLS_63 = __VLS_62({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        let __VLS_65;
        let __VLS_66;
        let __VLS_67;
        const __VLS_68 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'PENDING'))
                    return;
                __VLS_ctx.audit(row.id, 'REJECTED');
            }
        };
        __VLS_64.slots.default;
        var __VLS_64;
    }
    else if (row.status === 'APPROVED') {
        const __VLS_69 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            link: true,
            disabled: true,
        }));
        const __VLS_71 = __VLS_70({
            link: true,
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        __VLS_72.slots.default;
        var __VLS_72;
    }
    else if (row.status === 'REJECTED') {
        const __VLS_73 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            link: true,
            disabled: true,
        }));
        const __VLS_75 = __VLS_74({
            link: true,
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        __VLS_76.slots.default;
        var __VLS_76;
    }
    else {
        const __VLS_77 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            link: true,
            disabled: true,
        }));
        const __VLS_79 = __VLS_78({
            link: true,
            disabled: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_80.slots.default;
        var __VLS_80;
    }
}
var __VLS_52;
var __VLS_12;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            params: params,
            list: list,
            load: load,
            audit: audit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
