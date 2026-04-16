<template>
  <div class="container">
    <header class="header">
      <div class="title-wrapper">
        <h1>Task Manager</h1>
        <!-- 只有 PM 可以看到建立按鈕 -->
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
              <th>Role</th>
              <th>Sprint</th>
              <th>No.Dates</th>
              <th>User Story</th> 
              <th>Code URL</th>
              <th>Test Case</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.project }}</td>
              <td>{{ task.title }}</td>
              <td>
                <span :class="['badge', getStatusClass(task.status)]">
                  {{ task.status }}
                </span>
              </td>
              <td>
                <span :class="['badge', getPriorityClass(task.priority)]">
                  {{ task.priority }}
                </span>
              </td>
              <td>{{ task.assignee || '-' }}</td>
              <td>{{ task.role || '-' }}</td>
              <td>{{ task.sprint || '-' }}</td>
              <td>{{ task.noDates || '0' }}</td>
              <td class="truncate-cell" :title="task.userStory">
                {{ truncateText(task.userStory, 40) || '-' }}
              </td>
              <td class="truncate-cell">{{ truncateText(task.codeUrl, 15) || '-' }}</td>
              <td class="truncate-cell">{{ truncateText(task.testCase, 15) || '-' }}</td>
              <td>
                <button @click="editTask(task)" class="edit-btn">Edit / View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="no-tasks">
          <h3>No tasks found</h3>
          <p>Try selecting another project or create a new task!</p>
        </div>

        <!-- Edit Form Section -->
        <div class="form-section">
            <h2 v-if="isEditing">Task Details #{{ currentTask.id }}</h2>
            <h2 v-else>Welcome to Task Manager</h2>

            <form v-if="isEditing" @submit.prevent="saveTask" class="edit-task-form">
                <div class="form-grid-pm">
                  <div class="form-field">
                      <label>Project</label>
                      <input v-model="currentTask.project" readonly class="readonly" />
                  </div>
                  <div class="form-field">
                      <label>Title *</label>
                      <input v-model="currentTask.title" :readonly="!isProjectManager" :class="{ readonly: !isProjectManager }" required />
                  </div>
                  <div class="form-field">
                      <label>Status</label>
                      <!-- UAT User 權限控制：只有 PM 或 (當前是 UAT 狀態且角色是 UAT User) 時才可點擊 -->
                      <select 
                        v-model="currentTask.status" 
                        :disabled="isStatusDisabled" 
                        @change="onEditStatusChange"
                      >
                        <option v-for="opt in availableStatusOptions" :key="opt">{{ opt }}</option>
                      </select>
                  </div>
                  <div class="form-field">
                      <label>Priority</label>
                      <select v-model="currentTask.priority" :disabled="!isProjectManager">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                  </div>
                  <div class="form-field">
                      <label>Assignee</label>
                      <select v-model="currentTask.assignee" @change="autoFillRoleEdit" :disabled="!isProjectManager">
                        <option value="">- Select -</option>
                        <option v-for="u in filteredAssigneesEdit" :key="u.id" :value="u.name">{{ u.name }}</option>
                      </select>
                  </div>
                  <div class="form-field">
                      <label>Role</label>
                      <input v-model="currentTask.role" type="text" readonly class="readonly" />
                  </div>
                    <div class="form-field">
                      <label>Sprint (No.)</label>
                      <select 
                        v-model.number="currentTask.sprint" 
                        :disabled="!isProjectManager" 
                        :class="{ readonly: !isProjectManager }"
                      >
                        <option :value="null">-- Select --</option>
                        <!-- 使用 getSprintOptions 函數生成選項 -->
                        <option v-for="n in getSprintOptions(currentTask.project)" :key="n" :value="n">
                          Sprint {{ n }}
                        </option>
                      </select>
                  </div>
                  <div class="form-field">
                      <label>No.Dates</label>
                      <input v-model.number="currentTask.noDates" type="number" :readonly="!isProjectManager" :class="{ readonly: !isProjectManager }" />
                  </div>
                </div>

                <div class="form-field full-width">
                  <label>User Story</label>
                  <textarea v-model="currentTask.userStory" rows="4" :readonly="!isBusinessAnalyst" :class="{ 'readonly': !isBusinessAnalyst }" :placeholder="isBusinessAnalyst ? 'Enter user story...' : 'Only Business Analyst can edit this field'"></textarea>
                </div>
                <br>
                <div class="form-field full-width">
                  <label>Project URL</label>
                  <textarea v-model="currentTask.codeUrl" rows="2" :readonly="!isDeveloper" :class="{ 'readonly': !isDeveloper }" :placeholder="isDeveloper ? 'Enter code link...' : 'Only Developer can edit this field'"></textarea>
                </div>
                <br>
                <div class="form-field full-width">
                  <label>Test Case</label>
                  <textarea v-model="currentTask.testCase" rows="4" :readonly="!isTester" :class="{ 'readonly': !isTester }" :placeholder="isTester ? 'Enter test cases...' : 'Only Tester can edit this field'"></textarea>
                </div>
                <br>
                <div class="form-actions">
                  <!-- 所有能編輯的角色都要能存檔 -->
                  <button v-if="canUserSave" type="submit" class="save-btn">Save Changes</button>
                  <button type="button" @click="isEditing = false" class="cancel-btn">Close</button>
                </div>
            </form>
        </div>
      </div>
    </div>
    
    <!-- Create Modal (PM Only) -->
    <teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">Create New Task</h2>
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
                <select v-model="newTask.status" @change="onCreateStatusChange">
                  <option>Backlog</option>
                  <option>Dev</option>
                  <option>SIT</option>
                  <option>UAT</option>
                  <option>Done</option>
                </select>
              </div>
              <div class="form-field">
                <label>Assignee</label>
                <select v-model="newTask.assignee" @change="autoFillRoleCreate">
                  <option value="">- Select -</option>
                  <option v-for="u in filteredAssigneesCreate" :key="u.id" :value="u.name">{{ u.name }}</option>
                </select>
              </div>
              <div class="form-field">
                <label>Role</label>
                <input v-model="newTask.role" readonly class="readonly" />
              </div>
              <div class="form-field">
                  <label>Sprint (No.)</label>
                  <select 
                    v-model.number="currentTask.sprint" 
                    :disabled="!isProjectManager" 
                    :class="{ readonly: !isProjectManager }"
                  >
                    <option :value="null">-- Select --</option>
                    <!-- 使用 getSprintOptions 函數生成選項 -->
                    <option v-for="n in getSprintOptions(currentTask.project)" :key="n" :value="n">
                      Sprint {{ n }}
                    </option>
                  </select>
              </div>
            </div>
            <br>
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

