<template>
  <div class="learn-page">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">{{ detail.course?.title || '课程学习' }}</div>
          <div class="section-desc">
            {{ detail.course?.description || '围绕当前学习位置继续推进课程，保持节奏，优先完成本节资源。' }}
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="goBack">返回首页</el-button>
          <el-button @click="goDetail">课程详情</el-button>
          <el-button type="primary" @click="load">刷新内容</el-button>
        </div>
      </div>

      <div class="top-progress">
        <div class="progress-stat">
          <div class="label">总进度</div>
          <div class="value">{{ progress?.progressPercent || 0 }}%</div>
        </div>
        <div class="progress-stat">
          <div class="label">已完成资源数</div>
          <div class="value">{{ progress?.completedResources || 0 }}/{{ progress?.totalResources || 0 }}</div>
        </div>
        <div class="progress-stat">
          <div class="label">最近学习时间</div>
          <div class="value small">{{ formatTime(progress?.lastLearnedAt) }}</div>
        </div>
        <div class="progress-stat">
          <div class="label">当前学习位置</div>
          <div class="value small">{{ currentPositionText }}</div>
        </div>
      </div>

      <div class="continuity-bar">
        <div class="continuity-copy">
          <div class="continuity-title">学习连续性</div>
          <div class="continuity-desc">
            {{ currentVideo ? `当前正在学习《${currentVideo.title}》` : '当前课程还没有可学习资源' }}
          </div>
        </div>
        <div class="continuity-actions">
          <el-button plain :disabled="!previousResource" @click="goPreviousResource">上一节</el-button>
          <el-button type="primary" :disabled="!nextResource" @click="goNextResource">下一节</el-button>
        </div>
      </div>

      <el-progress :percentage="progress?.progressPercent || 0" :stroke-width="12" />
    </div>

    <div class="learn-layout">
      <div class="page-card sidebar-card">
        <div class="section-title sidebar-title">课程目录</div>
        <div class="section-desc sidebar-desc">每个资源会显示完成状态，当前学习资源会被重点高亮。</div>

        <div v-if="detail.chapters.length">
          <div v-for="chapter in detail.chapters" :key="chapter.id" class="chapter-box">
            <div class="chapter-head">
              <div class="chapter-name">第 {{ chapter.sortNo }} 章 · {{ chapter.title }}</div>
              <el-tag size="small" :type="chapterProgress(chapter.id).progressPercent >= 100 ? 'success' : 'info'">
                {{ chapterProgress(chapter.id).progressPercent }}%
              </el-tag>
            </div>

            <div class="chapter-meta">
              已完成 {{ chapterProgress(chapter.id).completedResources }}/{{ chapterProgress(chapter.id).totalResources }} 个资源
            </div>

            <el-progress
              :percentage="chapterProgress(chapter.id).progressPercent"
              :stroke-width="8"
              :show-text="false"
              style="margin: 8px 0 12px;"
            />

            <div v-if="chapter.resources?.length" class="video-list">
              <div
                v-for="item in chapter.resources"
                :key="item.id"
                class="video-item"
                :class="{ active: currentVideo?.id === item.id }"
                @click="selectVideo(item, chapter)"
              >
                <div class="video-row">
                  <div class="video-title">{{ item.title }}</div>
                  <el-tag size="small" :type="resourceStatusType(item.id)">
                    {{ resourceStatusText(item.id) }}
                  </el-tag>
                </div>
                <div class="video-meta">
                  {{ item.type }}<span v-if="item.fileName"> · {{ item.fileName }}</span>
                </div>
              </div>
            </div>

            <el-empty v-else description="当前章节还没有资源" :image-size="70" />
          </div>
        </div>

        <el-empty v-else description="当前课程还没有章节目录" />
      </div>

      <div class="content-area">
        <div class="page-card player-card">
          <template v-if="currentVideo">
            <div class="player-header">
              <div>
                <div class="section-title player-title">{{ currentVideo.title }}</div>
                <div class="section-desc">
                  第 {{ currentChapter?.sortNo || '-' }} 章 · {{ resourceStatusText(currentVideo.id) }} · 第 {{ currentChapterResourceIndex }} 个资源
                </div>
              </div>
              <div class="player-actions">
                <el-button plain @click="persistCurrentProgress(true)">保存进度</el-button>
                <el-button type="success" plain @click="markCurrentVideoCompleted">标记完成</el-button>
              </div>
            </div>

            <div class="video-wrapper">
              <video
                ref="videoRef"
                :src="currentVideo.url"
                controls
                playsinline
                preload="metadata"
                style="width: 100%; border-radius: 16px; background: #000;"
                @loadedmetadata="handleLoadedMetadata"
                @timeupdate="handleTimeUpdate"
                @pause="handlePause"
                @ended="handleVideoEnded"
              />
            </div>

            <div class="resource-info">
              <div class="meta-row"><span>资源类型</span>{{ currentVideo.type || '未知' }}</div>
              <div class="meta-row"><span>学习进度</span>{{ resourceProgress(currentVideo.id).progressPercent }}%</div>
              <div class="meta-row"><span>已学习时长</span>{{ formatSeconds(resourceProgress(currentVideo.id).learnedSeconds) }}</div>
              <div class="meta-row"><span>资源文件</span>{{ currentVideo.fileName || '未提供文件名' }}</div>
            </div>
          </template>

          <el-empty v-else description="当前课程还没有可学习资源，稍后再来看看吧。" />
        </div>

        <div v-if="nextResource" class="page-card next-resource-card">
          <div class="next-resource-copy">
            <div class="next-kicker">下一节提示</div>
            <div class="next-title">{{ nextResource.resource.title }}</div>
            <div class="section-desc">所属章节：第 {{ nextResource.chapter.sortNo }} 章 · {{ nextResource.chapter.title }}</div>
          </div>
          <el-button type="primary" @click="goNextResource">进入下一节</el-button>
        </div>

        <div class="page-card" v-if="currentVideo">
          <div class="split-header">
            <div>
              <div class="section-title">资源评论与答疑</div>
              <div class="section-desc">围绕当前资源展开提问与讨论，回复区可按需展开，保持学习上下文集中。</div>
            </div>
          </div>

          <div class="comment-editor">
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="3"
              placeholder="写下你对当前资源的理解、疑问或补充说明"
              maxlength="1000"
              show-word-limit
            />
            <div class="comment-submit">
              <el-button type="primary" @click="submitComment">发表评论</el-button>
            </div>
          </div>

          <div v-if="comments.length" class="comment-list">
            <div v-for="item in comments" :key="item.id" class="comment-card">
              <div class="comment-top">
                <div>
                  <div class="comment-user">
                    {{ item.userNickname || '匿名用户' }}
                    <el-tag size="small" style="margin-left: 8px;">{{ item.userRole || '-' }}</el-tag>
                    <el-tag
                      v-if="item.pinned"
                      type="danger"
                      size="small"
                      style="margin-left: 8px;"
                    >
                      置顶
                    </el-tag>
                  </div>
                  <div class="comment-time">{{ formatTime(item.createdAt) }}</div>
                </div>
              </div>

              <div class="comment-content">{{ item.content }}</div>

              <div class="comment-actions">
                <el-button link @click="toggleLikeComment(item.id)">
                  {{ item.liked ? '已点赞' : '点赞' }} {{ item.likeCount || 0 }}
                </el-button>
                <el-button link @click="toggleReplyBox(item.id)">
                  {{ replyBoxMap[item.id] ? '收起回复框' : '回复' }}
                </el-button>
              </div>

              <div v-if="replyBoxMap[item.id]" class="reply-editor">
                <el-input
                  v-model="replyTextMap[item.id]"
                  type="textarea"
                  :rows="2"
                  placeholder="补充你的回复内容"
                  maxlength="500"
                  show-word-limit
                />
                <div class="reply-submit">
                  <el-button size="small" @click="toggleReplyBox(item.id)">取消</el-button>
                  <el-button size="small" type="primary" @click="submitReply(item.id)">提交回复</el-button>
                </div>
              </div>

              <div v-if="item.replies?.length" class="reply-list">
                <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                  <div class="reply-head">
                    <span class="reply-user">{{ reply.userNickname || '匿名用户' }}</span>
                    <el-tag size="small" style="margin-left: 6px;">{{ reply.userRole || '-' }}</el-tag>
                    <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                  <div class="reply-actions">
                    <el-button text size="small" @click="toggleLikeReply(reply.id)">
                      {{ reply.liked ? '已点赞' : '点赞' }} {{ reply.likeCount || 0 }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="当前资源还没有评论，欢迎留下第一条学习记录。" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudentLearnDetailApi, type ChapterLearnItem, type LearnDetailResult, type ResourceItem } from '@/api/course'
