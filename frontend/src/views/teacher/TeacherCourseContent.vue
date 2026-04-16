<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">建课检查清单</div>
          <div class="section-desc">先补齐课程基础内容，再进入审核。系统会直接告诉你当前还缺什么。</div>
        </div>
        <div class="page-actions">
          <el-button plain @click="goResourcePage()">去资源页</el-button>
          <el-button plain @click="goCourses">返回课程管理</el-button>
        </div>
      </div>

      <div class="checklist-grid">
        <div
          v-for="item in checklistItems"
          :key="item.key"
          class="checklist-card"
          :class="{ done: item.done, pending: !item.done }"
        >
          <div class="checklist-head">
            <div class="checklist-name">{{ item.label }}</div>
            <el-tag :type="item.done ? 'success' : 'danger'" round>{{ item.done ? '已完成' : '未完成' }}</el-tag>
          </div>
          <div class="checklist-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="overview-row">
        <div class="stat-card">
          <div class="label">课程标题</div>
          <div class="value value-small">{{ course.title || '未填写' }}</div>
        </div>
        <div class="stat-card">
          <div class="label">章节数</div>
          <div class="value">{{ chapters.length }}</div>
        </div>
        <div class="stat-card">
          <div class="label">资源数</div>
          <div class="value">{{ resourceCount }}</div>
        </div>
        <div class="stat-card">
          <div class="label">作业数</div>
          <div class="value">{{ assignments.length }}</div>
        </div>
      </div>

      <el-alert
        v-if="missingChecklistItems.length"
        class="warning-alert"
        type="warning"
        :closable="false"
        show-icon
        :title="`当前还不能提交审核，还缺少：${missingChecklistItems.join('、')}`"
        description="建议先完成课程标题、至少 1 个章节、至少 1 个资源、至少 1 个作业。补齐后再回到课程管理页提交审核。"
      />

      <el-alert
        v-else
        class="warning-alert"
        type="success"
        :closable="false"
        show-icon
        title="当前建课内容已补齐"
        description="课程基础结构已满足审核前检查，可以回到课程管理页提交审核。"
      />
    </div>

    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">章节管理</div>
          <div class="section-desc">先搭建课程骨架，再把资源挂到对应章节中。</div>
        </div>
      </div>

      <div class="toolbar section-toolbar">
        <el-input v-model="chapterForm.title" placeholder="章节名称，例如：第一章 课程导学" />
        <el-input-number v-model="chapterForm.sortNo" :min="1" />
        <el-button type="primary" @click="saveChapter">新建章节</el-button>
      </div>

      <div v-if="!chapters.length" class="section-hint">当前还没有章节，请先至少创建 1 个章节。</div>

      <div v-for="chapter in chapters" :key="chapter.id" class="chapter-box">
        <div class="chapter-header">
          <div>
            <strong>{{ chapter.sortNo }}. {{ chapter.title }}</strong>
            <div class="meta-text" style="margin-top: 6px;">
              本章资源数：{{ resourcesMap[chapter.id]?.length || 0 }}
            </div>
          </div>

          <div class="table-actions">
            <el-button link type="primary" @click="goResourcePage(chapter.id)">管理本章资源</el-button>
            <el-button link type="danger" @click="deleteChapter(chapter.id)">删除章节</el-button>
          </div>
        </div>

        <div v-if="resourcesMap[chapter.id]?.length" class="resource-rows">
          <div v-for="res in resourcesMap[chapter.id]" :key="res.id" class="resource-row">
            <div>
              <div class="resource-title">{{ res.title }}</div>
              <div class="meta-text" style="margin-top: 4px;">{{ res.url }}</div>
            </div>

            <div class="table-actions">
              <el-button link type="primary" @click="selectCommentResource(res)">评论管理</el-button>
              <el-button link @click="goResourcePage(chapter.id)">去资源页</el-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-tip chapter-empty">
          本章还没有资源，请去“课程资源”页面上传至少 1 个资源。
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">作业与问答</div>
          <div class="section-desc">发布至少 1 个作业，并在这里集中处理学生提问。</div>
        </div>
      </div>

      <div class="toolbar section-toolbar">
        <el-input v-model="assignmentForm.title" placeholder="作业标题" />
        <el-input v-model="assignmentForm.content" placeholder="作业内容或要求" />
        <el-button type="primary" @click="saveAssignment">发布作业</el-button>
      </div>

      <div v-if="!assignments.length" class="section-hint">当前还没有作业，请至少创建 1 个作业，用于支撑课程练习与问答。</div>

      <div v-for="a in assignments" :key="a.id" class="chapter-box">
        <div class="assignment-head">
          <div>
            <strong>{{ a.title }}</strong>
            <div class="meta-text" style="margin-top: 6px;">{{ a.description || a.content || '暂无作业说明' }}</div>
          </div>
          <div class="table-actions">
            <el-button link type="primary" @click="viewSubs(a.id)">查看提交</el-button>
            <el-button link @click="loadAssignmentQuestions(a.id)">加载问答</el-button>
            <el-button link type="danger" @click="deleteAssignment(a.id)">删除</el-button>
          </div>
        </div>

        <div v-if="questionMap[a.id]?.length" class="question-list">
          <div v-for="q in questionMap[a.id]" :key="q.id" class="question-box">
            <div class="question-title">{{ q.title }}</div>
            <div class="question-content">{{ q.content }}</div>
            <el-input
              v-model="answerMap[q.id]"
              type="textarea"
              :placeholder="q.answer || '输入回复内容'"
              style="margin-top:10px;"
            />
            <el-button plain style="margin-top:10px;" @click="answer(q.id)">
              回复问题
            </el-button>
          </div>
        </div>

        <div v-else class="empty-tip assignment-empty">
          还没有加载到问答记录，点击“加载问答”可查看当前作业下的学生提问。
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">资源评论管理</div>
          <div class="section-desc">从已上传资源中选择一个，集中处理评论、点赞和教师回复。</div>
        </div>
      </div>

      <div v-if="allResources.length" class="comment-resource-bar">
        <el-select
          :model-value="selectedCommentResource?.id"
          placeholder="请选择要管理评论的资源"
          style="width: 100%; max-width: 420px;"
          @change="selectCommentResourceById"
        >
          <el-option
            v-for="item in allResources"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>

        <div class="meta-text">
          当前资源：{{ selectedCommentResource?.title || '未选择' }}
        </div>
      </div>

      <div v-if="!allResources.length" class="section-hint">还没有可管理评论的资源，请先至少上传 1 个资源。</div>

      <div v-if="selectedCommentResource">
        <div v-if="comments.length" class="comment-list">
          <div v-for="item in comments" :key="item.id" class="comment-card">
            <div class="comment-head">
              <div>
                <div class="comment-user">
                  {{ item.userNickname || '用户' }}
                  <el-tag size="small" style="margin-left: 8px;">{{ item.userRole || '-' }}</el-tag>
                  <el-tag v-if="item.pinned" type="danger" size="small" style="margin-left: 8px;">置顶</el-tag>
                </div>
                <div class="comment-time">{{ item.createdAt }}</div>
              </div>
            </div>

            <div class="comment-content">{{ item.content }}</div>

            <div class="comment-actions">
              <el-button link @click="toggleLikeComment(item.id)">
                {{ item.liked ? '取消点赞' : '点赞' }}（{{ item.likeCount || 0 }}）
              </el-button>
              <el-button link type="danger" @click="togglePin(item.id)">
                {{ item.pinned ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button link @click="toggleReplyBox(item.id)">回复</el-button>
            </div>

            <div v-if="replyBoxMap[item.id]" class="reply-editor">
              <el-input
                v-model="replyTextMap[item.id]"
                type="textarea"
                :rows="2"
                placeholder="请输入回复内容"
                maxlength="500"
                show-word-limit
              />
              <div class="reply-submit-row">
                <el-button size="small" @click="toggleReplyBox(item.id)">取消</el-button>
                <el-button size="small" type="primary" @click="submitReply(item.id)">发送回复</el-button>
              </div>
            </div>

            <div v-if="item.replies?.length" class="reply-list">
              <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                <div class="reply-head">
                  <span class="reply-user">{{ reply.userNickname || '用户' }}</span>
                  <el-tag size="small" style="margin-left: 6px;">{{ reply.userRole || '-' }}</el-tag>
                  <span class="reply-time">{{ reply.createdAt }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
                <div class="reply-actions">
                  <el-button link size="small" @click="toggleLikeReply(reply.id)">
                    {{ reply.liked ? '取消点赞' : '点赞' }}（{{ reply.likeCount || 0 }}）
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="该资源下暂无评论" />
      </div>

      <el-empty v-else description="请先从课程资源中选择一个资源" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTeacherCourseDetailApi, type CourseItem } from '@/api/course'
import { getChaptersApi, saveChapterApi, deleteChapterApi } from '@/api/chapter'
import { getResourcesApi } from '@/api/resource'
import { getAssignmentsApi, saveAssignmentApi, deleteAssignmentApi } from '@/api/assignment'
import { getQuestionsByAssignmentApi, answerQuestionApi } from '@/api/question'
import {
  getCommentsByResourceApi,
  replyCommentApi,
  likeCommentApi,
  likeReplyApi,
  pinCommentApi
} from '@/api/comment'
import type { CommentItem } from '@/api/comment'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.courseId)

const course = reactive<CourseItem>({
  id: courseId,
  teacherId: 0,
  title: '',
  status: ''
})
const chapters = ref<any[]>([])
const resourcesMap = reactive<Record<number, any[]>>({})
const assignments = ref<any[]>([])
const questionMap = reactive<Record<number, any[]>>({})
const answerMap = reactive<Record<number, string>>({})
const comments = ref<CommentItem[]>([])
const selectedCommentResource = ref<any>(null)
const replyBoxMap = reactive<Record<number, boolean>>({})
const replyTextMap = reactive<Record<number, string>>({})

const chapterForm = reactive({ courseId, title: '', sortNo: 1 })
const assignmentForm = reactive({ courseId, title: '', content: '', deadline: null as any })

const resourceCount = computed(() =>
  Object.values(resourcesMap).reduce((sum, items) => sum + (items?.length || 0), 0)
)

const allResources = computed(() =>
  chapters.value.flatMap(chapter => resourcesMap[chapter.id] || [])
)

const checklistItems = computed(() => [
  {
    key: 'title',
    label: '课程标题',
    done: !!String(course.title || '').trim(),
    desc: String(course.title || '').trim() ? `当前标题：${course.title}` : '请先在课程编辑弹窗中填写课程标题'
  },
  {
    key: 'chapter',
    label: '至少 1 个章节',
    done: chapters.value.length > 0,
    desc: chapters.value.length > 0 ? `已创建 ${chapters.value.length} 个章节` : '当前还没有章节'
  },
  {
    key: 'resource',
    label: '至少 1 个资源',
    done: resourceCount.value > 0,
    desc: resourceCount.value > 0 ? `当前共有 ${resourceCount.value} 个资源` : '当前还没有资源'
  },
  {
    key: 'assignment',
    label: '至少 1 个作业',
    done: assignments.value.length > 0,
    desc: assignments.value.length > 0 ? `已发布 ${assignments.value.length} 个作业` : '当前还没有作业'
  }
])

const missingChecklistItems = computed(() =>
  checklistItems.value.filter(item => !item.done).map(item => item.label)
)

const load = async () => {
  const [courseRes, chapterRes, assignmentRes] = await Promise.all([
    getTeacherCourseDetailApi(courseId),
    getChaptersApi(courseId),
    getAssignmentsApi(courseId)
  ])

  Object.assign(course, courseRes)
  chapters.value = chapterRes
  assignments.value = assignmentRes

  const resourceEntries = await Promise.all(
    chapters.value.map(async (chapter) => [chapter.id, await getResourcesApi(chapter.id)] as const)
  )

  for (const key of Object.keys(resourcesMap)) {
    delete resourcesMap[Number(key)]
  }

  for (const [chapterId, items] of resourceEntries) {
    resourcesMap[chapterId] = items
  }

  if (selectedCommentResource.value?.id) {
    const matched = allResources.value.find(item => item.id === selectedCommentResource.value.id)
    selectedCommentResource.value = matched || null
  }

  if (!selectedCommentResource.value && allResources.value.length) {
    selectedCommentResource.value = allResources.value[0]
  }

  await loadComments()
}

const loadAssignmentQuestions = async (assignmentId: number) => {
  questionMap[assignmentId] = await getQuestionsByAssignmentApi(assignmentId)
}

const loadComments = async () => {
  if (!selectedCommentResource.value?.id) {
    comments.value = []
    return
  }
  comments.value = await getCommentsByResourceApi(selectedCommentResource.value.id)
}

const saveChapter = async () => {
  if (!String(chapterForm.title || '').trim()) {
    ElMessage.warning('请输入章节名称')
    return
  }

  await saveChapterApi({
    ...chapterForm,
    title: String(chapterForm.title || '').trim()
  })
  chapterForm.title = ''
  ElMessage.success('章节已保存')
  await load()
}

const deleteChapter = async (id: number) => {
  await deleteChapterApi(id)
  ElMessage.success('删除成功')
  await load()
}

const saveAssignment = async () => {
  if (!String(assignmentForm.title || '').trim()) {
    ElMessage.warning('请输入作业标题')
    return
  }
  if (!String(assignmentForm.content || '').trim()) {
    ElMessage.warning('请输入作业内容')
    return
  }

  await saveAssignmentApi({
    ...assignmentForm,
    title: String(assignmentForm.title || '').trim(),
    content: String(assignmentForm.content || '').trim()
  })
  assignmentForm.title = ''
  assignmentForm.content = ''
  ElMessage.success('作业已发布')
  await load()
}

const deleteAssignment = async (id: number) => {
  await deleteAssignmentApi(id)
  ElMessage.success('删除成功')
  await load()
}

const answer = async (id: number) => {
  const answerText = String(answerMap[id] || '').trim()
  if (!answerText) {
    ElMessage.warning('请输入回复内容')
    return
  }

  await answerQuestionApi(id, {
    answer: answerText,
    status: 'RESOLVED'
  })
  ElMessage.success('回复成功')
  answerMap[id] = ''
  for (const assignment of assignments.value) {
    if (questionMap[assignment.id]?.some((q: any) => q.id === id)) {
      await loadAssignmentQuestions(assignment.id)
      break
    }
  }
}

const viewSubs = (assignmentId: number) => {
  router.push(`/teacher/submissions/${assignmentId}`)
}

const goResourcePage = (chapterId?: number) => {
  router.push({
    path: `/teacher/resources/${courseId}`,
    query: chapterId ? { chapterId: String(chapterId) } : {}
  })
}

const goCourses = () => {
  router.push('/teacher/courses')
}

const selectCommentResource = async (resource: any) => {
  selectedCommentResource.value = resource
  await loadComments()
}

const selectCommentResourceById = async (resourceId: number) => {
  const matched = allResources.value.find(item => item.id === resourceId) || null
  selectedCommentResource.value = matched
  await loadComments()
}

const toggleReplyBox = (commentId: number) => {
  replyBoxMap[commentId] = !replyBoxMap[commentId]
}

const submitReply = async (commentId: number) => {
  const text = (replyTextMap[commentId] || '').trim()
  if (!text) {
    ElMessage.warning('请输入回复内容')
    return
  }

  await replyCommentApi({
    commentId,
    parentReplyId: null,
    content: text
  })

  ElMessage.success('回复成功')
  replyTextMap[commentId] = ''
  replyBoxMap[commentId] = false
  await loadComments()
}

const toggleLikeComment = async (commentId: number) => {
  await likeCommentApi(commentId)
  await loadComments()
}

const toggleLikeReply = async (replyId: number) => {
  await likeReplyApi(replyId)
  await loadComments()
}

const togglePin = async (commentId: number) => {
  await pinCommentApi(commentId)
  ElMessage.success('置顶状态已更新')
  await loadComments()
}

onMounted(load)
</script>

<style scoped>
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.checklist-card {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.checklist-card.done {
  background: linear-gradient(180deg, #f0fdf4, #f8fafc);
  border-color: #bbf7d0;
}

.checklist-card.pending {
  background: linear-gradient(180deg, #fff7ed, #fff);
  border-color: #fdba74;
}

.checklist-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.checklist-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.checklist-desc {
  margin-top: 10px;
  color: #475569;
  line-height: 1.7;
  font-size: 13px;
}

.overview-row {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.value-small {
  font-size: 18px;
  line-height: 1.5;
  word-break: break-word;
}

.warning-alert {
  margin-top: 18px;
}

.section-toolbar {
  margin-bottom: 16px;
}

.section-hint {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  line-height: 1.7;
}

.chapter-box,
.question-box,
.comment-card {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff, #f8fafc);
  margin-bottom: 14px;
}

.chapter-header,
.assignment-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.resource-rows,
.question-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.resource-title,
.question-title {
  font-weight: 700;
  color: #0f172a;
}

.question-content {
  margin-top: 6px;
  color: #334155;
  line-height: 1.8;
}

.chapter-empty,
.assignment-empty {
  margin-top: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.comment-resource-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

.comment-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-user {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.comment-time {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.comment-content {
  margin-top: 12px;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

.comment-actions {
  margin-top: 10px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.reply-editor {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.reply-submit-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-list {
  margin-top: 14px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  padding: 10px 12px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.reply-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.reply-user {
  font-weight: 600;
  color: #0f172a;
}

.reply-time {
  margin-left: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.reply-content {
  margin-top: 8px;
  line-height: 1.7;
  color: #334155;
}

.reply-actions {
  margin-top: 8px;
}

@media (max-width: 960px) {
  .checklist-grid,
  .overview-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .checklist-grid,
  .overview-row {
    grid-template-columns: 1fr;
  }

  .chapter-header,
  .assignment-head,
  .resource-row,
  .comment-resource-bar,
  .reply-submit-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
