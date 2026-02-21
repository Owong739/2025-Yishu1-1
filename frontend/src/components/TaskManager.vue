<template>
  <div class="container">
    <header class="header">
      <div class="title-wrapper">
        <h1>Task Manager</h1>
        <button 
          v-if="isProjectManager" 
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
              <th>Assignee</th>
              <th>Sprint</th>
              <th>Code URL</th> <!-- ADDED -->
              <th>Test Case</th> <!-- ADDED -->
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.project }}</td>
              <td>{{ task.title }}</td>
              <td>
                <!-- Dynamic Status Badge -->
                <span :class="['badge', getStatusClass(task.status)]">
                  {{ task.status }}
                </span>
              </td>
              <td>
                <!-- Dynamic Priority Badge -->
                <span :class="['badge', getPriorityClass(task.priority)]">
                  {{ task.priority }}
                </span>
              </td>
              <td>{{ task.assignee || '-' }}</td>
              <td>{{ task.sprint || '-' }}</td>
              <!-- Display DB codeUrl and testCase with truncation -->
              <td class="truncate-cell">{{ truncateText(task.codeUrl, 20) || '-' }}</td>
              <td class="truncate-cell">{{ truncateText(task.testCase, 20) || '-' }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn">Edit / View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ... Form Section remains the same ... -->
        <div class="form-section">
            <h2 v-if="isEditing">Task Details #{{ currentTask.id }}</h2>
            <h2 v-else>Welcome to Task Manager</h2>

            <form v-if="isEditing" @submit.prevent="saveTask" class="edit-task-form">
                <!-- ... Inputs (from your previous code) ... -->
                <div class="form-grid-pm">
                <div class="form-field">
                    <label>Project</label>
                    <input v-model="currentTask.project" readonly class="readonly" />
                </div>
                <div class="form-field">
                    <label>Title * (PM Only)</label>
                    <input v-model="currentTask.title" :readonly="!isProjectManager" :class="{ readonly: !isProjectManager }" required />
                </div>
                <div class="form-field">
                    <label>Status (PM Only)</label>
                    <select v-model="currentTask.status" :disabled="!isProjectManager">
                    <option>dev(developer)</option>
                    <option>BA(Business Analyst)</option>
                    <option>test(tester)</option>
                    <option>uat(UAT user)</option>
                    <option>complete</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Priority (PM Only)</label>
                    <select v-model="currentTask.priority" :disabled="!isProjectManager">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>Assignee (PM Only)</label>
                    <select v-model="currentTask.assignee" @change="autoFillRoleEdit" :disabled="!isProjectManager">
                    <option value="">- Select -</option>
                    <option v-for="u in availableUsers" :key="u.id" :value="u.name">{{ u.name }}</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>No.Dates (PM Only)</label>
                    <input v-model.number="currentTask.noDates" type="number" :readonly="!isProjectManager" :class="{ readonly: !isProjectManager }" />
                </div>
                </div>

                <div class="form-field full-width">
                <label>User Story (Business Analyst Only)</label>
                <textarea v-model="currentTask.userStory" rows="4" :readonly="!isBusinessAnalyst" :class="{ 'readonly': !isBusinessAnalyst }"></textarea>
                </div>

                <div class="form-field full-width">
                <label>Project Code URL (Developer Only)</label>
                <textarea v-model="currentTask.codeUrl" rows="2" :readonly="!isDeveloper" :class="{ 'readonly': !isDeveloper }"></textarea>
                </div>

                <div class="form-field full-width">
                <label>Test Case (Tester Only)</label>
                <textarea v-model="currentTask.testCase" rows="4" :readonly="!isTester" :class="{ 'readonly': !isTester }"></textarea>
                </div>

                <div class="form-actions">
                <button type="submit" class="save-btn">Save Changes</button>
                <button type="button" @click="isEditing = false" class="cancel-btn">Close</button>
                </div>
            </form>
        </div>
      </div>
    </div>
    
    <!-- Create Modal ... (pm only) -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2>Create New Task</h2>
          <form @submit.prevent="confirmCreate">
            <div class="form-grid">
              <div class="form-field">
                <label>Project *</label>
                <select v-model="newTask.project" @change="handleProjectChange" required>
                  <option v-for="p in projects" :key="p.id" :value="p.name">{{ p.name }}</option>
                </select>
              </div>
              <div class="form-field">
                <label>Title *</label>
                <input v-model="newTask.title" required />
              </div>
              <div class="form-field">
                <label>Status</label>
                <select v-model="newTask.status">
                  <option>dev(developer)</option>
                  <option>BA(Business Analyst)</option>
                  <option>test(tester)</option>
                  <option>uat(UAT user)</option>
                  <option>complete</option>
                </select>
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

// ROLE LOGIC
const isProjectManager = computed(() => userRole.value.toLowerCase().trim() === 'project manager');
const isBusinessAnalyst = computed(() => userRole.value.toLowerCase().trim() === 'business analyst');
const isDeveloper = computed(() => userRole.value.toLowerCase().trim() === 'developer');
const isTester = computed(() => userRole.value.toLowerCase().trim() === 'tester');

const projects = ref<any[]>([]);
const selectedProject = ref<string | null>(null);
const tasks = ref<any[]>([]);
const isLoading = ref(false);
const availableUsers = ref<any[]>([]);
const showCreateModal = ref(false);
const isEditing = ref(false);

const newTask = reactive({
  project: '', title: '', status: 'dev(developer)', priority: 'Medium',
  userStory: '', assignee: '', role: '', sprint: null, noDates: 0,
  codeUrl: '', testCase: ''
});

const currentTask = reactive({
  id: null as any, project: '', title: '', status: '', priority: '',
  userStory: '', assignee: '', role: '', sprint: null, noDates: 0,
  codeUrl: '', testCase: ''
});

// Helper to define CSS classes for Status
const getStatusClass = (status: string) => {
  if (!status) return '';
  if (status.includes('dev')) return 'status-dev';
  if (status.includes('BA')) return 'status-ba';
  if (status.includes('test')) return 'status-test';
  if (status.includes('uat')) return 'status-uat';
  if (status.includes('complete')) return 'status-complete';
  return '';
};

// Helper to define CSS classes for Priority
const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'High': return 'prio-high';
    case 'Medium': return 'prio-med';
    case 'Low': return 'prio-low';
    default: return '';
  }
};