import type { CommentItem } from '@/api/comment'
import {
  getCommentsByResourceApi,
  addCommentApi,
  replyCommentApi,
  likeCommentApi,
  likeReplyApi
} from '@/api/comment'
import {
  getCourseStudyProgressApi,
  saveStudyProgressApi,
  type StudyProgressSummary
} from '@/api/progress'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.id)

const detail = reactive<LearnDetailResult>({
  course: {
    id: 0,
    teacherId: 0,
    title: '',
    status: ''
  },
  chapters: []
})

const progress = ref<StudyProgressSummary | null>(null)
const currentVideo = ref<ResourceItem | null>(null)
const currentChapter = ref<ChapterLearnItem | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const comments = ref<CommentItem[]>([])
const commentText = ref('')
const replyBoxMap = reactive<Record<number, boolean>>({})
const replyTextMap = reactive<Record<number, string>>({})
const lastPersistedSecondMap = reactive<Record<number, number>>({})
const restoringPosition = ref(false)

interface FlatResourceNavItem {
  chapter: ChapterLearnItem
  resource: ResourceItem
}

const resourceProgressMap = computed(() => {
  const map = new Map<number, { progressPercent: number; learnedSeconds: number; completed: boolean }>()
  for (const item of progress.value?.resources || []) {
    map.set(item.resourceId, {
      progressPercent: item.progressPercent || 0,
      learnedSeconds: item.learnedSeconds || 0,
      completed: !!item.completed
    })
  }
  return map
})

