<template>
  <div class="student-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">课程学生</div>
          <div class="section-desc">查看学习情况，并管理已加入本课程的学生。</div>
        </div>
        <div class="toolbar">
          <el-input
            v-model="keyword"
            placeholder="搜索昵称、账号、邮箱或手机号"
            style="width: 260px"
            clearable
            @change="load"
            @keyup.enter="load"
          />
          <el-button type="primary" @click="goGradebook">成绩概览</el-button>
          <el-button plain @click="goBack">返回课程</el-button>
        </div>
      </div>

      <div class="grid-4">
        <div class="stat-card">
          <div class="label">学生人数</div>
          <div class="value">{{ students.length }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均学习进度</div>
          <div class="value">{{ averageProgress }}%</div>
        </div>
        <div class="stat-card">
          <div class="label">平均作业完成率</div>
          <div class="value">{{ averageAssignmentCompletion }}%</div>
        </div>
        <div class="stat-card">
          <div class="label">练习平均分</div>
          <div class="value">{{ averagePracticeScore }}</div>
        </div>
      </div>

      <el-table v-if="students.length" :data="students" border style="margin-top: 18px;">
        <el-table-column label="学生信息" min-width="220">
          <template #default="{ row }">
            <div class="student-name">{{ row.nickname || row.username }}</div>
            <div class="student-sub">{{ row.username }}</div>
            <div class="student-sub" v-if="row.email">{{ row.email }}</div>
            <div class="student-sub" v-if="row.phone">{{ row.phone }}</div>
          </template>
        </el-table-column>

        <el-table-column label="选课信息" min-width="170">
          <template #default="{ row }">
            <div class="student-sub">加入时间：{{ formatTime(row.enrolledAt) }}</div>
            <div class="student-sub">专业方向：{{ row.majorDirection || '未填写' }}</div>
            <div class="student-sub">兴趣标签：{{ row.interestTags || '未填写' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="学习进度" min-width="220">
          <template #default="{ row }">
            <div class="student-sub">进度：{{ row.progressPercent }}%</div>
            <el-progress :percentage="row.progressPercent" :stroke-width="8" />
            <div class="student-sub">已完成资源：{{ row.completedResources }}/{{ row.totalResources }}</div>
            <div class="student-sub">最近学习：{{ formatTime(row.lastLearnedAt) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="作业情况" min-width="180">
          <template #default="{ row }">
            <div class="student-sub">已提交：{{ row.submittedAssignmentCount }}/{{ row.assignmentCount }}</div>
            <div class="student-sub">平均分：{{ formatScore(row.averageAssignmentScore) }}</div>
            <div class="student-sub">最近提交：{{ formatTime(row.lastAssignmentSubmitTime) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="练习情况" min-width="180">
          <template #default="{ row }">
            <div class="student-sub">已完成：{{ row.submittedPracticeCount }}/{{ row.practiceSetCount }}</div>
            <div class="student-sub">平均分：{{ formatScore(row.averagePracticeScore) }}</div>
            <div class="student-sub">最近练习：{{ formatTime(row.lastPracticeSubmitTime) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              :loading="removingStudentId === row.studentId"
              @click="removeStudent(row)"
            >
              移出课程
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="当前课程还没有已加入的学生，或没有符合条件的搜索结果。" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTeacherCourseStudentsApi,
  removeTeacherCourseStudentApi,
  type TeacherCourseStudentItem
} from '@/api/course'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.courseId)

const keyword = ref('')
const students = ref<TeacherCourseStudentItem[]>([])
const removingStudentId = ref<number | null>(null)

const averageProgress = computed(() => {
  if (!students.value.length) {
    return 0
  }
  const total = students.value.reduce((sum, item) => sum + (item.progressPercent || 0), 0)
  return Math.round(total / students.value.length)
})

const averageAssignmentCompletion = computed(() => {
  if (!students.value.length) {
    return 0
  }
  const total = students.value.reduce((sum, item) => sum + Number(item.assignmentCompletionRate || 0), 0)
  return Math.round(total / students.value.length)
})

const averagePracticeScore = computed(() => {
  const scored = students.value.filter(item => Number(item.averagePracticeScore || 0) > 0)
  if (!scored.length) {
    return '0.00'
  }
  const total = scored.reduce((sum, item) => sum + Number(item.averagePracticeScore || 0), 0)
  return (total / scored.length).toFixed(2)
})

const formatTime = (value?: string | null) => {
  if (!value) {
    return '暂无'
  }
  return value.replace('T', ' ').slice(0, 16)
}

const formatScore = (value?: number | null) => Number(value || 0).toFixed(2)

const load = async () => {
  students.value = await getTeacherCourseStudentsApi(courseId, {
    keyword: keyword.value || undefined
  })
}

const removeStudent = async (student: TeacherCourseStudentItem) => {
  const displayName = student.nickname || student.username
  try {
    const { value } = await ElMessageBox.prompt(
      `确认将“${displayName}”移出课程吗？移出后该学生将无法继续进入本课程学习。`,
      '移出课程',
      {
        confirmButtonText: '确认移出',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入移出原因',
        inputValidator: (input) => !!input?.trim() || '请输入移出原因',
        inputType: 'textarea'
      }
    )

    removingStudentId.value = student.studentId
    await removeTeacherCourseStudentApi(courseId, student.studentId, {
      reviewRemark: value.trim()
    })
    ElMessage.success('已将该学生移出课程')
    await load()
  } catch {
    // ignore cancel
  } finally {
    removingStudentId.value = null
  }
}

const goBack = () => {
  router.push('/teacher/courses')
}

const goGradebook = () => {
  router.push(`/teacher/course-gradebook/${courseId}`)
}

onMounted(load)
</script>

<style scoped>
.student-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.toolbar {
  margin-bottom: 0;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.student-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.student-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 720px) {
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