const filteredTasks = computed(() => {
  if (!selectedProject.value) return tasks.value;
  return tasks.value.filter(t => t.project === selectedProject.value);
});

const truncateText = (text: string | undefined, length = 40) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const selectProject = (projectName: string | null) => {
  selectedProject.value = projectName;
  fetchTasks();
};

const fetchProjects = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const res = await axios.get('http://localhost:3000/api/projects', {
      params: { userId: user.id, role: user.role, userName: user.name }
    });
    if (res.data.success) projects.value = res.data.data;
  } catch (err) { console.error(err); }
};

const fetchTasks = async () => {
  isLoading.value = true;
  try {
    const params = selectedProject.value ? { project: selectedProject.value } : {};
    const res = await axios.get('http://localhost:3000/api/tasks', { params });
    if (res.data.success) {
      tasks.value = res.data.data.map((t: any) => ({ ...t, id: String(t.id).padStart(3, '0') }));
    }
  } catch (err) { console.error(err); } finally { isLoading.value = false; }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/users');
    if (res.data.success) availableUsers.value = res.data.data;
  } catch (err) { console.error(err); }
};

const handleProjectChange = () => {
  const selectedProj = projects.value.find(p => p.name === newTask.project);
  newTask.sprint = selectedProj ? selectedProj.sprint_count : null;
};

const openCreateModal = () => {
  if (!isProjectManager.value) return;
  newTask.project = selectedProject.value || '';
  handleProjectChange();
  showCreateModal.value = true;
};

const closeCreateModal = () => { showCreateModal.value = false; };

const autoFillRoleEdit = () => {
  const user = availableUsers.value.find(u => u.name === currentTask.assignee);
  currentTask.role = user ? user.role : '';
};

const editTask = (task: any) => {
  Object.assign(currentTask, task);
  currentTask.userStory = task.userStory || '';
  currentTask.codeUrl = task.codeUrl || '';
  currentTask.testCase = task.testCase || '';
  isEditing.value = true;
};

const saveTask = async () => {
  try {
    const res = await axios.put(`http://localhost:3000/api/tasks/${currentTask.id}`, currentTask);
    if (res.data.success) {
      alert('Updated Successfully!');
      await fetchTasks();
      isEditing.value = false;
    }
  } catch (err: any) { alert('Update failed: ' + err.message); }
};

const confirmCreate = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/tasks', newTask);
    if (res.data.success) {
      alert('Task created!');
      await fetchTasks();
      closeCreateModal();
    }
  } catch (err: any) { alert('Failed: ' + err.message); }
};

onMounted(async () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) { router.push('/'); return; }
  userRole.value = JSON.parse(userStr).role || '';
  await fetchProjects();
  await fetchUsers();
  await fetchTasks();
});
</script>

<style scoped>
.readonly {
  background-color: #f1f3f5;
  cursor: not-allowed;
  border: 1px solid #ced4da;
}
.form-grid-pm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

/* TABLE BADGE STYLES */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  display: inline-block;
  white-space: nowrap;
}

/* Status Colors */
.status-dev { background-color: #3498db; }      /* Blue */
.status-ba { background-color: #9b59b6; }       /* Purple */
.status-test { background-color: #e67e22; }     /* Orange */
.status-uat { background-color: #1abc9c; }      /* Teal */
.status-complete { background-color: #27ae60; } /* Green */

/* Priority Colors */
.prio-high { background-color: #e74c3c; }   /* Red */
.prio-med { background-color: #f1c40f; color: #333; } /* Yellow */
.prio-low { background-color: #95a5a6; }    /* Grey */

.truncate-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  color: #666;
}
</style>
<style scoped src="./TaskManager.css"></style>