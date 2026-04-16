<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">课程管理</div>
          <div class="section-desc">维护课程分类并查看已通过课程。</div>
        </div>

        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索课程标题"
            style="width: 240px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
          <el-button plain @click="handleSearch">查询</el-button>
          <el-button type="primary" @click="openCategoryDialog">新建分类</el-button>
        </div>
      </div>

      <div class="category-panel">
        <div class="sub-title">现有课程分类</div>
        <div class="category-list" v-if="categories.length">
          <div v-for="item in categories" :key="item.id" class="category-chip">
            <span>{{ item.id }} - {{ item.name }}</span>
            <el-button link type="danger" @click="removeCategory(item)">删除</el-button>
          </div>
        </div>
        <el-empty v-else description="暂无课程分类" :image-size="60" />
      </div>
    </div>

    <div class="page-card">
      <el-table :data="list.records" style="width: 100%;" v-loading="loading">
        <el-table-column prop="id" label="课程ID" width="90" />
        <el-table-column prop="title" label="课程名称" min-width="220" />
        <el-table-column prop="teacherId" label="教师ID" width="100" />
        <el-table-column prop="categoryId" label="分类ID" width="100" />
        <el-table-column prop="categoryName" label="分类名称" width="160" />
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'PENDING'" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.status === 'APPROVED'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 'REJECTED'" type="danger">已驳回</el-tag>
            <el-tag v-else>待完善</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" min-width="180" />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="viewDetail(row.id)">详情</el-button>
              <template v-if="row.status === 'PENDING'">
                <el-button link type="primary" @click="audit(row.id, 'APPROVED')">通过审核</el-button>
                <el-button link type="danger" @click="audit(row.id, 'REJECTED')">驳回</el-button>
              </template>
              <el-button v-else-if="row.status === 'APPROVED'" link type="danger" @click="removeCourse(row)">删除</el-button>
              <el-button v-else link disabled>
                {{ row.status === 'REJECTED' ? '已驳回' : '待提交审核' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 18px; display: flex; justify-content: flex-end;">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="list.total"
          :current-page="params.current"
          :page-size="params.size"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="课程详情" width="760px">
      <div v-if="detailData.course" style="display: flex; flex-direction: column; gap: 14px;">
        <div><strong>课程ID：</strong>{{ detailData.course.id }}</div>
        <div><strong>课程名称：</strong>{{ detailData.course.title }}</div>
        <div><strong>教师ID：</strong>{{ detailData.course.teacherId }}</div>
        <div><strong>分类ID：</strong>{{ detailData.course.categoryId ?? '-' }}</div>
        <div><strong>分类名称：</strong>{{ detailData.course.categoryName || '-' }}</div>
        <div><strong>课程状态：</strong>{{ detailData.course.status }}</div>
        <div><strong>审核原因：</strong>{{ detailData.course.auditReason || '-' }}</div>
        <div><strong>审核时间：</strong>{{ detailData.course.auditTime || '-' }}</div>
        <div><strong>封面地址：</strong>{{ detailData.course.coverUrl || '暂无封面' }}</div>
        <div><strong>课程简介：</strong>{{ detailData.course.description || '暂无简介' }}</div>

        <div style="margin-top: 8px;">
          <div class="sub-title" style="margin-bottom: 10px;">章节与资源</div>
          <div v-if="detailData.chapters?.length" style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="chapter in detailData.chapters" :key="chapter.id" class="chapter-card">
              <div class="chapter-title">第{{ chapter.sortNo }}章 {{ chapter.title }}</div>
              <div v-if="chapter.resources?.length" class="resource-list">
                <div v-for="res in chapter.resources" :key="res.id" class="resource-item">
                  <span>{{ res.sortNo }}. {{ res.title }}</span>
                  <el-tag size="small" type="info">{{ res.type || '资源' }}</el-tag>
                </div>
              </div>
              <div v-else class="empty-tip">暂无资源</div>
            </div>
          </div>
          <div v-else class="empty-tip">暂无章节</div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="categoryDialogVisible" title="新增课程分类" width="420px">
      <el-form label-width="90px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入课程分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteApprovedCourseApi
} from '@/api/admin-course-manage'
import {
  getAdminCoursesApi,
  getAdminCourseDetailApi,
  auditCourseApi
} from '@/api/course'
import {
  getCategoriesApi,
  saveCategoryApi,
  deleteCategoryApi,
  type CategoryItem
} from '@/api/category'

const loading = ref(false)
const detailVisible = ref(false)
const categoryDialogVisible = ref(false)

const params = reactive({
  current: 1,
  size: 8,
  keyword: ''
})

const list = reactive({
  total: 0,
  records: [] as any[]
})

const categories = ref<CategoryItem[]>([])

const categoryForm = reactive({
  name: ''
})

const detailData = reactive({
  course: null as any,
  chapters: [] as any[]
})

const loadCategories = async () => {
  categories.value = await getCategoriesApi()
}

const load = async () => {
  loading.value = true
  try {
    const res = await getAdminCoursesApi({
      current: params.current,
      size: params.size,
      keyword: params.keyword
    })
    list.total = res.total || 0
    list.records = res.records || []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  params.current = 1
  load()
}

const handleCurrentChange = (page: number) => {
  params.current = page
  load()
}

const viewDetail = async (id: number) => {
  const res = await getAdminCourseDetailApi(id)
  detailData.course = res.course || null
  detailData.chapters = res.chapters || []
  detailVisible.value = true
}

const audit = async (id: number, status: 'APPROVED' | 'REJECTED') => {
  const result = await ElMessageBox.prompt('请输入审核意见', status === 'APPROVED' ? '通过审核' : '驳回课程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: status === 'APPROVED' ? '审核通过' : '审核驳回'
  })

  await auditCourseApi(id, {
    status,
    auditReason: result.value
  })

  ElMessage.success(status === 'APPROVED' ? '课程已通过审核' : '课程已驳回')
  await load()
}

const removeCourse = async (row: any) => {
  await ElMessageBox.confirm(`确认删除课程《${row.title}》吗？`, '提示', { type: 'warning' })
  await deleteApprovedCourseApi(row.id)
  ElMessage.success('课程删除成功')
  if (list.records.length === 1 && params.current > 1) {
    params.current--
  }
  await load()
}

const openCategoryDialog = () => {
  categoryForm.name = ''
  categoryDialogVisible.value = true
}

const saveCategory = async () => {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入课程分类名称')
    return
  }
  await saveCategoryApi(categoryForm.name.trim())
  ElMessage.success('课程分类新增成功')
  categoryDialogVisible.value = false
  await loadCategories()
}

const removeCategory = async (item: CategoryItem) => {
  await ElMessageBox.confirm(`确认删除课程分类“${item.name}”吗？`, '提示', { type: 'warning' })
  await deleteCategoryApi(item.id)
  ElMessage.success('课程分类删除成功')
  await loadCategories()
  await load()
}

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>

<style scoped>
.category-panel {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.sub-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.category-list {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
}

.chapter-card {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.chapter-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: white;
  border: 1px solid #e5e7eb;
}

.empty-tip {
  color: #94a3b8;
  font-size: 14px;
}
</style>