// --- ROLE LOGIC ---
const isProjectManager = computed(() => userRole.value.toLowerCase().trim() === 'project manager');
const isBusinessAnalyst = computed(() => userRole.value.toLowerCase().trim() === 'business analyst');
const isDeveloper = computed(() => userRole.value.toLowerCase().trim() === 'developer');
const isTester = computed(() => userRole.value.toLowerCase().trim() === 'tester');
const isUATUser = computed(() => userRole.value.toLowerCase().trim() === 'uat user');

const projects = ref<any[]>([]);
const selectedProject = ref<string | null>(null);
const tasks = ref<any[]>([]);
const isLoading = ref(false);
const availableUsers = ref<any[]>([]);
const showCreateModal = ref(false);
const isEditing = ref(false);

// 保存當前任務原始狀態，用於判斷 UAT 權限
const originalStatus = ref('');

/**
 * UAT USER 權限邏輯
 */
const isStatusDisabled = computed(() => {
  if (isProjectManager.value) return false;
  // 如果是 UAT User，且當前狀態是 UAT，則不禁用（允許切換到 Done）
  if (isUATUser.value && originalStatus.value === 'UAT') return false;
  return true;
});

const getSprintOptions = (projectName: string) => {
  const proj = projects.value.find(p => p.name === projectName);
  if (!proj || !proj.sprint_count) return [];
  
  // 根據 sprint_count 生成 [1, 2, 3...N] 陣列
  return Array.from({ length: proj.sprint_count }, (_, i) => i + 1);
};

const availableStatusOptions = computed(() => {
  const all = ['Backlog', 'Dev', 'SIT', 'UAT', 'Done'];
  // 如果是 UAT User，限制只能選 UAT 或 Done
  if (isUATUser.value && !isProjectManager.value) {
    return ['UAT', 'Done'];
  }
  return all;
});

const canUserSave = computed(() => {
  if (isProjectManager.value) return true;
  if (isBusinessAnalyst.value || isDeveloper.value || isTester.value) return true;
  // UAT User 只有在原始狀態是 UAT 時才能存檔
  if (isUATUser.value && originalStatus.value === 'UAT') return true;
  return false;
});

