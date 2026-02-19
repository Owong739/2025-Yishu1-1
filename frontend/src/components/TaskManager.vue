<template>
  <div class="container">
    <header class="header">
      <div class="title-wrapper">
        <h1>Task Manager</h1>
        <button @click="openCreateModal" class="create-header-btn">
          + Create New Task
        </button>
      </div>
    </header>

    <div class="main-layout">
    <aside class="sidebar">
      <h3>Projects</h3>
      <ul class="project-list">
        <li :class="{ active: selectedProject === null }" @click="selectProject(null)">
          All Tasks
        </li>
        <li
          v-for="project in projects"
          :key="project.id"
          :class="{ active: selectedProject === project.name }"
          @click="selectProject(project.name)"
        >
          {{ project.name }}
          <span v-if="selectedProject === project.name" class="active-indicator">✓</span>
        </li>
        <li v-if="projects.length === 0" class="no-projects">No projects found</li>
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
              <th>Sprint</th>
              <th>No.Dates</th>
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
              <td>{{ task.sprint || '-' }}</td>
              <td>{{ task.noDates }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="no-tasks">
          <h3>No tasks found for this project</h3>
          <p>Try creating a new task for "{{ selectedProject || 'this project' }}"</p>
        </div>

        <!-- Edit Form Section -->
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
              <label>Sprint (No.)</label>
              <input v-model.number="currentTask.sprint" type="number" readonly class="readonly" />
            </div>
            <div class="form-field">
              <label>No.Dates</label>
              <input v-model.number="currentTask.noDates" type="number" />
            </div>
            <div class="form-field full-width">
              <label>User Story</label>
              <textarea v-model="currentTask.userStory" rows="6"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">Save Changes</button>
              <button type="button" @click="isEditing = false" class="cancel-btn">Cancel</button>
            </div>
          </form>
          <div v-else class="welcome">
            <p>Select a task to edit or select a project from the sidebar.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2>Create New Task</h2>
          <button class="close-btn" @click="closeCreateModal">×</button>

          <form @submit.prevent="confirmCreate">
            <div class="form-grid">
              <div class="form-field">
                <label>Project *</label>
                <!-- FIXED: Dropdown populated from projects table -->
                <select v-model="newTask.project" @change="handleProjectChange" required>
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
                <label>Sprint (No.)</label>
                <input v-model.number="newTask.sprint" type="number" readonly class="readonly" />
              </div>

              <div class="form-field">
                <label>No.Dates</label>
                <input v-model.number="newTask.noDates" type="number" />
              </div>

              <div class="form-field full-width">
                <label>User Story</label>
                <textarea v-model="newTask.userStory" rows="6"></textarea>
              </div>
            </div>

            <div class="modal-actions">
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
const projects = ref<any[]>([]);
const selectedProject = ref<string | null>(null);
const tasks = ref<any[]>([]);
const isLoading = ref(false);
const availableUsers = ref<any[]>([]);
const showCreateModal = ref(false);
const isEditing = ref(false);

const newTask = reactive({
  project: '', title: '', status: 'To Do', priority: 'Medium',
  userStory: '', assignee: '', role: '', sprint: null as number | null, noDates: 0
});

const currentTask = reactive({
  id: null as any, project: '', title: '', status: 'To Do', priority: 'Medium',
  userStory: '', assignee: '', role: '', sprint: null as number | null, noDates: 0
});

// Computed filtering logic
const filteredTasks = computed(() => {
  if (!selectedProject.value) return tasks.value;
  return tasks.value.filter(t => t.project === selectedProject.value);
});

const truncateText = (text: string | undefined) => {
  if (!text) return '';
  return text.length > 40 ? text.substring(0, 40) + '...' : text;
};

// Selection handler
const selectProject = (projectName: string | null) => {
  selectedProject.value = projectName;
  // Option: Fetch tasks specifically for this project from backend
  fetchTasks();
};

const fetchProjects = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    // We must send the role so the backend knows to unlock the list
    const res = await axios.get('http://localhost:3000/api/projects', {
      params: {
        userId: user.id,
        role: user.role, // This is key!
        userName: user.name
      }
    });
    
    if (res.data.success) {
      projects.value = res.data.data;
    }
  } catch (err) {
    console.error('Failed to load projects', err);
  }
};

const fetchTasks = async () => {
  isLoading.value = true;
  try {
    // Backend supports ?project= filter
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

const fetchUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/users');
    if (res.data.success) {
      availableUsers.value = res.data.data;
    }
  } catch (err) {
    console.error('Failed to load users', err);
  }
};

const handleProjectChange = () => {
  const selectedProj = projects.value.find(p => p.name === newTask.project);
  newTask.sprint = selectedProj ? selectedProj.sprint_count : null;
};

const openCreateModal = () => {
  newTask.project = selectedProject.value || '';
  handleProjectChange();
  showCreateModal.value = true;
};

const closeCreateModal = () => { showCreateModal.value = false; };

const autoFillRoleCreate = () => {
  const user = availableUsers.value.find(u => u.name === newTask.assignee);
  newTask.role = user ? user.role : '';
};

const autoFillRoleEdit = () => {
  const user = availableUsers.value.find(u => u.name === currentTask.assignee);
  currentTask.role = user ? user.role : '';
};

const confirmCreate = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/tasks', newTask);
    if (res.data.success) {
      alert('Task created!');
      await fetchTasks();
      closeCreateModal();
    }
  } catch (err: any) {
    alert('Failed: ' + (err.response?.data?.error || err.message));
  }
};

const editTask = (task: any) => {
  Object.assign(currentTask, task);
  isEditing.value = true;
};

const saveTask = async () => {
  try {
    const res = await axios.put(`http://localhost:3000/api/tasks/${currentTask.id}`, currentTask);
    if (res.data.success) {
      alert('Updated!');
      await fetchTasks();
      isEditing.value = false;
    }
  } catch (err: any) {
    alert('Failed: ' + (err.response?.data?.error || err.message));
  }
};

onMounted(async () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    router.push('/');
    return;
  }
  userRole.value = JSON.parse(userStr).role || '';
  
  await fetchProjects();
  await fetchUsers();
  await fetchTasks();
});
</script>

<style scoped src="./TaskManager.css"></style>
