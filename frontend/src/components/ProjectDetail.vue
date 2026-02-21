<template>
  <div class="detail-container" v-if="project">
    <!-- Header 部分 -->

    <div class="header-section">
      <div class="header-top">
        <button @click="$router.back()" class="back-btn">← Back</button>
        
        <!-- 只有具備權限的人才看得到編輯按鈕 -->
        <button v-if="canEdit && !isEditing" @click="startEdit" class="edit-btn">
           Edit Project
        </button>
      </div>

      <!-- 顯示模式 -->
      <div v-if="!isEditing">
        <h1>{{ project.name }}</h1>
        <p class="desc">{{ project.description }}</p>
        <div class="project-meta">
          <span>📅 {{ project.start_date }} 至 {{ project.end_date }}</span>
          <span>🔄 Sprints: {{ project.sprint_count }}</span>
          <span>👥 Manager: {{ project.project_manager }}</span>
        </div>
      </div>

      <!-- 編輯模式 -->
      <div v-else class="edit-form-container">
        <div class="form-group">
          <label>Project Name:</label>

          <input v-model="editForm.name" />
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea v-model="editForm.description"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date:</label>
            <input type="date" v-model="editForm.start_date" />
          </div>
          <div class="form-group">
            <label>End Date:</label>
            <input type="date" v-model="editForm.end_date" />
          </div>
        </div>
        <div class="form-group">
          <label>Sprint Count:</label>
          <input type="number" v-model="editForm.sprint_count" />
        </div>

        <div class="form-group">
          <label>Project Manager:</label> <!-- Label 要在外面 -->

          <!-- 情況 A: 如果是 Admin，顯示下拉選單 -->
          <select v-if="isAdmin" v-model="editForm.project_manager">
            <option disabled value="">Select a Manager</option>
            <option v-for="pm in pmOptions" :key="pm.id" :value="pm.name">
              {{ pm.name }} ({{ pm.role }})
            </option>
          </select>

          <!-- 情況 B: 如果是 PM，只顯示名字 -->
          <div v-else class="readonly-field">
            {{ editForm.project_manager }} 
            <span class="lock-icon">🔒 (Only Admin can change)</span>
          </div>
        </div>
        
        <div class="edit-actions">
          <button @click="updateProject" class="save-btn">Save Changes</button>
          <button @click="isEditing = false" class="cancel-btn">Cancel</button>
        </div>
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
          
          <!-- 只有 PM 或 Admin 可以刪除人，且不能刪除自己（可選） -->
          <button 
            v-if="canEdit" 
            @click="confirmDeleteMember(member)" 
            class="delete-member-btn"
            title="Remove Member"
          >
            ×
          </button>
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Confirm Removal</h3>
          <p>Are you sure you want to remove <strong>{{ memberToDelete?.name }}</strong> from this project?</p>
          <div class="modal-actions">
            <button @click="executeDelete" class="confirm-del-btn">Remove</button>
            <button @click="showDeleteModal = false" class="cancel-del-btn">Cancel</button>
          </div>
        </div>
      </div>

      <div class="chat-section">
      <h2>Project Chat</h2>
      <div class="chat-window" ref="chatWindow">
        <div v-for="msg in messages" :key="msg.id" 
             :class="['message-bubble', msg.user_id === currentUser.id ? 'my-msg' : 'others-msg']">
          <div class="msg-info">
            <strong>{{ msg.user_name }}</strong> 
            <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <p>{{ msg.message }}</p>
        </div>
      </div>
      
      <div class="chat-input">
        <input v-model="newMessage" @keyup.enter="sendChat" placeholder="Type a message..." />
        <button @click="sendChat">Send</button>
      </div>
    </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick  } from 'vue';
import { io } from 'socket.io-client';
import { useRoute } from 'vue-router';
import axios from 'axios';


const socket = io('http://localhost:3000');
const messages = ref<any[]>([]);
const newMessage = ref('');
const chatWindow = ref<HTMLElement | null>(null);

const route = useRoute();
const project = ref<any>(null);
const members = ref<any[]>([]);
const allUsers = ref<any[]>([]);
const selectedUserId = ref('');

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const currentUserRole = currentUser.role;

const isEditing = ref(false);
const isAdmin = computed(() => currentUserRole === 'Admin');

const showDeleteModal = ref(false);
const memberToDelete = ref<any>(null);