const chapterProgressMap = computed(() => {
  const map = new Map<number, { progressPercent: number; completedResources: number; totalResources: number }>()
  for (const item of progress.value?.chapters || []) {
    map.set(item.chapterId, {
      progressPercent: item.progressPercent || 0,
      completedResources: item.completedResources || 0,
      totalResources: item.totalResources || 0
    })
  }
  return map
})

const flatResources = computed<FlatResourceNavItem[]>(() =>
  detail.chapters.flatMap(chapter =>
    (chapter.resources || []).map(resource => ({ chapter, resource }))
  )
)

const currentResourceIndex = computed(() =>
  flatResources.value.findIndex(item => item.resource.id === currentVideo.value?.id)
)

const currentChapterResourceIndex = computed(() => {
  if (!currentVideo.value || !currentChapter.value?.resources?.length) {
    return '-'
  }
  const index = currentChapter.value.resources.findIndex(item => item.id === currentVideo.value?.id)
  return index >= 0 ? index + 1 : '-'
})

const currentPositionText = computed(() => {
  if (!currentVideo.value || !currentChapter.value) {
    return '暂无学习位置'
  }
  return `第 ${currentChapter.value.sortNo} 章 · 第 ${currentChapterResourceIndex.value} 个资源 · 共 ${flatResources.value.length} 个资源`
})

const previousResource = computed(() => {
  const index = currentResourceIndex.value
  return index > 0 ? flatResources.value[index - 1] : null
})

const nextResource = computed(() => {
  const index = currentResourceIndex.value
  return index >= 0 && index < flatResources.value.length - 1 ? flatResources.value[index + 1] : null
})

const resourceProgress = (resourceId: number) =>
  resourceProgressMap.value.get(resourceId) || { progressPercent: 0, learnedSeconds: 0, completed: false }

