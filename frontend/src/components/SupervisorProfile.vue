<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'  // 如果 logout 要用 router

const router = useRouter()  // 如果用 router.push

// Supervisor Profile Data（目前硬碼）
const profile = ref({
  id: 's111',
  username: 'John',
  email: 's111@xxxx.mail.com',
  contact: '123',
  role: 'Supervisor'
})

// Change Password Modal
const showChangePasswordModal = ref(false)  // 統一變數名
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')

// Change Password
const openChangePasswordModal = () => {
  showChangePasswordModal.value = true
  currentPwd.value = ''
  newPwd.value = ''
  confirmPwd.value = ''
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
}

const submitChangePassword = async () => {
  const trimmedCurrent = currentPwd.value.trim()
  const trimmedNew = newPwd.value.trim()

  if (trimmedNew !== confirmPwd.value.trim()) {
    alert('New password do not match')
    return
  }

  if (!trimmedCurrent || !trimmedNew) {
    alert('Please fill in all the field！')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/users/change-password', {  // 完整 URL
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

// 登出
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('user')
  location.href = '/'  // 或 router.push('/') 如果用 router
}

// Edit User Modal
// const showEditModal = ref(false)
// const editForm = ref({ ...profile.value })

// const openEditModal = () => {
//   editForm.value = { ...profile.value }
//   showEditModal.value = true
// }

// const closeEditModal = () => {
//   showEditModal.value = false
// }

// const saveEdit = () => {
//   profile.value.username = editForm.value.username
//   profile.value.email = editForm.value.email
//   profile.value.contact = editForm.value.contact
//   alert('Profile updated successfully!')
//   closeEditModal()
// }
</script>

<template>
  <div class="supervisor-page">
    <!-- My Profile Card -->
    <div class="profile-card">
      <h2>My Profile</h2>
      <div class="info">
        <p><strong>ID:</strong> {{ profile.id }}</p>
        <p><strong>Username:</strong> {{ profile.username }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Contact:</strong> {{ profile.contact }}</p>
        <p><strong>Role:</strong> {{ profile.role }}</p>
      </div>
      <div class="buttons">
        <button class="btn-secondary" @click="openChangePasswordModal">Change Password</button>  <!-- 改成正確函式名 -->
      </div>
    </div>

    <!-- Change Password Modal -->
    <teleport to="body">
      <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePasswordModal">
        <div class="modal-content" @click.stop>
          <h2>Change Password</h2>
          <p class="user-info">ID: s111</p>
          <p class="user-info">Username: John</p>

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
            <button class="btn-submit" @click="submitChangePassword">Submit</button>
            <button class="btn-cancel" @click="closeChangePasswordModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <!-- <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h2>Edit User</h2>

          <div class="form-group">
            <label>User ID:</label>
            <input type="text" :value="profile.id" disabled />
          </div>
          <div class="form-group">
            <label>Username:</label>
            <input type="text" v-model="editForm.username" />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="text" v-model="editForm.email" />
          </div>
          <div class="form-group">
            <label>Contact:</label>
            <input type="text" v-model="editForm.contact" />
          </div>
          <div class="form-group">
            <label>Role:</label>
            <button class="role-btn" disabled>Supervisor</button>
          </div>

          <div class="modal-actions">
            <button class="btn-submit" @click="saveEdit">Save</button>
             <button class="btn-cancel" @click="closeEditModal">Cancel</button> -->
          <!-- </div>
        </div>
      </div> --> 
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
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }

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
.form-group input:disabled { background: #f3f4f6; color: #6b7280; }
.forgot-link { display: block; margin-top: 0.5rem; color: #3b82f6; font-size: 0.9rem; text-decoration: none; }
.role-btn { background: #e5e7eb; color: #4b5563; padding: 0.6rem 1.2rem; border: none; border-radius: 8px; cursor: not-allowed; }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-submit, .btn-cancel {
  flex: 1; padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer;
}
.btn-submit { background: #3b82f6; color: white; }
.btn-cancel { background: #e5e7eb; color: #374151; }
</style>