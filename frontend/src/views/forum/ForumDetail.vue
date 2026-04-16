<template>
  <div style="display: flex; flex-direction: column; gap: 18px;">
    <div v-if="post.id" class="page-card">
      <div style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <el-tag v-if="post.isTop === 1" type="danger" round>置顶</el-tag>
            <el-tag type="success" round>{{ post.sectionName }}</el-tag>
            <div class="section-title" style="margin-bottom: 0;">{{ post.title }}</div>
          </div>

          <div class="post-user">
            <el-avatar :size="36" :src="post.userAvatar || ''">
              {{ (post.userNickname || 'U').slice(0, 1) }}
            </el-avatar>
            <span>{{ post.userNickname || '未知用户' }}</span>
            <el-tag size="small" :type="roleTagType(post.userRole)">
              {{ roleText(post.userRole) }}
            </el-tag>
            <span class="meta-text">{{ formatTime(post.createdAt) }}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <el-button @click="router.push('/forum')">返回列表</el-button>

          <el-button
            v-if="canDelete(post.userId)"
            text
            type="danger"
            @click="handleDeletePost"
          >
            删除
          </el-button>

          <el-button text @click="togglePostLike">
            {{ post.liked ? '❤️' : '🤍' }} {{ post.likeCount || 0 }}
          </el-button>
        </div>
      </div>

      <div class="post-content">
        {{ post.content || '(暂无内容)' }}
      </div>

      <div v-if="post.mediaList?.length" class="post-media">
        <template v-for="item in post.mediaList" :key="item.id">
          <img
            v-if="item.mediaType === 'IMAGE'"
            :src="item.mediaUrl"
            class="detail-img"
            alt=""
          />
          <video
            v-else
            :src="item.mediaUrl"
            class="detail-video"
            controls
          />
        </template>
      </div>
    </div>

    <div class="page-card">
      <div class="section-title" style="font-size: 20px;">评论区</div>

      <div style="margin-top: 16px;">
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="4"
          placeholder="写下你的评论..."
        />
        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <el-button type="primary" @click="submitComment">发表评论</el-button>
        </div>
      </div>

      <div v-if="comments.length" class="comment-list">
        <div v-for="item in comments" :key="item.id" class="comment-card">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <el-avatar :size="32" :src="item.userAvatar || ''">
              {{ (item.userNickname || 'U').slice(0, 1) }}
            </el-avatar>
            <span>{{ item.userNickname }}</span>
            <el-tag size="small" :type="roleTagType(item.userRole)">
              {{ roleText(item.userRole) }}
            </el-tag>
            <span class="meta-text">{{ formatTime(item.createdAt) }}</span>
          </div>

          <div class="comment-content">{{ item.content }}</div>

          <div class="comment-actions">
            <el-button text @click="toggleCommentLike(item)">
              {{ item.liked ? '❤️' : '🤍' }} {{ item.likeCount || 0 }}
            </el-button>
            <el-button text @click="openReply(item)">回复</el-button>
            <el-button
              v-if="canDelete(item.userId)"
              text
              type="danger"
              @click="handleDeleteComment(item.id)"
            >
              删除
            </el-button>
          </div>

          <div v-if="replyingId === item.id" class="reply-box">
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="3"
              placeholder="请输入回复内容"
            />
            <div style="margin-top: 8px; display: flex; justify-content: flex-end; gap: 8px;">
              <el-button @click="cancelReply">取消</el-button>
              <el-button type="primary" @click="submitReply(item)">发送</el-button>
            </div>
          </div>

          <div v-if="item.children?.length" class="child-list">
            <div v-for="child in item.children" :key="child.id" class="child-item">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span class="child-user">{{ child.userNickname }}</span>
                <el-tag size="small" :type="roleTagType(child.userRole)">
                  {{ roleText(child.userRole) }}
                </el-tag>
                <span v-if="child.replyUserNickname" class="meta-text">
                  回复 {{ child.replyUserNickname }}
                </span>
                <span class="meta-text">{{ formatTime(child.createdAt) }}</span>
              </div>

              <div style="margin-top: 8px; color: #334155; white-space: pre-wrap;">
                {{ child.content }}
              </div>

              <div style="margin-top: 8px; display: flex; gap: 10px; flex-wrap: wrap;">
                <el-button text @click="toggleCommentLike(child)">
                  {{ child.liked ? '❤️' : '🤍' }} {{ child.likeCount || 0 }}
                </el-button>
                <el-button
                  v-if="canDelete(child.userId)"
                  text
                  type="danger"
                  @click="handleDeleteComment(child.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="还没有评论，快来抢沙发吧" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import {
  createForumCommentApi,
  deleteForumCommentApi,
  deleteForumPostApi,
  getForumCommentsApi,
  getForumPostDetailApi,
  likeForumCommentApi,
  likeForumPostApi,
  unlikeForumCommentApi,
  unlikeForumPostApi
} from '@/api/forum'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const postId = Number(route.params.id)