const chapterProgress = (chapterId: number) =>
  chapterProgressMap.value.get(chapterId) || { progressPercent: 0, completedResources: 0, totalResources: 0 }

const resourceStatusText = (resourceId: number) => {
  if (currentVideo.value?.id === resourceId) {
    return '学习中'
  }
  const item = resourceProgress(resourceId)
  if (item.completed || item.progressPercent >= 100) {
    return '已完成'
  }
  if (item.progressPercent > 0) {
    return '学习中'
  }
  return '未开始'
}

const resourceStatusType = (resourceId: number) => {
  const text = resourceStatusText(resourceId)
  if (text === '已完成') {
    return 'success'
  }
  if (text === '学习中') {
    return 'primary'
  }
  return 'info'
}

const formatTime = (value?: string | null) => {
  if (!value) {
    return '暂无记录'
  }
  return value.replace('T', ' ').slice(0, 16)
}

const formatSeconds = (value?: number) => {
  const seconds = Math.max(value || 0, 0)
  const minute = Math.floor(seconds / 60)
  const remain = seconds % 60
  return `${minute}分 ${String(remain).padStart(2, '0')}秒`
}

const findChapterByResourceId = (resourceId?: number | null) => {
  if (!resourceId) {
    return null
  }
  for (const chapter of detail.chapters) {
    const matched = chapter.resources?.find(item => item.id === resourceId)
    if (matched) {
      return { chapter, resource: matched }
    }
  }
  return null
}

const initProgressSkeleton = () => {
  progress.value = {
    courseId,
    totalResources: detail.chapters.reduce((sum, chapter) => sum + (chapter.resources?.length || 0), 0),
    completedResources: 0,
    progressPercent: 0,
    currentChapterId: null,
    currentResourceId: null,
    lastLearnedAt: null,
    chapters: detail.chapters.map(chapter => ({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sortNo: chapter.sortNo,
      totalResources: chapter.resources?.length || 0,
      completedResources: 0,
      progressPercent: 0
    })),
    resources: detail.chapters.flatMap(chapter =>
      (chapter.resources || []).map(resource => ({
        resourceId: resource.id,
        chapterId: chapter.id,
        progressPercent: 0,
        learnedSeconds: 0,
        completed: false,
        lastLearnedAt: null
      }))
    )
  }
}

const recomputeProgressSummary = () => {
  if (!progress.value) {
    return
  }

  const chapterResources = new Map<number, number[]>()
  for (const chapter of detail.chapters) {
    chapterResources.set(chapter.id, (chapter.resources || []).map(item => item.id))
  }

  const resources = progress.value.resources || []
  progress.value.totalResources = resources.length
  progress.value.completedResources = resources.filter(item => item.completed).length
  const totalPercent = resources.reduce((sum, item) => sum + (item.progressPercent || 0), 0)
  progress.value.progressPercent = resources.length ? Math.round(totalPercent / resources.length) : 0

  progress.value.chapters = detail.chapters.map(chapter => {
    const ids = chapterResources.get(chapter.id) || []
    const current = resources.filter(item => ids.includes(item.resourceId))
    const chapterTotal = ids.length
    const chapterCompleted = current.filter(item => item.completed).length
    const chapterPercent = chapterTotal
      ? Math.round(current.reduce((sum, item) => sum + (item.progressPercent || 0), 0) / chapterTotal)
      : 0
    return {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sortNo: chapter.sortNo,
      totalResources: chapterTotal,
      completedResources: chapterCompleted,
      progressPercent: chapterPercent
    }
  })
}

