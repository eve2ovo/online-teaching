<template>
  <div class="page-stack">
    <div class="page-card">
      <div class="split-header">
        <div>
          <div class="section-title">用户管理</div>
          <div class="section-desc">维护账号、角色和基础资料。</div>
        </div>
        <div class="page-actions">
          <el-input
            v-model="params.keyword"
            placeholder="搜索用户"
            style="width: 220px"
            clearable
            @change="load"
            @keyup.enter="load"
          />
          <el-button type="primary" @click="openCreate">新建用户</el-button>
        </div>
      </div>

      <el-table :data="list.records" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="nickname" label="昵称" min-width="160" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="edit(row)">编辑</el-button>
              <el-button link type="danger" @click="remove(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="visible" title="用户信息" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" show-password placeholder="新增必填，编辑可留空" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="学生" value="STUDENT" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUsersApi, saveAdminUserApi, deleteAdminUserApi } from '@/api/user'

const params = reactive({ current: 1, size: 10, keyword: '' })
const list = reactive<any>({ total: 0, records: [] })
const visible = ref(false)
const form = reactive<any>({ role: 'STUDENT', username: '', password: '', nickname: '' })

const load = async () => Object.assign(list, await getAdminUsersApi(params))
const openCreate = () => {
  Object.assign(form, { id: undefined, role: 'STUDENT', username: '', password: '', nickname: '' })
  visible.value = true
}
const edit = (row: any) => {
  Object.assign(form, { ...row, password: '' })
  visible.value = true
}
const save = async () => {
  await saveAdminUserApi(form)
  visible.value = false
  ElMessage.success('保存成功')
  load()
}
const remove = async (id: number) => {
  await ElMessageBox.confirm('确认删除该用户吗？', '提示')
  await deleteAdminUserApi(id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>
