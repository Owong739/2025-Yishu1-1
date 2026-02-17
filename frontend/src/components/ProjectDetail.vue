<template>
  <div class="detail-container" v-if="project">
    <!-- Header 部分 -->
    <div class="header-section">
      <button @click="$router.back()" class="back-btn">← Back</button>
      <h1>{{ project.name }}</h1>
      <div class="project-meta">
        <span>📅 {{ project.start_date }} 至 {{ project.end_date }}</span>
        <span>👥 Manager: {{ project.project_manager || 'Unassigned' }}</span>
      </div>
    </div>

    <!-- Sprint 狀態概覽 -->
    <div class="sprint-section">
      <h2>Sprint Roadmap</h2>
      <div class="sprint-timeline">
        <div 
          v-for="sprint in calculatedSprints" 
          :key="sprint.number"
          class="sprint-card"
          :class="sprint.status"
        >
          <div class="sprint-badge">{{ sprint.status.toUpperCase() }}</div>
          <h3>Sprint {{ sprint.number }}</h3>
          <p class="date-range">{{ sprint.start }} - {{ sprint.end }}</p>
          
          <!-- 如果是當前 Sprint，加個特別標示 -->
          <div v-if="sprint.status === 'current'" class="current-tag">🌟 Active Now</div>
        </div>
      </div>
    <div class="members-section">
      <div class="section-header">
        <h2>Project Members</h2>
        <!-- 只有 PM 角色才看得到這個按鈕/選單 -->
        <div v-if="currentUserRole === 'Project Manager'" class="add-member-tool">
          <select v-model="selectedUserId">
            <option disabled value="">Select a user to add</option>
            <option v-for="user in allUsers" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
          <button @click="addMember" class="add-btn">Add Member</button>
        </div>
      </div>

      <div class="member-list">
        <div v-for="member in members" :key="member.id" class="member-item">
          <div class="avatar">{{ member.name[0] }}</div>
          <div class="member-info">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-role">{{ member.role }}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const project = ref<any>(null);
const members = ref<any[]>([]);
const allUsers = ref<any[]>([]);
const selectedUserId = ref('');

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const currentUserRole = currentUser.role;

// 獲取成員
const fetchMembers = async () => {
  const id = route.params.id;
  const response = await axios.get(`http://localhost:3000/api/projects/${id}/members`);
  members.value = response.data.data;
};

// 獲取所有用戶 (給 PM 選擇)
const fetchAllUsers = async () => {
  const response = await axios.get('http://localhost:3000/api/users');
  allUsers.value = response.data.data;
};

// 加入成員
const addMember = async () => {
  if (!selectedUserId.value) return;
  try {
    const id = route.params.id;
    await axios.post(`http://localhost:3000/api/projects/${id}/members`, {
      userId: selectedUserId.value
    });
    selectedUserId.value = '';
    fetchMembers(); // 重新整理列表
  } catch (error: any) {
    alert(error.response?.data?.message || 'Error adding member');
  }
};

// 獲取專案資料
const fetchProjectDetail = async () => {
  try {
    const id = route.params.id;
    const response = await axios.get(`http://localhost:3000/api/projects/${id}`);
    project.value = response.data.data;
  } catch (error) {
    console.error('Error fetching project detail:', error);
  }
};

// 重點：自動計算 Sprint 邏輯
const calculatedSprints = computed(() => {
  if (!project.value || !project.value.start_date || !project.value.end_date) return [];

  const start = new Date(project.value.start_date);
  const end = new Date(project.value.end_date);
  const count = project.value.sprint_count || 1;
  const today = new Date();

  // 計算總天數並平均分配
  const totalDuration = end.getTime() - start.getTime();
  const sprintDuration = totalDuration / count;

  const sprints = [];
  for (let i = 0; i < count; i++) {
    const sStart = new Date(start.getTime() + i * sprintDuration);
    const sEnd = new Date(start.getTime() + (i + 1) * sprintDuration - 86400000); // 減去一天避免重疊

    // 判斷狀態
    let status: 'past' | 'current' | 'future' = 'future';
    if (today > sEnd) {
      status = 'past';
    } else if (today >= sStart && today <= sEnd) {
      status = 'current';
    }

    sprints.push({
      number: i + 1,
      start: sStart.toLocaleDateString(),
      end: sEnd.toLocaleDateString(),
      status: status
    });
  }
  return sprints;
});

onMounted(() => {
  fetchProjectDetail();fetchMembers();
  if (currentUserRole === 'Project Manager') {
    fetchAllUsers();
    }
});
</script>

<style scoped>

.members-section {
  margin-top: 3rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-member-tool {
  display: flex;
  gap: 10px;
}

.add-member-tool select {
  padding: 0.5rem;
  border-radius: 4px;
}

.add-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.member-role {
  font-size: 0.75rem;
  color: #7f8c8d;
}
.detail-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 3rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1.5rem;
}

.back-btn {
  background: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.project-meta {
  color: #666;
  display: flex;
  gap: 20px;
}

/* Sprint Timeline 樣式 */
.sprint-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.sprint-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 8px solid #ccc; /* 預設灰色 */
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  position: relative;
}

/* 不同狀態的顏色 */
.sprint-card.past {
  border-left-color: #95a5a6;
  opacity: 0.7;
}

.sprint-card.current {
  border-left-color: #27ae60;
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(39, 174, 96, 0.2);
  z-index: 1;
}

.sprint-card.future {
  border-left-color: #3498db;
}

.sprint-badge {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  background: #eee;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.date-range {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.current-tag {
  margin-top: 1rem;
  color: #27ae60;
  font-weight: bold;
  font-size: 0.9rem;
}
</style>