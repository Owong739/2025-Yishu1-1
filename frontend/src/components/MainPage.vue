<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// 定義 TypeScript 介面
interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
}

const projects = ref<Project[]>([]);
const newProjectName = ref('');
const newProjectDesc = ref('');
const showCreateModal = ref(false);
const router = useRouter();
const userName = ref('');

// 獲取專案列表
const fetchProjects = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/projects');
    projects.value = response.data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

// 創建新專案
const createProject = async () => {
  if (!newProjectName.value) return;
  try {
    await axios.post('http://localhost:3000/api/projects', {
      name: newProjectName.value,
      description: newProjectDesc.value
    });
    // 重置表單並重新獲取列表
    newProjectName.value = '';
    newProjectDesc.value = '';
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
    userName.value = JSON.parse(userStr).name;
    fetchProjects();
  } else {
    router.push('/');
  }
});
</script>

<template>
  <div class="main-container">
    <header>
      <h1>Agile Dashboard</h1>
      <div class="user-info">
        <span>Welcome, {{ userName }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </header>

    <div class="content">
      <div class="actions">
        <h2>Your Projects</h2>
        <button @click="showCreateModal = !showCreateModal" class="create-btn">
          + Create New Project
        </button>
      </div>

      <!-- 創建專案的簡單區塊 (可改為 Modal) -->
      <div v-if="showCreateModal" class="create-form">
        <input v-model="newProjectName" placeholder="Project Name" />
        <input v-model="newProjectDesc" placeholder="Description" />
        <button @click="createProject">Confirm</button>
      </div>

      <!-- 專案卡片列表 -->
      <div class="project-grid">
        <div v-for="project in projects" :key="project.id" class="project-card">
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
  color: white;
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
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  gap: 1rem;
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
  transition: transform 0.2s;
}
.project-card:hover {
  transform: translateY(-5px);
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  background-color: #eee;
}
</style>