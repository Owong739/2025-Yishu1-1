<script setup>
import { ref } from 'vue'

// Profile Data
const profile = ref({
  id: 's111',
  username: 'John',
  email: 's111@xxxx.mail.com',
  contact: '123',
  role: 'member'
})

const tasks = ref([
  { name: 'Task 1', daysLeft: 2 },
  { name: 'Task 2', daysLeft: 7 }
])

const teams = ref([
  { name: 'Team A', members: 5 },
  { name: 'Team B', members: 4 }
])

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
  if (newPwd.value !== confirmPwd.value) return alert('New passwords do not match!')
  if (!currentPwd.value || !newPwd.value) return alert('Please fill in all fields!')
  alert('Password changed successfully!')
  closePwdModal()
}

// Edit User Modal
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
  alert('Profile updated successfully!')
  closeEditModal()
}
</script>

<template>
  <div class="page">
    <!-- Profile Card -->
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

    <!-- Right Column: Tasks + Teams -->
    <div class="right-column">
      <div class="card">
        <h2>My Tasks</h2>
        <div class="task-list">
          <div v-for="(t, i) in tasks" :key="i" class="task-item">
            <span>{{ t.name }}</span>
            <span class="days">{{ t.daysLeft }} days left</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>My Teams</h2>
        <div class="team-list">
          <div v-for="(t, i) in teams" :key="i" class="team-item">
            <span>{{ t.name }}</span>
            <span class="members">{{ t.members }} Members</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== Modals ================== -->
    <teleport to="body">
      <!-- Change Password Modal -->
      <div v-if="showPwdModal" class="modal-overlay" @click="closePwdModal">
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
            <button class="btn-submit" @click="submitPwd">Submit</button>
            <button class="btn-cancel" @click="closePwdModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
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
            <button class="role-btn" disabled>Member</button>
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
/* Whole page */
.page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}
@media (max-width: 1920px) {
  .page {
    grid-template-columns: 1fr;
    padding: 3rem 2rem;
    gap: 2.5rem;
  }
}

/* Card */
.profile-card, .card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* Header and font */
h2 { text-align: center; color: #1e293b; margin-bottom: 1.8rem; font-size: 1.6rem; font-weight: 600; }
.info p { margin: 1.2rem 0; color: #475569; font-size: 1.1rem; }
.info strong { color: #0f172a; min-width: 110px; display: inline-block; }

/* Button */
.buttons { display: flex; gap: 1rem; margin-top: 2.5rem; }
button {
  flex: 1; padding: 0.9rem; border: none; border-radius: 10px;
  font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-secondary { background: #e2e8f0; color: #475569; }
.btn-secondary:hover { background: #cbd5e1; }
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }

/* Tasks & Teams */
.task-item, .team-item {
  display: flex; justify-content: space-between; padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}
.task-item:last-child, .team-item:last-child { border-bottom: none; }
.days { color: #ef4444; font-weight: 600; }
.members { color: #64748b; }
.right-column { display: flex; flex-direction: column; gap: 2rem; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 16px; padding: 2rem;
  width: 90%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.modal-content h2 { text-align: center; margin-bottom: 1.5rem; font-size: 1.6rem; }

/* Modal form */
.user-info { margin: 0.5rem 0; color: #4b5563; font-size: 1rem; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500; }
.form-group input {
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 1rem;
}
.form-group input:disabled { background: #f3f4f6; color: #6b7280; cursor: not-allowed; }
.forgot-link { display: block; margin-top: 0.5rem; color: #3b82f6; font-size: 0.9rem; text-decoration: none; }
.role-btn { background: #e5e7eb; color: #4b5563; padding: 0.6rem 1.2rem; border: none; border-radius: 8px; cursor: not-allowed; }

/* Modal Button */
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-submit, .btn-cancel {
  flex: 1; padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer;
}
.btn-submit { background: #3b82f6; color: white; }
.btn-cancel { background: #e5e7eb; color: #374151; }
</style>