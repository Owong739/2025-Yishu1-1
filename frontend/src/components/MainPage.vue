<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';


// 定義 TypeScript 介面
interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date?: string;     
  end_date?: string;       
  sprint_count?: number;   
  project_manager?: string;
}

interface User{
  id: number;
  name: string;
  role: string;
}

const projects = ref<Project[]>([]);
const users = ref<User[]>([]);

const showCreateModal = ref(false);
const router = useRouter();
const userName = ref('');


const newProjectName = ref('');
const newProjectDesc = ref('');
const newStartDate = ref('');     
const newEndDate = ref('');        
const newSprintCount = ref(1);     
const selectedManager = ref('');
const currentUserRole = ref('');

const goToProjectDetail = (projectId: number) => {
  router.push(`/project/${projectId}`);
};

// 獲取專案列表
const fetchProjects = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);

    // 將使用者資訊作為參數發送給後端
    const response = await axios.get('http://localhost:3000/api/projects', {
      params: {
        userId: user.id,
        role: user.role,
        userName: user.name
      }
    });
    
    projects.value = response.data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

const projectManagers = computed(() => {
  return users.value.filter(user => user.role === 'Project Manager');
});

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users');
    users.value = response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// 創建新專案
const createProject = async () => {
  if (!newProjectName.value) return;
  try {
    await axios.post('http://localhost:3000/api/projects', {
      name: newProjectName.value,
      description: newProjectDesc.value,
      // 傳送新資料
      startDate: newStartDate.value,
      endDate: newEndDate.value,
      sprintCount: newSprintCount.value,
      projectManager: selectedManager.value
    });
    
    // 重置所有表單
    newProjectName.value = '';
    newProjectDesc.value = '';
    newStartDate.value = '';
    newEndDate.value = '';
    newSprintCount.value = 1;
    selectedManager.value = '';
    
    showCreateModal.value = false;
    fetchProjects();
  } catch (error) {
    console.error('Error creating project:', error);
  }
};

const logout = () => {
  localStorage.removeItem('user');
  router.push('/');
};

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    userName.value = user.name;
    currentUserRole.value = user.role; 
    fetchProjects();
  } else {
    router.push('/');
  }
});
</script>

<template>
  <div class="main-container">

    <div class="content">
      <div class="actions">
        <h2>Your Projects</h2>

        <button 
          v-if="currentUserRole === 'Admin' || currentUserRole === 'Project Manager'"
          @click="showCreateModal = !showCreateModal" 
          class="create-btn"
        >
          + Create New Project
  </button>

      </div>

      <!-- 創建專案的簡單區塊 -->
      <div v-if="showCreateModal" class="create-form">
        <h3>Create New Project</h3>
        
        <div class="form-group">
          <label>Project Name:</label>
          <input v-model="newProjectName" placeholder="Enter project name" />
        </div>

        <div class="form-group">
          <label>Description:</label>
          <input v-model="newProjectDesc" placeholder="Enter description" />
        </div>

        <!-- 1. 持續時間 (Calendar 選擇) -->
        <div class="form-row">
          <div class="form-group">
            <label>Start Date:</label>
            <input type="date" v-model="newStartDate" />
          </div>
          <div class="form-group">
            <label>End Date:</label>
            <input type="date" v-model="newEndDate" />
          </div>
        </div>

        <!-- 2. No of Sprint -->
        <div class="form-group">
          <label>Number of Sprints:</label>
          <input type="number" v-model="newSprintCount" min="1" placeholder="e.g. 4" />
        </div>

        <!-- 3. Assign Project Manager (Dropdown) -->
        <div class="form-group">
          <label>Assign Project Manager:</label>
          <select v-model="selectedManager">
            <option disabled value="">Select a Manager</option>
            <option v-for="user in projectManagers" :key="user.id" :value="user.name">
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="createProject" class="confirm-btn">Confirm</button>
          <button @click="showCreateModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>

      <!-- 專案卡片列表 -->
      <div class="project-grid">
        <div v-for="project in projects" :key="project.id" class="project-card"@click="goToProjectDetail(project.id)" >
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <span class="status-badge" :class="project.status.toLowerCase().replace(' ', '-')">
            {{ project.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  min-height: 100vh;
}
header {
  background-color: #2c3e50;
  color: #2c3e50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logout-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  cursor: pointer;
}
.content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.create-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.create-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px; 
  margin-left: auto;
  margin-right: auto;
}
.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #2c3e50;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

input, select {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.confirm-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  flex: 1;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  flex: 1;
}
.create-form input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s;
}
.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  background-color: #f9f9f9;
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  background-color: #eee;
}
</style>