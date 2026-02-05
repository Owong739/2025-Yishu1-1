<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Loading user data from API
const profile = ref({
  id: null,
  name: '',
  email: '',
  role: '',
  created_at: ''
})

const loadProfile = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users/me', {  // ← Change to complete URL
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    profile.value = response.data
  } catch (error) {
    console.error('Fail to load data', error)
    alert('Cannot load user data, please login again')
  }
}

// Get the user data while loading
onMounted(() => {
  loadProfile()
})

// Change Password Modal
const showPwdModal = ref(false)
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')

const openPwdModal = () => { showPwdModal.value = true }
const closePwdModal = () => {
  showPwdModal.value = false
  currentPwd.value = newPwd.value = confirmPwd.value = ''
}

const submitPwd = async () => {
  const trimmedCurrent = currentPwd.value.trim();
  const trimmedNew = newPwd.value.trim();

  if (newPwd.value !== confirmPwd.value) {
    alert('New password do not match！')
    return
  }

  if (!trimmedCurrent || !trimmedNew) {
    alert('Please fill in all the field！')
    return
  }

  try {
    const response = await axios.post('http://localhost:3000/api/users/change-password', {
      currentPassword: trimmedCurrent,  //  Use trimmed to reduce space when it exist
      newPassword: trimmedNew           
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    alert('Password updated, please login again')
    closePwdModal()
    logout()
  } catch (error) {
    console.error('fail to change pasword:', error)
    const errMsg = error.response?.data?.message || 'unknown error, please try again later'
    alert('change failed：' + errMsg)
  }
}

// Logout (Call After changed password)
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('user')
  location.href = '/'  // redirect to login page
}

// Edit Profile Modal）
// const showEditModal = ref(false)
// const editForm = ref({ ...profile.value })

// const openEditModal = () => {
//   editForm.value = { ...profile.value }
//   showEditModal.value = true
// }
// const closeEditModal = () => { showEditModal.value = false }

// const saveEdit = async () => {
//   try {
//     await axios.patch('/api/users/me', {
//       name: editForm.value.name,
//       email: editForm.value.email
//     }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     })
//     profile.value.name = editForm.value.name
//     profile.value.email = editForm.value.email
//     alert('data update successfully！')
//     closeEditModal()
//   } catch (error) {
//     alert('update failed, please try again later')
//   }
// }
</script>

<template>
  <div class="admin-page">
    <!-- My Profile Card -->
    <div class="profile-card">
      <h2>My Profile</h2>
      <div class="info">
        <p v-if="profile.id"><strong>ID:</strong> {{ profile.id }}</p>
        <p><strong>Name:</strong> {{ profile.name || '載入中...' }}</p>
        <p><strong>Email:</strong> {{ profile.email || '載入中...' }}</p>
        <p><strong>Role:</strong> {{ profile.role || '載入中...' }}</p>
        <p v-if="profile.created_at"><strong>Created At:</strong> {{ profile.created_at }}</p>
      </div>
      <div class="buttons">
        <button class="btn-secondary" @click="openPwdModal">Change Password</button>
        <!-- <button class="btn-primary" @click="openEditModal">Edit Profile</button> -->
      </div>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <!-- Change Password Modal -->
      <div v-if="showPwdModal" class="modal-overlay" @click="closePwdModal">
        <div class="modal-content" @click.stop>
          <h2>Change Password</h2>
          <p class="user-info">Name: {{ profile.name }}</p>

          <div class="form-group">
            <label>Current Password</label>
            <input type="password" v-model="currentPwd" />
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

      <!-- Edit Profile Modal -->
      <!-- <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h2>Edit Profile</h2>

          <div class="form-group">
            <label>User ID:</label>
            <input type="text" :value="profile.id" disabled />
          </div>
          <div class="form-group">
            <label>Name:</label>
            <input type="text" v-model="editForm.name" />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" v-model="editForm.email" />
          </div>
          <div class="form-group">
            <label>Role:</label>
            <button class="role-btn" disabled>{{ profile.role }}</button>
          </div>

          <div class="modal-actions">
            <button class="btn-submit" @click="saveEdit">Save</button>
            <button class="btn-cancel" @click="closeEditModal">Cancel</button>
          </div>
        </div>
      </div> -->
    </teleport>
  </div>
</template>

<style scoped>
/* Layout - exactly the same as MemberAccount */
.admin-page {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  color: #0f172a;
}
.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
}
.user-info { margin: 0.5rem 0; color: #4b5563; font-size: 1rem; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500; }
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #0f172a;
}
.form-group input:disabled { background: #f3f4f6; color: #6b7280; }
.forgot-link { display: block; margin-top: 0.5rem; color: #3b82f6; font-size: 0.9rem; text-decoration: none; }
.role-btn { background: #e5e7eb; color: #4b5563; padding: 0.6rem 1.2rem; border: none; border-radius: 8px; cursor: not-allowed; }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-submit, .btn-cancel {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-submit { background: #3b82f6; color: white; }
.btn-cancel { background: #e5e7eb; color: #374151; }
</style>