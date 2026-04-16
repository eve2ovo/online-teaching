<template>
  <el-dialog v-model="visible" :title="form.id ? '编辑课程' : '新增课程'" width="560px">
    <div class="dialog-tip">
      <div class="tip-title">建课流程提示</div>
      <div class="tip-text">先完善课程基础信息，保存后继续补章节、资源和作业，最后再提交审核。</div>
    </div>

    <el-form :model="form" label-width="90px">
      <el-form-item label="课程名称">
        <el-input v-model="form.title" placeholder="请输入课程名称" />
      </el-form-item>

      <el-form-item label="分类ID">
        <div class="category-field">
          <el-input-number v-model="form.categoryId" :min="1" style="width: 100%;" />
          <span class="category-name-tip">
            {{ currentCategoryName ? `分类名称：${currentCategoryName}` : '分类名称：未匹配到分类' }}
          </span>
        </div>
      </el-form-item>

      <el-form-item label="封面地址">
        <el-input v-model="form.coverUrl" />
      </el-form-item>

      <el-form-item label="课程标签">
        <el-input v-model="form.tags" placeholder="例如 Java, backend, spring" />
      </el-form-item>

      <el-form-item label="课程简介">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="补充课程目标、适合对象和学习收获" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategoriesApi, type CategoryItem } from '@/api/category'

const props = defineProps<{ modelValue: boolean; form: any }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const categories = ref<CategoryItem[]>([])

const currentCategoryName = computed(() =>
  categories.value.find((item) => item.id === props.form.categoryId)?.name || ''
)

const handleSubmit = () => {
  if (!String(props.form.title || '').trim()) {
    ElMessage.warning('请先填写课程名称')
    return
  }

  emit('submit', {
    ...props.form,
    title: String(props.form.title || '').trim(),
    description: props.form.description ? String(props.form.description).trim() : props.form.description,
    tags: props.form.tags ? String(props.form.tags).trim() : props.form.tags
  })
}

onMounted(async () => {
  categories.value = await getCategoriesApi()
})
</script>

<style scoped>
.dialog-tip {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.tip-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.tip-text {
  margin-top: 6px;
  color: #475569;
  line-height: 1.7;
  font-size: 13px;
}

.category-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.category-name-tip {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .category-field {
    flex-direction: column;
    align-items: stretch;
  }

  .category-name-tip {
    white-space: normal;
  }
}
</style>