// 1. 彈出確認視窗
const confirmDeleteMember = (member: any) => {
  memberToDelete.value = member;
  showDeleteModal.value = true;
};

// 2. 執行刪除
const executeDelete = async () => {
  if (!memberToDelete.value) return;
  
  try {
    const projectId = route.params.id;
    const userId = memberToDelete.value.id;
    
    await axios.delete(`http://localhost:3000/api/projects/${projectId}/members/${userId}`);
    
    // 重新整理列表
    await fetchMembers();
    showDeleteModal.value = false;
    memberToDelete.value = null;
    
  } catch (error) {
    console.error('Delete member error:', error);
    alert('Failed to remove member');
  }
};

const editForm = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  sprint_count: 0,
  project_manager: ''
});

// 過濾出所有角色為 'Project Manager' 的用戶，供 Admin 選擇
const pmOptions = computed(() => {
  return allUsers.value.filter(u => u.role === 'Project Manager' || u.role === 'Admin');
});

// 修改啟動編輯的邏輯
const startEdit = async () => {
  editForm.value = { ...project.value };
  
  // 如果是 Admin 在編輯，確保有拿到最新的用戶列表來填充下拉選單
  if (isAdmin.value) {
    await fetchAllUsers(); 
  }
  
  isEditing.value = true;
};

// 權限判斷：是否可以編輯
const canEdit = computed(() => {
  return currentUserRole === 'Admin' || currentUserRole === 'Project Manager';
});

// 儲存更新
const updateProject = async () => {
  try {
    const id = route.params.id;
    
    // 這裡要展開 editForm，並補上 userRole
    const payload = {
      ...editForm.value,
      userRole: currentUserRole // 這行非常重要！
    };

    console.log("發送的修改資料:", payload); // 除錯用

    await axios.put(`http://localhost:3000/api/projects/${id}`, payload);
    
    await fetchProjectDetail();
    isEditing.value = false;
    alert('Project updated!');
  } catch (error: any) {
    console.error('Update Error:', error.response?.data);
    alert(error.response?.data?.message || 'Error updating project');
  }
};

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

const scrollToBottom = async () => {
  await nextTick();
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

const fetchMessages = async () => {
  const id = route.params.id;
  const res = await axios.get(`http://localhost:3000/api/projects/${id}/messages`);
  messages.value = res.data.data;
  scrollToBottom();
};

const sendChat = () => {
  if (!newMessage.value.trim()) return;

  const chatData = {
    project_id: route.params.id,
    user_id: currentUser.id,
    user_name: currentUser.name,
    message: newMessage.value
  };

  socket.emit('sendMessage', chatData);
  newMessage.value = '';
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchProjectDetail();
  fetchMembers();
  fetchMessages();

  socket.emit('joinProject', route.params.id);
  
  socket.on('receiveMessage', (msg) => {
    messages.value.push(msg);
    scrollToBottom();
  });
  if (currentUserRole === 'Admin' || currentUserRole === 'Project Manager') {
    fetchAllUsers();
  }
});

onUnmounted(() => {
  socket.disconnect(); // 離開頁面時斷開連接
});
</script>

<style scoped>

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.edit-form-container {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.edit-form-container .form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.edit-form-container input, 
.edit-form-container textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.save-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.readonly-field {
  padding: 0.6rem;
  background: #eee;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
  border: 1px solid #ccc;
}

.lock-icon {
  font-size: 0.8rem;
  color: #999;
  margin-left: 10px;
}

select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

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

.chat-section {
  margin-top: 3rem;
  background: #fdfdfd;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;
}
.chat-window {
  height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.message-bubble {
  max-width: 70%;
  padding: 0.8rem;
  border-radius: 12px;
}
.my-msg {
  align-self: flex-end;
  background: #e3f2fd;
  border-bottom-right-radius: 2px;
}
.others-msg {
  align-self: flex-start;
  background: #f5f5f5;
  border-bottom-left-radius: 2px;
}
.msg-info {
  font-size: 0.75rem;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.msg-time { color: #999; }
.chat-input {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.chat-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.chat-input button {
  padding: 0 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.member-item {
  position: relative; /* 方便定位刪除按鈕 */
  padding-right: 2.5rem; /* 留位置給按鈕 */
}

.delete-member-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #ff4d4f;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-member-btn:hover {
  opacity: 1;
}

/* Modal 樣式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-del-btn {
  flex: 1;
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-del-btn {
  flex: 1;
  background: #ccc;
  border: none;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>