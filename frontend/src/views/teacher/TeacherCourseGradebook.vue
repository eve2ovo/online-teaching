<template>
  <div class="gradebook-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">成绩汇总</div>
          <div class="section-desc">查看综合成绩、完成率和学习进度。</div>
          <div class="course-title" v-if="gradebook.courseTitle">{{ gradebook.courseTitle }}</div>
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
          <el-button type="primary" @click="goStudents">学生列表</el-button>
          <el-button plain @click="goBack">返回课程</el-button>
        </div>
      </div>

      <div class="grid-5">
        <div class="stat-card">
          <div class="label">学生人数</div>
          <div class="value">{{ gradebook.studentCount }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均综合成绩</div>
          <div class="value">{{ formatScore(gradebook.averageOverallScore) }}</div>
        </div>
        <div class="stat-card">
          <div class="label">平均学习进度</div>
          <div class="value">{{ gradebook.averageProgressPercent }}%</div>
        </div>
        <div class="stat-card">
          <div class="label">作业完成率</div>
          <div class="value">{{ gradebook.assignmentCompletionRate }}%</div>
        </div>
        <div class="stat-card">
          <div class="label">练习完成率</div>
          <div class="value">{{ gradebook.practiceCompletionRate }}%</div>
        </div>
      </div>

      <div class="meta-row">
        <span>课程作业数：{{ gradebook.assignmentCount }}</span>
        <span>课程练习数：{{ gradebook.practiceSetCount }}</span>
      </div>

      <el-table v-if="gradebook.students.length" :data="gradebook.students" border style="margin-top: 18px;">
        <el-table-column prop="rank" label="排名" width="80" />

        <el-table-column label="学生信息" min-width="210">
          <template #default="{ row }">
            <div class="student-name">{{ row.nickname || row.username }}</div>
            <div class="student-sub">{{ row.username }}</div>
            <div class="student-sub" v-if="row.email">{{ row.email }}</div>
          </template>
        </el-table-column>

        <el-table-column label="学习情况" min-width="180">
          <template #default="{ row }">
            <div class="student-sub">学习进度：{{ row.progressPercent }}%</div>
            <div class="student-sub">已完成资源：{{ row.completedResources }}/{{ row.totalResources }}</div>
            <div class="student-sub">最近学习：{{ formatTime(row.lastLearnedAt) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="作业成绩" min-width="180">
          <template #default="{ row }">
            <div class="student-sub">完成率：{{ row.assignmentCompletionRate }}%</div>
            <div class="student-sub">已提交：{{ row.submittedAssignmentCount }}/{{ row.assignmentCount }}</div>
            <div class="student-sub">平均分：{{ formatScore(row.averageAssignmentScore) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="练习成绩" min-width="180">
          <template #default="{ row }">
            <div class="student-sub">完成率：{{ row.practiceCompletionRate }}%</div>
            <div class="student-sub">已完成：{{ row.submittedPracticeCount }}/{{ row.practiceSetCount }}</div>
            <div class="student-sub">平均分：{{ formatScore(row.averagePracticeScore) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="综合成绩" min-width="160">
          <template #default="{ row }">
            <div class="overall-score">{{ formatScore(row.overallScore) }}</div>
            <div class="student-sub">选课时间：{{ formatTime(row.enrolledAt) }}</div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="当前课程暂无成绩汇总数据，可能还没有学生选课或尚未产生作业、练习成绩。" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTeacherCourseGradebookApi, type TeacherCourseGradebookResult } from '@/api/course'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.courseId)

const keyword = ref('')
const gradebook = reactive<TeacherCourseGradebookResult>({
  courseId,
  courseTitle: '',
  studentCount: 0,
  assignmentCount: 0,
  practiceSetCount: 0,
  averageProgressPercent: 0,
  assignmentCompletionRate: 0,
  practiceCompletionRate: 0,
  averageOverallScore: 0,
  students: []
})

const formatTime = (value?: string | null) => {
  if (!value) {
    return '暂无'
  }
  return value.replace('T', ' ').slice(0, 16)
}

const formatScore = (value?: number | null) => Number(value || 0).toFixed(2)

const load = async () => {
  const res = await getTeacherCourseGradebookApi(courseId, {
    keyword: keyword.value || undefined
  })
  Object.assign(gradebook, res)
}

const goStudents = () => {
  router.push(`/teacher/course-students/${courseId}`)
}

const goBack = () => {
  router.push('/teacher/courses')
}

onMounted(load)
</script>

<style scoped>
.gradebook-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.toolbar {
  margin-bottom: 0;
}

.course-title {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.grid-5 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.meta-row {
  margin-top: 16px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 13px;
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

.overall-score {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 1280px) {
  .grid-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .grid-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .grid-5 {
    grid-template-columns: 1fr;
  }
}
</style>
