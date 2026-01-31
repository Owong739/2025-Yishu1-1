<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 個人資料
const userInfo = ref(null)

// Change Password Modal
const showChangePasswordModal = ref(false)
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

// Edit Profile Modal
// const showEditModal = ref(false)
// const editForm = ref({ name: '', email: '' })

// My Tasks
const tasks = ref([])

// My Teams & My Sprints（保留變數，但暫時不載入資料）
const teams = ref([])
const sprints = ref([])

// 載入個人資料從 DB（完整 URL）
const loadUserInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    console.log('Profile data loaded:', response.data)  // debug 用，看控制台
    userInfo.value = response.data
  } catch (error) {
    console.error('Fail to load profile data:', error)
    alert('Cannot load user data, please login again')
    router.push('/')
  }
}

// 載入 My Tasks（從 DB）（完整 URL）
const loadTasks = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/tasks/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    console.log('Tasks data loaded:', response.data)  // debug 用
    tasks.value = response.data
  } catch (error) {
    console.error('Load tasks fail:', error)
    // 不 alert，讓頁面顯示 "No tasks"
  }
}

onMounted(async () => {
  await loadUserInfo()
  await loadTasks()
  isLoading.value = false  // 載入完成
})

// Change Password
const openChangePasswordModal = () => {
  showChangePasswordModal.value = true
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}
const closeChangePasswordModal = () => showChangePasswordModal.value = false

const submitChangePassword = async () => {
  const trimmedCurrent = passwordForm.value.currentPassword.trim()
  const trimmedNew = passwordForm.value.newPassword.trim()

  if (trimmedNew !== passwordForm.value.confirmPassword.trim()) {
    alert('New password do not match')
    return
  }

  if (!trimmedCurrent || !trimmedNew) {
    alert('Please fill in all the field！')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/users/change-password', {
      currentPassword: trimmedCurrent,
      newPassword: trimmedNew
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    alert('Password updated, please login again!')
    logout()
  } catch (error) {
    console.error('Password update failed:', error)
    const errMsg = error.response?.data?.message || 'unknown error'
    alert('Password update failed: ' + errMsg)
  }
}
// Edit Profile
// const openEditModal = () => {
//   showEditModal.value = true
// }
// const closeEditModal = () => showEditModal.value = false

// const submitEdit = async () => {
//   try {
//     await axios.patch('/api/users/me', editForm.value, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     })
//     alert('update succesfully')
//     loadUserInfo()  // 重新載入
//     closeEditModal()
//   } catch (error) {
//     alert('update failed: ' + (error.response?.data?.message || 'error'))
//   }
// }

// 登出
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  router.push('/')
}
</script>

<template>
  <div class="profile-page">
    <h1>Project Manager Profile</h1>

    <!-- Loading 狀態 -->
    <div v-if="isLoading" class="loading">Loading profile and tasks...</div>

    <div v-else>
      <!-- My Profile -->
      <div class="section">
        <h2>My Profile</h2>
        <div class="info">
          <div>Id: {{ userInfo?.id || 'No data' }}</div>
          <div>Username: {{ userInfo?.name || 'No data' }}</div>
          <div>Email: {{ userInfo?.email || 'No data' }}</div>
          <div>Role: {{ userInfo?.role || 'No data' }}</div>
        </div>
        <button class="btn" @click="openChangePasswordModal">Change Password</button>
      </div>

      <!-- My Tasks -->
      <div class="section">
        <h2>My Tasks</h2>
        <div v-if="tasks.length === 0">No tasks</div>
        <div v-else v-for="task in tasks" :key="task.id" class="task-item">
          <div>ID: {{ task.id }}</div>
          <div>Project: {{ task.project }}</div>
          <div>Title: {{ task.title }}</div>
          <div>Status: {{ task.status }}</div>
          <div>Priority: {{ task.priority }}</div>
          <div>Assignee: {{ task.assignee || '-' }}</div>
          <div>Role: {{ task.role || '-' }}</div>
          <div>Due Date: {{ task.dueDate || '-' }}</div>

          <div class="user-story-section">
            <strong>User Story:</strong>
            <div v-if="task.userStory" class="user-story-content">
              <pre>{{ task.userStory }}</pre>
            </div>
            <div v-else class="no-story">No User Story</div>
          </div>
        </div>
      </div>

      <!-- My Teams -->
      <div class="section">
        <h2>My Teams</h2>
        <div v-if="teams.length === 0">No teams yet</div>
      </div>

      <!-- My Sprints -->
      <div class="section">
        <h2>My Sprints</h2>
        <div v-if="sprints.length === 0">No sprints yet</div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePasswordModal">
      <div class="modal-content" @click.stop>
        <h2>Change Password</h2>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" v-model="passwordForm.currentPassword" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" v-model="passwordForm.newPassword" />
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" v-model="passwordForm.confirmPassword" />
        </div>
        <div class="modal-actions">
          <button class="btn-submit" @click="submitChangePassword">Submit</button>
          <button class="btn-cancel" @click="closeChangePasswordModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>

    <!-- Edit Modal -->
    <!-- <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h2>Edit User</h2>
        <div class="form-group">
          <label>Id:</label>
          <input type="text" :value="userInfo.id" disabled />
        </div>
        <div class="form-group">
          <label>Username:</label>
          <input type="text" v-model="editForm.name" />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="editForm.email" />
        </div>
        <div class="form-group">
          <label>Role:</label>
          <input type="text" :value="userInfo.role" disabled />
        </div>
        <div class="modal-actions">
          <button class="btn-submit" @click="submitEdit">Save</button>
          <button class="btn-cancel" @click="closeEditModal">Cancel</button>
        </div>
      </div>
    </div> -->
</template>

<style scoped>
.profile-page { min-height: 100vh; background: #f8fafc; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; }
.section { background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h1 { text-align: center; margin-bottom: 2rem; color: #1e293b; }
h2 { margin-bottom: 1rem; color: #1e293b; }
.info > div { margin-bottom: 0.5rem; color: #475569; }
.btn { background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 1rem; }

.task-item { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; color: #475569; }
.task-item a { color: #3b82f6; text-decoration: none; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content { background: white; border-radius: 8px; padding: 2rem; width: 90%; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; }
.modal-actions { display: flex; gap: 1rem; }
.btn-submit { background: #3b82f6; color: white; flex: 1; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #e5e7eb; color: #374151; flex: 1; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; }
</style>