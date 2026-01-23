<template>
  <div class="container">
   
    <header class="header">
      <div class="title-wrapper">
        <h1>Task Manager</h1>
        <!-- Only Product Manager can see and click "Create New Task" -->
        <button
          v-if="isProductManager"
          @click="openCreateModal"
          class="create-header-btn"
        >
          + Create New Task
        </button>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        <h3>Projects</h3>
        <ul class="project-list">
          <li
            v-for="project in projects"
            :key="project.id"
            :class="{ active: selectedProject === project.name }"
            @click="selectedProject = project.name"
          >
            {{ project.name }}
            <span v-if="selectedProject === project.name" class="active-indicator">✓</span>
          </li>
          <li v-if="projects.length === 0" class="no-projects">
            No projects yet
          </li>
        </ul>
      </aside>

      <div class="content">
        <div v-if="isLoading" class="loading">Loading tasks...</div>

        <table v-else-if="filteredTasks.length" class="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>User Story</th>
              <th>Assignee</th>
              <th>Role</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.project }}</td>
              <td>{{ task.title }}</td>
              <td>
                <span :class="['status-badge', task.status.toLowerCase().replace(/\s/g, '')]">
                  {{ task.status }}
                </span>
              </td>
              <td>{{ task.priority }}</td>
              <td class="user-story-cell">{{ truncateText(task.userStory) }}</td>
              <td>{{ task.assignee || '-' }}</td>
              <td>{{ task.role || '-' }}</td>
              <td>{{ formatDueDate(task.dueDate) || '-' }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="no-tasks">
          <h3>No tasks found</h3>
          <p v-if="selectedProject">Try selecting another project or create a new task!</p>
          <p v-else>Click "+ Create New Task" to get started</p>
        </div>

        <div class="form-section">
          <h2 v-if="isEditing">Edit Task #{{ currentTask.id }}</h2>
          <h2 v-else>Welcome to Task Manager</h2>

          <form v-if="isEditing" @submit.prevent="saveTask" class="edit-task-form">
            <div class="form-field">
              <label>Project</label>
              <input v-model="currentTask.project" readonly class="readonly" />
            </div>

            <div class="form-field">
              <label>Title *</label>
              <input v-model="currentTask.title" required />
            </div>

            <div class="form-field">
              <label>Status</label>
              <select v-model="currentTask.status">
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>
            </div>

            <div class="form-field">
              <label>Priority</label>
              <select v-model="currentTask.priority">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div class="form-field">
              <label>Assignee</label>
              <select v-model="currentTask.assignee" @change="autoFillRoleEdit">
                <option value="">- Select -</option>
                <option v-for="u in availableUsers" :key="u.id" :value="u.name">
                  {{ u.name }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label>Role</label>
              <input v-model="currentTask.role" type="text" readonly class="readonly" />
            </div>

            <div class="form-field">
              <label>Due Date</label>
              <input v-model="currentTask.dueDate" type="date" required />
            </div>

            <div class="form-field full-width">
              <label>User Story</label>
              <textarea v-model="currentTask.userStory" rows="6" placeholder="As a ... I want ... so that ..."></textarea>
            </div>

            <div class="form-actions">
              <!-- Only Product Manager can see and click "Save Changes" -->
              <button
                v-if="isProductManager"
                type="submit"
                class="save-btn"
              >
                Save Changes
              </button>

              <button
                type="button"
                @click="isEditing = false"
                class="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>

          <div v-else class="welcome">
            <p>Select a task to edit or create a new one</p>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2>Create New Task</h2>
          <button class="close-btn" @click="closeCreateModal">×</button>

          <form @submit.prevent="confirmCreate">
            <div class="form-grid">
              <div class="form-field">
                <label>Project *</label>
                <select v-model="newTask.project" required>
                  <option value="" disabled>Select project</option>
                  <option v-for="p in projects" :key="p.id" :value="p.name">
                    {{ p.name }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label>Title *</label>
                <input v-model="newTask.title" required />
              </div>

              <div class="form-field">
                <label>Status</label>
                <select v-model="newTask.status">
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
              </div>

              <div class="form-field">
                <label>Priority</label>
                <select v-model="newTask.priority">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div class="form-field">
                <label>Assignee</label>
                <select v-model="newTask.assignee" @change="autoFillRoleCreate">
                  <option value="">- Select -</option>
                  <option v-for="u in availableUsers" :key="u.id" :value="u.name">
                    {{ u.name }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label>Role</label>
                <input v-model="newTask.role" type="text" readonly class="readonly" />
              </div>

              <div class="form-field">
                <label>Due Date</label>
                <input v-model="newTask.dueDate" type="date" />
              </div>

              <div class="form-field full-width">
                <label>User Story</label>
                <textarea v-model="newTask.userStory" rows="6" placeholder="As a ... I want ... so that ..."></textarea>
              </div>
            </div>

            <div class="modal-actions">
              <!-- Assuming create also restricted to Product Manager -->
              <button type="submit" class="confirm-btn">Create Task</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const userRole = ref<string>('');
const isProductManager = computed(() => userRole.value === 'Product Manager');

const projects = ref<{ id: number; name: string }[]>([]);
const selectedProject = ref<string | null>(null);
const tasks = ref<any[]>([]);
const isLoading = ref(false);
const availableUsers = ref<{ id: number; name: string; role: string }[]>([]);
const showCreateModal = ref(false);
const isEditing = ref(false);

const newTask = reactive({
  project: '',
  title: '',
  status: 'To Do',
  priority: 'Medium',
  userStory: '',
  assignee: '',
  role: '',
  dueDate: ''
});

const currentTask = reactive({
  id: null as number | null,
  project: '',
  title: '',
  status: 'To Do',
  priority: 'Medium',
  userStory: '',
  assignee: '',
  role: '',
  dueDate: ''
});

const filteredTasks = computed(() => {
  if (!selectedProject.value) return tasks.value;
  return tasks.value.filter(t => t.project === selectedProject.value);
});

const truncateText = (text: string | undefined, maxLength = 40) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const fetchProjects = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/projects');
    if (res.data.success) {
      projects.value = res.data.data;
      if (projects.value.length > 0 && !selectedProject.value) {
        selectedProject.value = projects.value[0].name;
        newTask.project = projects.value[0].name;
      }
    }
  } catch (err) {
    console.error('Failed to load projects', err);
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/users');
    if (res.data.success) {
      availableUsers.value = res.data.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        role: u.role || '未設定'
      }));
    }
  } catch (err) {
    console.error('Failed to load users', err);
  }
};

