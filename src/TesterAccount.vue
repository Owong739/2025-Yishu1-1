<script setup>
import { ref } from 'vue'

// Profile Data (模擬資料，之後會從後端來)
const profile = ref({
  id: 's114',
  username: 'David',
  email: 'david@project.xxx',
  contact: '5566',
  role: 'Tester'
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
const submitPwd = () => {
  if (newPwd.value !== confirmPwd.value) {
    alert('New passwords do not match!')
    return
  }
  if (!currentPwd.value || !newPwd.value) {
    alert('Please fill in all fields!')
    return
  }
  alert('Password changed successfully! (模擬成功)')
  closePwdModal()
}

// Edit Profile Modal
const showEditModal = ref(false)
const editForm = ref({ ...profile.value })

const openEditModal = () => {
  editForm.value = { ...profile.value }
  showEditModal.value = true
}
const closeEditModal = () => { showEditModal.value = false }

const saveEdit = () => {
  profile.value.username = editForm.value.username
  profile.value.email = editForm.value.email
  profile.value.contact = editForm.value.contact
  // role 不能改，所以不更新
  alert('Profile updated successfully! (模擬更新)')
  closeEditModal()
}
</script>

<template>
  <div class="profile-page">
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
        <button class="btn-secondary" @click="openPwdModal">Change Password</button>
        <button class="btn-primary" @click="openEditModal">Edit</button>
      </div>
    </div>

    <!-- ================== Modals ================== -->
    <teleport to="body">
      <!-- Change Password Modal -->
      <div v-if="showPwdModal" class="modal-overlay" @click="closePwdModal">
        <div class="modal-content" @click.stop>
          <h2>Change Password</h2>
          <p class="user-info">ID: {{ profile.id }}</p>
          <p class="user-info">Username: {{ profile.username }}</p>

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

      <!-- Edit Profile Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h2>Edit Profile</h2>

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
            <input type="email" v-model="editForm.email" />
          </div>
          <div class="form-group">
            <label>Contact:</label>
            <input type="text" v-model="editForm.contact" />
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
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.profile-page {
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
  max-width: 520px;
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
  transition: all 0.2s;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}
.btn-secondary:hover { background: #cbd5e1; }

.btn-primary {
  background: #3b82f6;
  color: white;
}
.btn-primary:hover { background: #2563eb; }

/* Modal */
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
}
.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
}
.user-info {
  margin: 0.5rem 0;
  color: #4b5563;
  font-size: 1rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.form-group input:disabled {
  background: #f3f4f6;
  color: #6b7280;
}
.forgot-link {
  display: block;
  margin-top: 0.5rem;
  color: #3b82f6;
  font-size: 0.9rem;
  text-decoration: none;
}
.role-btn {
  background: #e5e7eb;
  color: #4b5563;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: not-allowed;
  width: 100%;
  text-align: left;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
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