const applyLocalProgressUpdate = (
  chapterId: number,
  resourceId: number,
  learnedSeconds: number,
  progressPercent: number,
  completed: boolean
) => {
  if (!progress.value) {
    initProgressSkeleton()
  }
  const now = new Date().toISOString()
  const resourceList = progress.value!.resources
  const current = resourceList.find(item => item.resourceId === resourceId)
  if (current) {
    current.chapterId = chapterId
    current.learnedSeconds = Math.max(learnedSeconds, 0)
    current.completed = completed || current.completed
    current.progressPercent = current.completed ? 100 : Math.max(0, Math.min(100, progressPercent))
    current.lastLearnedAt = now
  } else {
    resourceList.push({
      resourceId,
      chapterId,
      learnedSeconds: Math.max(learnedSeconds, 0),
      completed,
      progressPercent: completed ? 100 : Math.max(0, Math.min(100, progressPercent)),
      lastLearnedAt: now
    })
  }

  progress.value!.currentChapterId = chapterId
  progress.value!.currentResourceId = resourceId
  progress.value!.lastLearnedAt = now
  recomputeProgressSummary()
}

const loadComments = async () => {
  if (!currentVideo.value?.id) {
    comments.value = []
    return
  }
  comments.value = await getCommentsByResourceApi(currentVideo.value.id)
}

const restoreCurrentVideoPosition = () => {
  if (!currentVideo.value?.id || !videoRef.value) {
    return
  }
  const saved = resourceProgress(currentVideo.value.id)
  if (!saved.learnedSeconds || saved.completed) {
    return
  }

  const video = videoRef.value
  const duration = Number.isFinite(video.duration) ? video.duration : 0
  const target = duration > 0 ? Math.min(saved.learnedSeconds, Math.max(duration - 2, 0)) : saved.learnedSeconds
  if (target <= 0) {
    return
  }

  restoringPosition.value = true
  video.currentTime = target
  lastPersistedSecondMap[currentVideo.value.id] = saved.learnedSeconds
  window.setTimeout(() => {
    restoringPosition.value = false
  }, 300)
}

const load = async () => {
  const [detailRes, progressRes] = await Promise.all([
    getStudentLearnDetailApi(courseId),
    getCourseStudyProgressApi(courseId)
  ])

  detail.course = detailRes.course
  detail.chapters = detailRes.chapters || []
  progress.value = progressRes

  const latest = findChapterByResourceId(progressRes.currentResourceId)
  if (latest) {
    currentVideo.value = latest.resource
    currentChapter.value = latest.chapter
  } else {
    currentVideo.value = null
    currentChapter.value = null
    for (const chapter of detail.chapters) {
      if (chapter.resources?.length) {
        currentVideo.value = chapter.resources[0]
        currentChapter.value = chapter
        break
      }
    }
  }

  await loadComments()
  await nextTick()
  restoreCurrentVideoPosition()
}

const selectVideo = async (item: ResourceItem, chapter: ChapterLearnItem) => {
  await persistCurrentProgress(true)
  currentVideo.value = item
  currentChapter.value = chapter
  await loadComments()
  await nextTick()
  restoreCurrentVideoPosition()
}

const switchResource = async (target: FlatResourceNavItem | null) => {
  if (!target) {
    return
  }
  await selectVideo(target.resource, target.chapter)
}

const goPreviousResource = async () => {
  await switchResource(previousResource.value)
}

const goNextResource = async () => {
  await switchResource(nextResource.value)
}

const persistCurrentProgress = async (force = false, completed = false) => {
  if (!currentVideo.value?.id || !currentChapter.value?.id || !videoRef.value) {
    return
  }

  const video = videoRef.value
  const learnedSeconds = Math.floor(video.currentTime || 0)
  const duration = Number.isFinite(video.duration) ? Math.floor(video.duration) : 0
  let progressPercent = duration > 0 ? Math.round((learnedSeconds / duration) * 100) : resourceProgress(currentVideo.value.id).progressPercent
  progressPercent = Math.max(0, Math.min(100, progressPercent))
  const shouldComplete = completed || progressPercent >= 100
  const lastPersistedSeconds = lastPersistedSecondMap[currentVideo.value.id] || 0

  if (!force && !shouldComplete && Math.abs(learnedSeconds - lastPersistedSeconds) < 8) {
    return
  }
  if (restoringPosition.value && !force) {
    return
  }

  await saveStudyProgressApi({
    courseId,
    chapterId: currentChapter.value.id,
    resourceId: currentVideo.value.id,
    learnedSeconds,
    progressPercent,
    completed: shouldComplete
  })

  lastPersistedSecondMap[currentVideo.value.id] = learnedSeconds
  applyLocalProgressUpdate(
    currentChapter.value.id,
    currentVideo.value.id,
    learnedSeconds,
    progressPercent,
    shouldComplete
  )
}

