<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const userInfo = ref(null)

const isLoading = ref(true)

// Change Password Modal
const showChangePasswordModal = ref(false)
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')

// Load personal data from db（change to Complete URL to reduce proxy problem）
const loadUserInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    console.log('Supervisor data loaded:', response.data)  // debug 用
    userInfo.value = response.data
  } catch (error) {
    console.error('Fail to load data:', error)
    alert('Cannot load user data, please login again')
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})

// Change Password
const openChangePasswordModal = () => {
  showChangePasswordModal.value = true
  currentPwd.value = ''
  newPwd.value = ''
  confirmPwd.value = ''
}

const submitPwd = async () => {
  if (newPwd.value !== confirmPwd.value) {
    alert('New password do not match!')
    return
  }

  if (!currentPwd.value || !newPwd.value) {
    alert('Please fill in all the field！')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/users/change-password', {
      currentPassword: trimmedCurrent,
      newPassword: trimmedNew
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`  // 帶 token 驗證身分
      }
    })

    alert('Password changed successfully! Please log in again.')
    closePwdModal()
    logout()  // 自動登出
  } catch (error) {
    console.error('Password change failed：', error)
    const errMsg = error.response?.data?.message || error.message || 'unknown error'
    alert('update failed：' + errMsg)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('user')
  location.href = '/'  // 或 router.push('/')
}
</script>

<template>
  <div class="supervisor-page">
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading profile...</div>

    <div v-else>
      <!-- My Profile Card -->
      <div class="profile-card">
        <h2>My Profile</h2>
        <div class="info">
          <p><strong>ID:</strong> {{ userInfo?.id || 'No data' }}</p>
          <p><strong>Username:</strong> {{ userInfo?.name || 'No data' }}</p>
          <p><strong>Email:</strong> {{ userInfo?.email || 'No data' }}</p>
          <p><strong>Role:</strong> {{ userInfo?.role || 'No data' }}</p>
        </div>
        <div class="buttons">
          <button class="btn-secondary" @click="openChangePasswordModal">Change Password</button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <teleport to="body">
      <div v-if="showPwdModal" class="modal-overlay" @click="closePwdModal">
        <div class="modal-content" @click.stop>
          <h2>Change Password</h2>
          <p class="user-info">ID: {{ userInfo?.id }}</p>
          <p class="user-info">Username: {{ userInfo?.name }}</p>

          <div class="form-group">
            <label>Current Password</label>
            <input type="password" v-model="currentPwd" />
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" v-model="newPwd" />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" v-model="confirmPwd" />
          </div>

          <div class="modal-actions">
            <button class="btn-submit" @click="submitPwd">Submit</button>
            <button class="btn-cancel" @click="closePwdModal">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* Layout */
.supervisor-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 3rem 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: system-ui, -apple-system, sans-serif;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); 
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.info p {
  margin: 1.5rem 0;
  color: #475569;
  font-size: 1.1rem;
}
.info strong {
  color: #0f172a;
  min-width: 110px;
  display: inline-block;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
}
button {
  flex: 1;
  padding: 0.9rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary { background: #e2e8f0; color: #475569; }
.btn-secondary:hover { background: #cbd5e1; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 16px; padding: 2rem;
  width: 90%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); color: #0f172a;
}
.modal-content h2 { text-align: center; margin-bottom: 1.5rem; font-size: 1.6rem; }
.user-info { margin: 0.5rem 0; color: #4b5563; font-size: 1rem; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500; }
.form-group input {
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 1rem; color: #0f172a;
}
.forgot-link { display: block; margin-top: 0.5rem; color: #3b82f6; font-size: 0.9rem; text-decoration: none; }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-submit, .btn-cancel {
  flex: 1; padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer;
}
.btn-submit { background: #3b82f6; color: white; }
.btn-cancel { background: #e5e7eb; color: #374151; }

.loading { text-align: center; padding: 3rem; font-size: 1.2rem; color: #64748b; }
</style>