<template>
  <div style="display: flex; flex-direction: column; gap: 18px;">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">论坛交流</div>
          <div class="section-desc">老师、学生、管理员都可以在这里发帖、评论和交流。</div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <el-input
            v-model="params.keyword"
            placeholder="搜索标题或内容"
            style="width: 240px"
            clearable
            @change="load"
          />
          <el-button @click="load">查询</el-button>
          <el-button type="primary" @click="goPublish">发布帖子</el-button>
        </div>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px;">
        <el-tag
          :effect="params.sectionId === undefined ? 'dark' : 'plain'"
          style="cursor: pointer;"
          @click="changeSection(undefined)"
        >
          全部
        </el-tag>

        <el-tag
          v-for="item in sections"
          :key="item.id"
          :effect="params.sectionId === item.id ? 'dark' : 'plain'"
          style="cursor: pointer;"
          @click="changeSection(item.id)"
        >
          {{ item.name }}
        </el-tag>
      </div>
    </div>

    <div v-if="list.records?.length" class="forum-list">
      <div v-for="item in list.records" :key="item.id" class="forum-card">
        <div class="forum-header">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <el-tag v-if="item.isTop === 1" type="danger" round>置顶</el-tag>
            <el-tag type="success" round>{{ item.sectionName }}</el-tag>
            <div class="forum-title" @click="goDetail(item.id)">
              {{ item.title }}
            </div>
          </div>
          <div class="meta-text">{{ formatTime(item.createdAt) }}</div>
        </div>

        <div class="forum-user">
          <el-avatar :size="34" :src="item.userAvatar || ''">
            {{ (item.userNickname || 'U').slice(0, 1) }}
          </el-avatar>
          <span>{{ item.userNickname || '未知用户' }}</span>
          <el-tag size="small" :type="roleTagType(item.userRole)">
            {{ roleText(item.userRole) }}
          </el-tag>
        </div>

        <div class="forum-content" @click="goDetail(item.id)">
          {{ item.content || '暂无内容' }}
        </div>

        <div v-if="item.mediaList?.length" class="forum-media">
          <template v-for="m in item.mediaList.slice(0, 3)" :key="m.id">
            <img
              v-if="m.mediaType === 'IMAGE'"
              :src="m.mediaUrl"
              class="media-thumb"
              alt=""
            />
            <video
              v-else
              :src="m.mediaUrl"
              class="media-thumb"
              controls
            />
          </template>
        </div>

        <div class="forum-actions">
          <el-button text @click="toggleLike(item)">
            {{ item.liked ? '❤️' : '🤍' }} {{ item.likeCount || 0 }}
          </el-button>
          <el-button text @click="goDetail(item.id)">
            💬 {{ item.commentCount || 0 }}
          </el-button>
          <span class="meta-text">👁 {{ item.viewCount || 0 }}</span>
        </div>
      </div>
    </div>

    <el-empty v-else class="page-card" description="暂无帖子" />

    <div class="page-card">
      <div style="display: flex; justify-content: flex-end;">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :current-page="params.current"
          :page-size="params.size"
          :total="list.total || 0"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getForumPostsApi,
  getForumSectionsApi,
  likeForumPostApi,
  unlikeForumPostApi
} from '@/api/forum'

const router = useRouter()

const sections = ref<any[]>([])

const list = reactive<any>({
  total: 0,
  records: []
})

const params = reactive<any>({
  current: 1,
  size: 10,
  sectionId: undefined,
  keyword: ''
})

const loadSections = async () => {
  sections.value = await getForumSectionsApi()
}

const load = async () => {
  const res = await getForumPostsApi(params)
  list.total = res.total || 0
  list.records = res.records || []
}

const changeSection = (sectionId?: number) => {
  params.sectionId = sectionId
  params.current = 1
  load()
}

const onPageChange = (page: number) => {
  params.current = page
  load()
}

const goDetail = (id: number) => {
  router.push(`/forum/${id}`)
}

const goPublish = () => {
  router.push('/forum/publish')
}

const toggleLike = async (item: any) => {
  if (item.liked) {
    await unlikeForumPostApi(item.id)
    item.liked = false
    item.likeCount = Math.max(0, (item.likeCount || 0) - 1)
    ElMessage.success('已取消点赞')
  } else {
    await likeForumPostApi(item.id)
    item.liked = true
    item.likeCount = (item.likeCount || 0) + 1
    ElMessage.success('点赞成功')
  }
}

const roleText = (role: string) => {
  if (role === 'STUDENT') return '学生'
  if (role === 'TEACHER') return '老师'
  if (role === 'ADMIN') return '管理员'
  return role || '未知'
}

const roleTagType = (role: string) => {
  if (role === 'STUDENT') return 'info'
  if (role === 'TEACHER') return 'success'
  if (role === 'ADMIN') return 'danger'
  return ''
}

const formatTime = (value: string) => {
  if (!value) return ''
  return value.replace('T', ' ').slice(0, 16)
}

onMounted(async () => {
  await loadSections()
  await load()
})
</script>

<style scoped>
.forum-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.forum-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.forum-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
}

.forum-title:hover {
  color: #2563eb;
}

.forum-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  color: #475569;
  flex-wrap: wrap;
}

.forum-content {
  margin-top: 14px;
  line-height: 1.9;
  color: #334155;
  white-space: pre-wrap;
  cursor: pointer;
}

.forum-media {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.media-thumb {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.forum-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>