const handleLoadedMetadata = () => {
  restoreCurrentVideoPosition()
}

const handleTimeUpdate = async () => {
  await persistCurrentProgress(false)
}

const handlePause = async () => {
  await persistCurrentProgress(true)
}

const handleVideoEnded = async () => {
  await persistCurrentProgress(true, true)
}

const markCurrentVideoCompleted = async () => {
  if (!videoRef.value) {
    return
  }
  const duration = Number.isFinite(videoRef.value.duration) ? Math.floor(videoRef.value.duration) : 0
  if (duration > 0) {
    videoRef.value.currentTime = duration
  }
  await persistCurrentProgress(true, true)
  ElMessage.success('当前资源已标记为完成')
}

const submitComment = async () => {
  if (!currentVideo.value?.id) {
    ElMessage.warning('请先选择一个资源再发表评论')
    return
  }
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  await addCommentApi({
    courseId,
    chapterId: currentChapter.value?.id || null,
    resourceId: currentVideo.value.id,
    content: commentText.value.trim()
  })

  ElMessage.success('评论已发布')
  commentText.value = ''
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

  ElMessage.success('回复已提交')
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

const goBack = () => {
  router.push('/student/home')
}

const goDetail = () => {
  router.push(`/student/course/${courseId}`)
}

onBeforeUnmount(async () => {
  await persistCurrentProgress(true)
})

onMounted(load)
</script>

<style scoped>
.learn-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.top-progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.progress-stat {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.progress-stat .label {
  font-size: 12px;
  color: #64748b;
}

.progress-stat .value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.progress-stat .value.small {
  font-size: 15px;
  line-height: 1.6;
}

.continuity-bar {
  margin-bottom: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(14, 165, 233, 0.18);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.continuity-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.continuity-desc {
  margin-top: 6px;
  color: #475569;
  line-height: 1.7;
}

.continuity-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.learn-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 18px;
  align-items: start;
}

.sidebar-card {
  position: sticky;
  top: 12px;
}

.sidebar-title {
  font-size: 18px;
}

.sidebar-desc {
  margin-bottom: 16px;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chapter-box {
  padding: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 14px;
}

.chapter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.chapter-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.chapter-meta {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-item {
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #dbe3ef;
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.video-item:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.video-item.active {
  border-color: #2563eb;
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(239, 246, 255, 0.95));
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.video-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.video-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.player-card {
  min-height: 480px;
}

.player-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.player-title {
  font-size: 20px;
}

.player-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.video-wrapper {
  border-radius: 18px;
  overflow: hidden;
  background: #0f172a;
}

.resource-info {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.meta-row {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
  word-break: break-all;
}

.meta-row span {
  display: inline-block;
  min-width: 86px;
  color: #0f172a;
  font-weight: 600;
}

.next-resource-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border: 1px solid #fed7aa;
  background: linear-gradient(180deg, #fff7ed, #fffbeb);
}

.next-kicker {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #c2410c;
  text-transform: uppercase;
}

.next-title {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #7c2d12;
}

.comment-editor {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.comment-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #fff, #fbfdff);
}

.comment-top {
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
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.reply-editor {
  margin-top: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.reply-submit {
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

@media (max-width: 1180px) {
  .top-progress {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .learn-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-card {
    position: static;
  }
}

@media (max-width: 720px) {
  .top-progress {
    grid-template-columns: 1fr;
  }

  .player-header,
  .header-actions,
  .player-actions,
  .continuity-bar,
  .continuity-actions,
  .next-resource-card,
  .video-row,
  .comment-actions,
  .reply-submit {
    flex-direction: column;
  }

  .continuity-actions,
  .header-actions,
  .player-actions {
    align-items: stretch;
  }
}
</style>
