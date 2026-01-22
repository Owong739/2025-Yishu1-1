<script setup>
import { ref, computed } from 'vue'

// ==================== User Data ====================
const users = ref([
  { id: 's111', name: 'John', email: 's111@xxx.mail.com', contact: '123', role: 'Supervisor', status: 'Online' },
  { id: 's112', name: 'Mary', email: 's112@xxx.mail.com', contact: '124', role: 'Admin', status: 'Offline' },
  { id: 's113', name: 'Peter', email: 's113@xxx.mail.com', contact: '125', role: 'Member', status: 'Away' }
])

// ==================== Checkbox Selection ====================
const selectAll = ref(false)
const selectedIds = ref([])

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? users.value.map(u => u.id) : []
}

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
  selectAll.value = selectedIds.value.length === users.value.length
}

// ==================== Batch Delete ====================
const batchDelete = () => {
  if (!selectedIds.value.length) return alert('Please select users to delete!')
  if (confirm(`Delete ${selectedIds.value.length} user(s)?`)) {
    users.value = users.value.filter(u => !selectedIds.value.includes(u.id))
    selectedIds.value = []
    selectAll.value = false
  }
}

// ==================== Search ====================
const searchTerm = ref('')
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  const term = searchTerm.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term) ||
    u.id.includes(term)
  )
})

// ==================== Create User Modal ====================
const showCreateModal = ref(false)
const createForm = ref({
  name: '',
  email: '',
  contact: '',
  role: 'Member'
})

const openCreateModal = () => {
  createForm.value = { name: '', email: '', contact: '', role: 'Member' }
  showCreateModal.value = true
}

const closeCreateModal = () => showCreateModal.value = false

const submitCreate = () => {
  if (!createForm.value.name || !createForm.value.email || !createForm.value.contact) {
    alert('Please fill all fields!')
    return
  }
  const newId = 's' + String(111 + users.value.length).padStart(3, '0')
  users.value.push({
    id: newId,
    name: createForm.value.name,
    email: createForm.value.email,
    contact: createForm.value.contact,
    role: createForm.value.role,
    status: 'Online'
  })
  alert('User created successfully!')
  closeCreateModal()
}
</script>

<template>
  <!-- ==================== Main Layout ==================== -->
  <div class="manage-page">
    <!-- Header -->
    <div class="header">
      <h1>User Account</h1>
      <div class="actions">
        <input type="text" v-model="searchTerm" placeholder="Search..." class="search-box" />
        <button class="btn-create" @click="openCreateModal">+ Create User</button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>Id</th>
            <th>Username</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <input type="checkbox" :checked="selectedIds.includes(user.id)" @change="toggleSelect(user.id)" />
            </td>
            <td>
              <div class="user-cell">
                <div class="avatar"></div>
                <span>{{ user.id }}</span>
              </div>
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.contact }}</td>
            <td><span class="role" :class="user.role.toLowerCase()">{{ user.role }}</span></td>
            <td><span class="status" :class="user.status.toLowerCase()">{{ user.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <button class="btn-delete" @click="batchDelete" :disabled="selectedIds.length === 0">
        [ Batch Delete ]
      </button>
    </div>

    <!-- ==================== Create User Modal ==================== -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2>Create User</h2>

          <div class="form-group">
            <label>Username:</label>
            <input type="text" v-model="createForm.name" placeholder="Enter username" />
          </div>

          <div class="form-group">
            <label>Email:</label>
            <input type="email" v-model="createForm.email" placeholder="Enter email" />
          </div>

          <div class="form-group">
            <label>Contact:</label>
            <input type="text" v-model="createForm.contact" placeholder="Enter contact" />
          </div>

          <div class="form-group">
            <label>Role:</label>
            <div class="radio-group">
              <label><input type="radio" v-model="createForm.role" value="Supervisor" /> Supervisor</label>
              <label><input type="radio" v-model="createForm.role" value="Member" /> Member</label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-submit" @click="submitCreate">Create</button>
            <button class="btn-cancel" @click="closeCreateModal">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* ==================== Layout ==================== */
.manage-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #0f172a; /* Force dark text */
}

/* ==================== Header ==================== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.header h1 { font-size: 1.8rem; color: #0f172a; font-weight: 600; }
.actions { display: flex; gap: 1rem; align-items: center; }
.search-box input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  width: 250px;
  font-size: 1rem;
  color: #0f172a;
}
.btn-create {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* ==================== Table ==================== */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
table { width: 100%; border-collapse: collapse; }
thead { background: #f1f5f9; }
th, td { padding: 1.1rem 1rem; text-align: left; color: #0f172a; font-size: 1rem; }
th { font-weight: 600; color: #1e293b; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
tbody tr:hover { background: #f8fafc; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #0f172a;
  font-weight: 500;
}
.avatar { width: 38px; height: 38px; background: #cbd5e1; border-radius: 50%; }

/* ==================== Role & Status Pills (Dark Style) ==================== */
.role {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white !important;
}
.role.supervisor { background: #6366f1; } /* Indigo */
.role.admin      { background: #ef4444; } /* Red */
.role.member     { background: #10b981; } /* Green */

.status {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white !important;
}
.status.online  { background: #10b981; }
.status.offline { background: #ef4444; }
.status.away    { background: #f59e0b; }

/* ==================== Footer ==================== */
.footer { margin-top: 1.5rem; text-align: left; }
.btn-delete {
  background: transparent;
  color: #ef4444;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
}
.btn-delete:disabled { color: #94a3b8; cursor: not-allowed; }

/* ==================== Modal ==================== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 16px; padding: 2rem;
  width: 90%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  color: #0f172a;
}
.modal-content h2 { text-align: center; margin-bottom: 1.5rem; font-size: 1.6rem; color: #0f172a; }

.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500; }
.form-group input {
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 1rem; color: #0f172a;
}

.radio-group {
  display: flex; gap: 2rem; margin-top: 0.5rem;
}
.radio-group label {
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #0f172a;
}

.modal-actions {
  display: flex; gap: 1rem; margin-top: 2rem;
}
.btn-submit, .btn-cancel {
  flex: 1; padding: 0.8rem; border-radius: 8px; border: none; cursor: pointer;
}
.btn-submit { background: #3b82f6; color: white; }
.btn-cancel { background: #e5e7eb; color: #374151; }
</style>