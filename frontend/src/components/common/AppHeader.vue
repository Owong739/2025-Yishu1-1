<!-- src/components/common/AppHeader.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client';
import axios from 'axios';

interface NotificationItem {
  id: number;
  user_id: number;
  message: string;
  is_read: number;
  created_at: string;
}

const router = useRouter()
const userName = ref('')
const userRole = ref('')
const socket = io('http://localhost:3000');
const notifications = ref<NotificationItem[]>([]);
const unreadCount = ref(0);
const showNoti = ref(false);

const userStr = localStorage.getItem('user');
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

// 共用導航項目（所有角色都會看到）
const commonNavItems = [
  
]

// 定義每個角色的專屬導航選項
const navItemsByRole = {
  'Admin': [
    { label: 'My Profile', path: '/profile/admin' },
    { label: 'Manage Accounts', path: '/admin/manage-accounts' },
    { label: 'All Projects', path: '/projects' },
    { label: 'All Sprints', path: '/admin/sprints' },
    { label: 'All Tasks', path: '/admin/tasks' },
    { label: 'All Teams', path: '/admin/teams' },
    
  ],
  'Supervisor': [
    { label: 'My Profile', path: '/profile/supervisor' },
    { label: 'Manage Accounts', path: '/supervisor/manage-accounts' },
    { label: 'Manage Sprints', path: '/supervisor/sprints' },
    { label: 'Team Tasks', path: '/supervisor/team-tasks' },
    { label: 'My Teams', path: '/supervisor/teams' },
   
  ],
  'Project Manager': [
    { label: 'My Profile', path: '/profile/project-manager' },
    { label: 'Current Sprint', path: '/project-manager/current-sprint' },
    //{ label: 'Manage Task', path: '/project-manager/taskManager' },
    { label: 'Manage Task', path: '/task-manager' },
    { label: 'Manage Project', path: '/project-manager/ProjectManager' },
    //  Lucas的 programme tracking  👇👇👇 //
    { label: 'Programme Tracking', path: '/dashboard.html' },
  ],
  'Business Analyst': [
    { label: 'My Profile', path: '/profile/business-analyst' },
    { label: 'Requirements', path: '/business-analyst/requirements' },
    { label: 'User Stories', path: '/business-analyst/stories' },
    { label: 'Current Sprint', path: '/business-analyst/current-sprint' },
    { label: 'My Tasks', path: '/business-analyst/my-tasks' },
    { label: 'Manage Task', path: '/task-manager' },
   
  ],
  'Developer': [
    { label: 'My Profile', path: '/profile/developer' },
    { label: 'My Tasks', path: '/developer/my-tasks' },
    { label: 'Current Sprint', path: '/developer/current-sprint' },
    { label: 'My Team', path: '/developer/my-team' },
    { label: 'Manage Task', path: '/task-manager' },
  ],
  'Tester': [
    { label: 'My Profile', path: '/profile/tester' },
    { label: 'Test Cases', path: '/tester/test-cases' },
    { label: 'Current Sprint Tasks', path: '/tester/current-sprint-tasks' },
    { label: 'Submit Bug', path: '/tester/bug-report' },
    { label: 'My Team', path: '/tester/my-team' },
    { label: 'Manage Task', path: '/task-manager' },
   
  ],
  'UAT User': [
    { label: 'My Profile', path: '/profile/uat-user' },
    { label: 'My UAT Tests', path: '/uat/my-tests' },
    { label: 'Current Sprint', path: '/uat/current-sprint' },
    { label: 'Feedback', path: '/uat/feedback' },
    
  ],
  'Product Owner': [
    { label: 'My Profile', path: '/profile/product-owner' },
    { label: 'User Stories', path: '/product-owner/stories' },
    { label: 'Priorities', path: '/product-owner/priorities' },
    { label: 'Current Sprint', path: '/product-owner/current-sprint' },
    
  ]
} as const

// 更新使用者資訊
const updateUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    userName.value = user.name || 'User'
    userRole.value = user.role?.trim() || ''
    return user; 
  }
  return null;
}

// 獲取歷史通知
const fetchNotifications = async (userId: number) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
    notifications.value = res.data.data;
    // 計算未讀數量 (假設 is_read 為 0 是未讀)
    unreadCount.value = notifications.value.filter(n => n.is_read === 0).length;
  } catch (err) {
    console.error('Fetch notifications error:', err);
  }
}

const toggleNoti = () => {
  showNoti.value = !showNoti.value;
  if (showNoti.value) {
    unreadCount.value = 0; // 點開鈴鐺後清除未讀計數
  }
}

// 登出
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('user')
  router.push('/')
}

// 監聽 localStorage 變化
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user' || event.key === 'userRole' || event.key === 'token') {
    updateUserInfo()
  }
}

onMounted(() => {
  const currentUser = updateUserInfo();
  window.addEventListener('storage', updateUserInfo);

  if (currentUser && currentUser.id) {
    console.log('User ID for Socket:', currentUser.id);
    
    // A. 抓取舊的通知
    fetchNotifications(currentUser.id);

    // B. Socket 加入個人房間
    socket.emit('joinSelf', currentUser.id);

    // C. 監聽即時通知
    socket.on('newNotification', (data: NotificationItem) => {
      console.log('收到即時通知:', data);
      notifications.value.unshift(data);
      unreadCount.value++;
      // alert('New Notification: ' + data.message);
    });
  }
});


onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  socket.disconnect();
})

</script>

<template>
  <header v-if="userRole">
    <h1>Agile Dashboard</h1>

    <nav class="main-nav">
      <!-- 1. 所有角色共用的 Dashboard -->
      <router-link to="/main" class="nav-item">Dashboard</router-link>

      <!-- 2. 角色專屬導航 -->
      <template v-for="item in navItemsByRole[userRole as keyof typeof navItemsByRole] || []" :key="item.path">
        <a v-if="item.path.includes('.html')" :href="item.path" class="nav-item">
          {{ item.label }}
        </a>
        <router-link v-else :to="item.path" class="nav-item">
          {{ item.label }}
        </router-link>
      </template>
    </nav>

    <!-- 右側資訊區塊 -->
    <div class="user-info">
      <!-- A. 歡迎字樣 -->
      <span v-if="userName">Welcome, {{ userName }}</span>

      <!-- B. 通知圖標 (移到這裡) -->
      <div class="noti-wrapper">
        <span class="bell-icon" @click="toggleNoti">
          🔔 <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </span>
        
        <!-- 下拉清單 -->
        <div v-if="showNoti" class="noti-dropdown">
          <div v-for="n in notifications" :key="n.id" class="noti-item">
            {{ n.message }}
          </div>
          <div v-if="notifications.length === 0" class="noti-item">No notifications</div>
        </div>
      </div>

      <!-- C. 登出按鈕 -->
      <button @click="logout" class="logout-btn">Logout</button>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logout-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.noti-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.badge {
  background: red; color: white; border-radius: 50%;
  padding: 2px 6px; font-size: 10px; position: absolute; top: -5px; right: -5px;
}
.noti-dropdown {
  position: absolute;
  right: 0;          
  top: 40px;        
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  color: #333;       
  border-radius: 4px;
}

.noti-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  line-height: 1.4;
}
</style>
