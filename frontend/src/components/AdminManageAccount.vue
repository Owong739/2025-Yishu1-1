<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 使用者列表
const users = ref([])
const isLoading = ref(true)
const errorMsg = ref('')

const loadUsers = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    })
    users.value = res.data.data || [] 
  } catch (err) {
    console.error('Fail to load user data', err)
    errorMsg.value = 'Cannot load user data'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUsers)

// 搜尋
const searchTerm = ref('')
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  const term = searchTerm.value.toLowerCase()
  return users.value.filter(u =>
    (u.name || '').toLowerCase().includes(term) ||
    (u.email || '').toLowerCase().includes(term) ||
    String(u.id).includes(term)
  )
})

// Create Modal
const showCreateModal = ref(false)
const createForm = ref({ name: '', email: '', password: '', role: 'Developer' })

const roles = [
  'Supervisor',
  'Admin',
  'Project Manager',
  'Business Analyst',
  'Developer',
  'Tester',
  'UAT User',
  'Product Owner'
]

const openCreateModal = () => {
  createForm.value = { name: '', email: '', password: '', role: 'Developer' }
  showCreateModal.value = true
}

const closeCreateModal = () => showCreateModal.value = false

// submitCreate
const submitCreate = async () => {
  if (!createForm.value.name || !createForm.value.email || !createForm.value.password) {
    alert('Please fill in Name、Email and Password！')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/users', createForm.value, {  // ← 改完整 URL
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    })
    alert('create successful！')
    loadUsers()
    closeCreateModal()
  } catch (error) {
    console.error('create error:', error.response?.data || error)
    const msg = error.response?.data?.message || error.message || 'unknown error'
    alert('create failed：' + msg)
  }
}

// saveEdit
const saveEdit = async () => {
  if (!editUser.value) return

  try {
    await axios.patch(`http://localhost:3000/api/users/${editUser.value.id}`, {  // ← 改完整 URL
      name: editUser.value.name,
      email: editUser.value.email,
      role: editUser.value.role
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    })
    alert('update successful！')
    loadUsers()
    closeEditModal()
  } catch (err) {
    alert('update failed：' + (err.response?.data?.message || 'error'))
  }
}

// confirmDelete
const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    await axios.delete(`http://localhost:3000/api/users/${userToDelete.value.id}`, {  // ← 改完整 URL
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    })
    alert('delete sucessful！')
    loadUsers()
    closeDeleteModal()
  } catch (err) {
    alert('delete failed：' + (err.response?.data?.message || 'error'))
  }
}

// Edit Modal
const showEditModal = ref(false)
const editUser = ref(null)

const openEditModal = (user) => {
  editUser.value = { ...user }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editUser.value = null
}

// Delete Modal
const showDeleteModal = ref(false)
const userToDelete = ref(null)

const openDeleteModal = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

</script>

<template>
  <div class="manage-page">
    <div class="header">
      <h1>User Account</h1>
      <div class="actions">
        <input type="text" v-model="searchTerm" placeholder="Search..." class="search-box" />
        <button class="btn-create" @click="openCreateModal">+ Create User</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="errorMsg" class="error-message">{{ errorMsg }}</div>
    <div v-else-if="users.length === 0" class="no-data">Currently no user data</div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td><span class="role">{{ user.role }}</span></td>
            <td class="action-buttons">
              <button class="icon-btn edit" @click="openEditModal(user)">Edit</button>
              <button class="icon-btn delete" @click="openDeleteModal(user)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2>Create Account</h2>
          <div class="form-group">
            <label>User Name</label>
            <input type="text" v-model="createForm.name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="createForm.email" placeholder="example@test.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" v-model="createForm.password" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="createForm.role">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-submit" @click="submitCreate">Create Account</button>
            <button class="btn-cancel" @click="closeCreateModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h2>Edit User</h2>
          <div class="form-group">
            <label>ID:</label>
            <input type="text" :value="editUser?.id" disabled />
          </div>
          <div class="form-group">
            <label>Name:</label>
            <input type="text" v-model="editUser.name" />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" v-model="editUser.email" />
          </div>
          <div class="form-group">
            <label>Role:</label>
            <select v-model="editUser.role">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-submit" @click="saveEdit">Save</button>
            <button class="btn-cancel" @click="closeEditModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content delete-modal" @click.stop>
          <h2>Delete User</h2>
          <p>Are you sure you want to permanently delete this user?</p>
          <div class="delete-info" v-if="userToDelete">
            <p><strong>Name:</strong> {{ userToDelete.name }} (ID: {{ userToDelete.id }})</p>
            <p><strong>Email:</strong> {{ userToDelete.email }}</p>
          </div>
          <p class="warning">This action cannot be undone</p>
          <div class="modal-actions">
            <button class="btn-delete-confirm" @click="confirmDelete">Delete</button>
            <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.manage-page { min-height: 100vh; background: #f8fafc; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { font-size: 1.8rem; color: #1e293b; }
.actions { display: flex; gap: 1rem; align-items: center; }
.search-box { padding: 0.75rem 1rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 250px; }
.btn-create { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.table-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
thead { background: #f1f5f9; }
th, td { padding: 1rem; text-align: left; color: #0f172a; }
th { font-weight: 600; color: #475569; }
tbody tr:hover { background: #f8fafc; }

.role { padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.9rem; font-weight: 500; background: #e2e8f0; color: #475569; }

.action-buttons button { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin: 0 0.5rem; }
.action-buttons .edit { color: #3b82f6; }
.action-buttons .delete { color: #ef4444; }

.loading, .error-message, .no-data { text-align: center; padding: 3rem; font-size: 1.2rem; color: #475569; }
.error-message { color: #ef4444; font-weight: bold; }
.no-data { color: #64748b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content { background: white; border-radius: 16px; padding: 2rem; width: 90%; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.modal-content h2 { text-align: center; margin-bottom: 1.5rem; font-size: 1.6rem; color: #1e293b; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500; }
.form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; }
.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-submit { background: #3b82f6; color: white; flex: 1; padding: 0.8rem; border: none; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: #e5e7eb; color: #374151; flex: 1; padding: 0.8rem; border: none; border-radius: 8px; cursor: pointer; }
.btn-delete-confirm { background: #ef4444; color: white; flex: 1; padding: 0.8rem; border: none; border-radius: 8px; cursor: pointer; }
</style>