const fetchTasks = async () => {
  isLoading.value = true;
  try {
    const params = selectedProject.value ? { project: selectedProject.value } : {};
    const res = await axios.get('http://localhost:3000/api/tasks', { params });
    if (res.data.success) {
      tasks.value = res.data.data.map((t: any) => ({
        ...t,
        id: String(t.id).padStart(3, '0')
      }));
    }
  } catch (err) {
    console.error('Failed to load tasks', err);
  } finally {
    isLoading.value = false;
  }
};

const confirmCreate = async () => {
  if (!newTask.project || !newTask.title || !newTask.role) {
    alert('Please fill in the required fields.');
    return;
  }

  try {
    const payload = {
      project: newTask.project,
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority,
      userStory: newTask.userStory.trim() || null,
      assignee: newTask.assignee.trim() || null,
      role: newTask.role.trim() || null,
      dueDate: newTask.dueDate || null,
    };

    const res = await axios.post('http://localhost:3000/api/tasks', payload);
    if (res.data.success) {
      alert('Task created successfully!');
      await fetchTasks();
      closeCreateModal();
    }
  } catch (err) {
    console.error('Error during task creation:', err);
    alert('Creation failed: ' + (err.response?.data?.message || err.message));
  }
};

const openCreateModal = () => {
  Object.assign(newTask, {
    project: selectedProject.value || (projects.value[0]?.name || ''),
    title: '',
    status: 'To Do',
    priority: 'Medium',
    userStory: '',
    assignee: '',
    role: '',
    dueDate: ''
  });
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const autoFillRoleCreate = () => {
  if (!newTask.assignee) {
    newTask.role = '';
    return;
  }
  const user = availableUsers.value.find(u => u.name === newTask.assignee);
  newTask.role = user?.role || 'Default Role';
};

const editTask = (task: any) => {
  currentTask.id = task.id;
  currentTask.project = task.project;
  currentTask.title = task.title;
  currentTask.status = task.status;
  currentTask.priority = task.priority;
  currentTask.userStory = task.userStory || '';
  currentTask.assignee = task.assignee || '';
  currentTask.role = task.role || '';
  currentTask.dueDate = task.dueDate ? task.dueDate.split('T')[0] : '';

  isEditing.value = true;
  setTimeout(() => {
    document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

const autoFillRoleEdit = () => {
  if (!currentTask.assignee) {
    currentTask.role = '';
    return;
  }
  const user = availableUsers.value.find(u => u.name === currentTask.assignee);
  currentTask.role = user?.role || '未設定';
};

const saveTask = async () => {
  if (!currentTask.id) return;

  try {
    const payload = {
      project: currentTask.project,
      title: currentTask.title,
      status: currentTask.status,
      priority: currentTask.priority,
      userStory: currentTask.userStory.trim() || null,
      assignee: currentTask.assignee.trim() || null,
      role: currentTask.role.trim() || null,
      dueDate: currentTask.dueDate ? currentTask.dueDate.split('T')[0] : null
    };

    const res = await axios.put(`http://localhost:3000/api/tasks/${currentTask.id}`, payload);
    if (res.data.success) {
      alert('Task updated successfully!');
      await fetchTasks();
      isEditing.value = false;
    }
  } catch (err) {
    alert('Update failed: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(async () => {
  if (!localStorage.getItem('user')) {
    router.push('/');
    return;
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    userRole.value = user.role?.trim() || '';
  }

  await Promise.all([
    fetchProjects(),
    fetchUsers(),
    fetchTasks()
  ]);
});

const formatDueDate = (dateString: string) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};
</script>

<style scoped>
.readonly {
  background: #f8f9fa;
  color: #555;
  cursor: default;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
}
.status-badge.todo { background: #ffeaa7; color: #d63031; }
.status-badge.inprogress { background: #74b9ff; color: white; }
.status-badge.review { background: #a29bfe; color: white; }
.status-badge.done { background: #00b894; color: white; }
</style>

<style scoped src="./TaskManager.css"></style>
