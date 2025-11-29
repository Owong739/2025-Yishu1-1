<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>Project: eg tood ordering</h1>
      <input type="text" placeholder="Search title keyword" class="search-bar" />
    </header>

  

      <!-- Main Area -->
      <main class="content">
        <!-- Task Table -->
        <table class="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.title }}</td>
              <td>
                <span :class="['status-badge', task.status.toLowerCase().replace(' ', '')]">
                  {{ task.status }}
                </span>
              </td>
              <td>{{ task.priority }}</td>
              <td>{{ task.description }}</td>
              <td>{{ task.assignee }}</td>
              <td>{{ task.dueDate }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Create / Edit Form -->
        <div class="form-section">
          <h2>{{ isEditing ? 'Edit Task ID: ' + currentTask.id : 'Home' }}</h2>

          <form @submit.prevent="saveTask">
            <div class="form-grid">
              <div>
                <label>Title</label>
                <input v-model="currentTask.title" type="text" required />
              </div>

              <div>
                <label>Description</label>
                <textarea v-model="currentTask.description" rows="4"></textarea>
              </div>

              <div class="form-row">
                <div>
                  <label>Status</label>
                  <select v-model="currentTask.status">
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select v-model="currentTask.priority" :disabled="!isAdmin">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div>
                  <label>Assign By</label>
                  <select v-model="currentTask.assignee" :disabled="!isAdmin">
                    <option>Sam</option>
                    <option>Tom</option>
                    <option>John</option>
                    <option>Lily</option>
                  </select>
                </div>
                <div>
                  <label>Due Date</label>
                  <input v-model="currentTask.dueDate" type="date" :disabled="!isAdmin" />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="create-btn" @click="createNewTask">Create</button>
              <button type="submit" class="save-btn">Save</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  
</template>

<script setup>
import { ref, reactive } from 'vue'

// Role: change to false to simulate normal User (staff)
const isAdmin = ref(true)  // Set to false → most fields disabled

const tasks = ref([
  {
    id: '001',
    title: 'Home page, after login',
    status: 'To Do',
    priority: 'High',
    description: 'system home page, after login',
    assignee: 'Tom',
    dueDate: '2025-12-20'
  }
])

const isEditing = ref(false)
const currentTask = reactive({
  id: '',
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  assignee: 'Sam',
  dueDate: ''
})

const editTask = (task) => {
  Object.assign(currentTask, { ...task })
  isEditing.value = true
}

const createNewTask = () => {
  isEditing.value = false
  currentTask.id = String(tasks.value.length + 1).padStart(3, '0')
  currentTask.title = ''
  currentTask.description = ''
  currentTask.status = 'To Do'
  currentTask.priority = 'Medium'
  currentTask.assignee = 'Sam'
  currentTask.dueDate = ''
}

const saveTask = () => {
  if (isEditing.value) {
    const index = tasks.value.findIndex(t => t.id === currentTask.id)
    if (index !== -1) tasks.value[index] = { ...currentTask }
  } else {
    tasks.value.push({ ...currentTask })
  }
  alert('Task saved successfully!')
  createNewTask()
}
</script>

<style scoped>
.container { font-family: Arial, sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h1 { margin: 0; color: #333; }
.search-bar { padding: 10px; width: 300px; border: 1px solid #ccc; border-radius: 4px; }

.main-content { display: flex; gap: 20px; }
.sidebar { width: 300px; background: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 14px; }
.sidebar ol { padding-left: 20px; }

.content { flex: 1; }

.task-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.task-table th, .task-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
.task-table th { background: #f5f5f5; }
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}
.status-badge.ToDo { background: #ffe0b3; color: #e67e22; }
.status-badge.InProgress { background: #b3e0ff; color: #2980b9; }
.status-badge.Done { background: #c8e6c9; color: #2e7d32; }

.edit-btn {
  background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;
}
.edit-btn:hover { background: #2980b9; }

.form-section { background: #f8f9fa; padding: 25px; border-radius: 8px; }
.form-section h2 { margin-top: 0; color: #2c3e50; }

.form-grid { display: grid; gap: 15px; }
.form-row { display: flex; gap: 20px; }
.form-row > div { flex: 1; }

label { display: block; margin-bottom: 6px; font-weight: bold; color: #555; }
input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
textarea { resize: vertical; }

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}
.create-btn {
  background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;
}
.save-btn {
  background: #f39c12; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;
}
.create-btn:hover { background: #c0392b; }
.save-btn:hover { background: #e67e22; }
</style>