/**
 * 分派人員過濾邏輯
 */
const statusToRoleMap: Record<string, string | null> = {
  'Backlog': 'Business Analyst',
  'Dev': 'Developer',
  'SIT': 'Tester',
  'UAT': 'UAT User',
  'Done': null
};

const filteredAssigneesCreate = computed(() => {
  const targetRole = statusToRoleMap[newTask.status];
  if (!targetRole) return availableUsers.value.filter(u => u.role !== 'Admin');
  return availableUsers.value.filter(u => u.role === targetRole);
});

const filteredAssigneesEdit = computed(() => {
  const targetRole = statusToRoleMap[currentTask.status];
  if (!targetRole) return availableUsers.value.filter(u => u.role !== 'Admin');
  return availableUsers.value.filter(u => u.role === targetRole);
});

const onCreateStatusChange = () => {
  newTask.assignee = '';
  newTask.role = '';
};

const onEditStatusChange = () => {
  // 如果 UAT 使用者嘗試切換回 UAT (如果不小心點到)，不清除。
  // 但通常是切換到 Done。
  if (isUATUser.value) return; 
  currentTask.assignee = '';
  currentTask.role = '';
};

// --- 基礎數據對象 ---

const newTask = reactive({
  project: '', title: '', status: 'Backlog', priority: 'Medium',
  userStory: '', assignee: '', role: '', sprint: null as number | null, noDates: 0,
  codeUrl: '', testCase: ''
});

const currentTask = reactive({
  id: null as any, project: '', title: '', status: '', priority: '',
  userStory: '', assignee: '', role: '', sprint: null as number | null, noDates: 0,
  codeUrl: '', testCase: ''
});

const getStatusClass = (status: string | null | undefined) => {
  const s = (status || '').toString().trim().toLowerCase();
  const map: Record<string, string> = {
    'backlog': 'status-backlog',
    'dev': 'status-dev',
    'sit': 'status-sit',
    'uat': 'status-uat',
    'done': 'status-complete'
  };
  return map[s] || '';
};

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
  if (selectedProj) {
    newTask.sprint = 1;
  } else {
    newTask.sprint = null;
  }
};

const autoFillRoleCreate = () => {
  const user = availableUsers.value.find(u => u.name === newTask.assignee);
  newTask.role = user ? user.role : '';
};

const autoFillRoleEdit = () => {
  const user = availableUsers.value.find(u => u.name === currentTask.assignee);
  currentTask.role = user ? user.role : '';
};

const openCreateModal = () => {
  if (!isProjectManager.value) return;
  newTask.project = selectedProject.value || '';
  newTask.status = 'Backlog';
  handleProjectChange();
  showCreateModal.value = true;
};

const closeCreateModal = () => { showCreateModal.value = false; };

const editTask = (task: any) => {
  Object.assign(currentTask, task);
  originalStatus.value = task.status; // 記錄原始狀態
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
  } catch (err: any) { alert('Update failed'); }
};

const confirmCreate = async () => {
  if (!newTask.sprint) {
    alert("Please select a Sprint number.");
    return;
  }
  try {
    const res = await axios.post('http://localhost:3000/api/tasks', newTask);
    if (res.data.success) {
      alert('Task created!');
      await fetchTasks();
      closeCreateModal();
    }
  } catch (err: any) { alert('Failed to create'); }
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
/* 樣式保持不變，包含之前定義的狀態顏色 */
.modal-content h2.modal-title {
  text-align: center;
  margin: 24px 0 20px 0;
  font-size: 1.85rem;
  color: #2c3e50;
  font-weight: 700;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.readonly { background-color: #f1f3f5; cursor: not-allowed; border: 1px solid #ced4da; }
.form-grid-pm { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: white; display: inline-block; }

.status-dev { background-color: #3498db; }
.status-ba { background-color: #9b59b6; }
.status-test { background-color: #e67e22; color: #fff; }
.status-uat { background-color: #1abc9c; }
.status-sit { background-color: #f39c12; }
.status-complete { background-color: #27ae60; }
.status-backlog { background-color: #6c757d; color: #fff; }

.prio-high { background-color: #e74c3c; }
.prio-med { background-color: #f1c40f; color: #333; }
.prio-low { background-color: #95a5a6; }
.truncate-cell { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; color: #666; }
</style>
<style scoped src="./TaskManager.css"></style>