const post = reactive<any>({})
const comments = ref<any[]>([])

const commentForm = reactive({
  content: ''
})

const replyingId = ref<number | null>(null)
const replyContent = ref('')

const currentUserId = computed(() =>
  Number((auth.user as any)?.userId || (auth.user as any)?.id || 0)
)
const currentUserRole = computed(() => auth.user?.role || '')

const canDelete = (creatorId?: number) => {
  if (!creatorId || !currentUserId.value) return false
  return currentUserId.value === Number(creatorId) || currentUserRole.value === 'ADMIN'
}

const loadDetail = async () => {
  const res = await getForumPostDetailApi(postId)
  console.log('当前登录用户 auth.user =', auth.user)
  console.log('currentUserId =', currentUserId.value)
  console.log('帖子详情 res =', res)
  console.log('post.userId =', res?.userId)
  Object.assign(post, res)
}

const loadComments = async () => {
  const res = await getForumCommentsApi(postId)
  console.log('评论列表 res =', res)
  if (res?.length) {
    console.log('一级评论第一个 userId =', res[0]?.userId)
    console.log('一级评论 children =', res[0]?.children)
  }
  comments.value = res
}

const submitComment = async () => {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  await createForumCommentApi({
    postId,
    parentId: null,
    replyUserId: null,
    content: commentForm.content
  })

  commentForm.content = ''
  ElMessage.success('评论成功')
  await loadComments()
  await loadDetail()
}

const openReply = (item: any) => {
  replyingId.value = item.id
  replyContent.value = ''
}

const cancelReply = () => {
  replyingId.value = null
  replyContent.value = ''
}

const submitReply = async (item: any) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  await createForumCommentApi({
    postId,
    parentId: item.id,
    replyUserId: item.userId,
    content: replyContent.value
  })

  ElMessage.success('回复成功')
  cancelReply()
  await loadComments()
  await loadDetail()
}

const togglePostLike = async () => {
  if (post.liked) {
    await unlikeForumPostApi(postId)
    post.liked = false
    post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
  } else {
    await likeForumPostApi(postId)
    post.liked = true
    post.likeCount = (post.likeCount || 0) + 1
  }
}

const toggleCommentLike = async (item: any) => {
  if (item.liked) {
    await unlikeForumCommentApi(item.id)
    item.liked = false
    item.likeCount = Math.max(0, (item.likeCount || 0) - 1)
  } else {
    await likeForumCommentApi(item.id)
    item.liked = true
    item.likeCount = (item.likeCount || 0) + 1
  }
}

const handleDeletePost = async () => {
  try {
    await ElMessageBox.confirm('确定删除这篇帖子吗？删除后不可恢复。', '提示', {
      type: 'warning'
    })
    await deleteForumPostApi(postId)
    ElMessage.success('删除成功')
    router.push('/forum')
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败')
    }
  }
}

const handleDeleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？删除后不可恢复。', '提示', {
      type: 'warning'
    })
    await deleteForumCommentApi(commentId)
    ElMessage.success('删除成功')
    await loadComments()
    await loadDetail()
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败')
    }
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
  await loadDetail()
  await loadComments()
})
</script>

<style scoped>
.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  color: #475569;
  flex-wrap: wrap;
}

.post-content {
  margin-top: 18px;
  color: #334155;
  line-height: 1.95;
  white-space: pre-wrap;
}

.post-media {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.detail-img,
.detail-video {
  width: 320px;
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 18px;
}

.comment-card {
  background: #fafafa;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
}

.comment-content {
  margin-top: 10px;
  color: #334155;
  line-height: 1.8;
  white-space: pre-wrap;
}

.comment-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.reply-box {
  margin-top: 10px;
}

.child-list {
  margin-top: 14px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.child-item {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
}

.child-user {
  color: #0f172a;
  font-weight: 600;
}
</style>
