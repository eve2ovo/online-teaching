import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { cancelTopForumPostApi, deleteForumPostApi, getForumPostsApi, topForumPostApi } from '@/api/forum';
const router = useRouter();
const list = reactive({
    total: 0,
    records: []
});
const params = reactive({
    current: 1,
    size: 10,
    keyword: ''
});
const load = async () => {
    const res = await getForumPostsApi(params);
    list.total = res.total || 0;
    list.records = res.records || [];
};
const onPageChange = (page) => {
    params.current = page;
    load();
};
const topPost = async (id) => {
    await topForumPostApi(id);
    ElMessage.success('置顶成功');
    load();
};
const cancelTopPost = async (id) => {
    await cancelTopForumPostApi(id);
    ElMessage.success('已取消置顶');
    load();
};
const removePost = async (id) => {
    await deleteForumPostApi(id);
    ElMessage.success('删除成功');
    load();
};
const goDetail = (id) => {
    router.push(`/forum/${id}`);
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
    placeholder: "搜索帖子",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.params.keyword),
    placeholder: "搜索帖子",
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
const __VLS_9 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_11 = __VLS_10({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onClick: (__VLS_ctx.load)
};
__VLS_12.slots.default;
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
const __VLS_17 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    data: (__VLS_ctx.list.records),
    stripe: true,
}));
const __VLS_19 = __VLS_18({
    data: (__VLS_ctx.list.records),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    prop: "id",
    label: "ID",
    width: "70",
}));
const __VLS_23 = __VLS_22({
    prop: "id",
    label: "ID",
    width: "70",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const __VLS_25 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    prop: "title",
    label: "标题",
    minWidth: "220",
}));
const __VLS_27 = __VLS_26({
    prop: "title",
    label: "标题",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_29 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    prop: "sectionName",
    label: "分区",
    width: "120",
}));
const __VLS_31 = __VLS_30({
    prop: "sectionName",
    label: "分区",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const __VLS_33 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    prop: "userNickname",
    label: "作者",
    width: "120",
}));
const __VLS_35 = __VLS_34({
    prop: "userNickname",
    label: "作者",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: "身份",
    width: "100",
}));
const __VLS_39 = __VLS_38({
    label: "身份",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_40.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_41 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        size: "small",
        type: (__VLS_ctx.roleTagType(row.userRole)),
    }));
    const __VLS_43 = __VLS_42({
        size: "small",
        type: (__VLS_ctx.roleTagType(row.userRole)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    (__VLS_ctx.roleText(row.userRole));
    var __VLS_44;
}
var __VLS_40;
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    label: "置顶",
    width: "90",
}));
const __VLS_47 = __VLS_46({
    label: "置顶",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_48.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.isTop === 1) {
        const __VLS_49 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
            type: "danger",
        }));
        const __VLS_51 = __VLS_50({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        __VLS_52.slots.default;
        var __VLS_52;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
var __VLS_48;
const __VLS_53 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    prop: "likeCount",
    label: "点赞",
    width: "90",
}));
const __VLS_55 = __VLS_54({
    prop: "likeCount",
    label: "点赞",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
const __VLS_57 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    prop: "commentCount",
    label: "评论",
    width: "90",
}));
const __VLS_59 = __VLS_58({
    prop: "commentCount",
    label: "评论",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const __VLS_61 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    prop: "createdAt",
    label: "发布时间",
    minWidth: "160",
}));
const __VLS_63 = __VLS_62({
    prop: "createdAt",
    label: "发布时间",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const __VLS_65 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    label: "操作",
    width: "260",
    fixed: "right",
}));
const __VLS_67 = __VLS_66({
    label: "操作",
    width: "260",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
__VLS_68.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_68.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    const __VLS_69 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goDetail(row.id);
        }
    };
    __VLS_72.slots.default;
    var __VLS_72;
    if (row.isTop !== 1) {
        const __VLS_77 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_79 = __VLS_78({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        let __VLS_81;
        let __VLS_82;
        let __VLS_83;
        const __VLS_84 = {
            onClick: (...[$event]) => {
                if (!(row.isTop !== 1))
                    return;
                __VLS_ctx.topPost(row.id);
            }
        };
        __VLS_80.slots.default;
        var __VLS_80;
    }
    else {
        const __VLS_85 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
            ...{ 'onClick': {} },
            link: true,
        }));
        const __VLS_87 = __VLS_86({
            ...{ 'onClick': {} },
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        let __VLS_89;
        let __VLS_90;
        let __VLS_91;
        const __VLS_92 = {
            onClick: (...[$event]) => {
                if (!!(row.isTop !== 1))
                    return;
                __VLS_ctx.cancelTopPost(row.id);
            }
        };
        __VLS_88.slots.default;
        var __VLS_88;
    }
    const __VLS_93 = {}.ElPopconfirm;
    /** @type {[typeof __VLS_components.ElPopconfirm, typeof __VLS_components.elPopconfirm, typeof __VLS_components.ElPopconfirm, typeof __VLS_components.elPopconfirm, ]} */ ;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        ...{ 'onConfirm': {} },
        title: "确定删除该帖子吗？",
    }));
    const __VLS_95 = __VLS_94({
        ...{ 'onConfirm': {} },
        title: "确定删除该帖子吗？",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_97;
    let __VLS_98;
    let __VLS_99;
    const __VLS_100 = {
        onConfirm: (...[$event]) => {
            __VLS_ctx.removePost(row.id);
        }
    };
    __VLS_96.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_96.slots;
        const __VLS_101 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
            link: true,
            type: "danger",
        }));
        const __VLS_103 = __VLS_102({
            link: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_104.slots.default;
        var __VLS_104;
    }
    var __VLS_96;
}
var __VLS_68;
var __VLS_20;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_105 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next, total",
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    total: (__VLS_ctx.list.total || 0),
}));
const __VLS_107 = __VLS_106({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next, total",
    currentPage: (__VLS_ctx.params.current),
    pageSize: (__VLS_ctx.params.size),
    total: (__VLS_ctx.list.total || 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_109;
let __VLS_110;
let __VLS_111;
const __VLS_112 = {
    onCurrentChange: (__VLS_ctx.onPageChange)
};
var __VLS_108;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['split-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['page-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            list: list,
            params: params,
            load: load,
            onPageChange: onPageChange,
            topPost: topPost,
            cancelTopPost: cancelTopPost,
            removePost: removePost,
            goDetail: goDetail,
            roleText: roleText,
            roleTagType: roleTagType,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
