<!-- src/components/common/AppHeader.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const userRole = ref('')

// 定義每個角色的導航選項（可自行擴充）
const navItemsByRole = {
  Admin: [
    { label: 'My Profile', path: '/profile/admin' },
    { label: 'Manage Accounts', path: '/admin/manage-accounts' },
    { label: 'All Projects', path: '/projects' },
    { label: 'All Sprints', path: '/admin/sprints' },
    { label: 'All Tasks', path: '/admin/tasks' },
    { label: 'All Teams', path: '/admin/teams' },
  ],
  Supervisor: [
    { label: 'My Profile', path: '/profile/supervisor' },
    { label: 'Manage Accounts', path: '/supervisor/manage-accounts' },
    { label: 'Manage Sprints', path: '/supervisor/sprints' },
    { label: 'Team Tasks', path: '/supervisor/team-tasks' },
    { label: 'My Teams', path: '/supervisor/teams' },
  ],
  'Product Manager': [
    { label: 'My Profile', path: '/profile/product-manager' },
    { label: 'Current Sprint', path: '/product-manager/current-sprint' },
    { label: 'Manage Task', path: '/product-manager/taskManager' },
    { label: 'Manage Project', path: '/product-manager/ProjectManager' }
  ],
  'Business Analyst': [
    { label: 'My Profile', path: '/profile/business-analyst' },
    { label: 'Requirements', path: '/business-analyst/requirements' },
    { label: 'User Stories', path: '/business-analyst/stories' },
    { label: 'Current Sprint', path: '/business-analyst/current-sprint' },
    { label: 'My Tasks', path: '/business-analyst/my-tasks' }
  ],
  Developer: [
    { label: 'My Profile', path: '/profile/developer' },
    { label: 'My Tasks', path: '/developer/my-tasks' },
    { label: 'Current Sprint', path: '/developer/current-sprint' },
    { label: 'My Team', path: '/developer/my-team' }
  ],
  Tester: [
    { label: 'My Profile', path: '/profile/tester' },
    { label: 'Test Cases', path: '/tester/test-cases' },
    { label: 'Current Sprint Tasks', path: '/tester/current-sprint-tasks' },
    { label: 'Submit Bug', path: '/tester/bug-report' },
    { label: 'My Team', path: '/tester/my-team' }
  ],
  'UAT User': [
    { label: 'My Profile', path: '/profile/uat-user' },
    { label: 'My UAT Tests', path: '/uat/my-tests' },
    { label: 'Current Sprint', path: '/uat/current-sprint' },
    { label: 'Feedback', path: '/uat/feedback' }
  ],
  'Product Owner': [
    { label: 'My Profile', path: '/profile/product-owner' },
    { label: 'User Stories', path: '/product-owner/stories' },
    { label: 'Priorities', path: '/product-owner/priorities' },
    { label: 'Current Sprint', path: '/product-owner/current-sprint' }
  ]
} as const; // 讓 TypeScript 知道鍵是字面值，避免索引錯誤

// 更新使用者資訊的函式（從 localStorage 讀取）
const updateUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    userName.value = user.name || 'User'
    userRole.value = user.role?.trim() || ''
  } else {
    userName.value = ''
    userRole.value = ''
  }
}

// 登出
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('user')
  router.push('/')
}

// 監聽 localStorage 變化（登入/登出時即時更新）
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user' || event.key === 'userRole' || event.key === 'token') {
    updateUserInfo()
  }
}

onMounted(() => {
  updateUserInfo()  // 初始載入
  window.addEventListener('storage', handleStorageChange)  // 監聽變化
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)  // 清除監聽
})
</script>

<template>
  <header v-if="userRole">
    <h1>Agile Dashboard</h1>

    <nav class="main-nav">
      <!-- 所有角色共用的選項 -->
      <router-link to="/main" class="nav-item">Dashboard</router-link>

      <!-- 根據角色顯示專屬選項 -->
      <router-link
        v-for="item in navItemsByRole[userRole as keyof typeof navItemsByRole] || []"
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="user-info">
      <span v-if="userName">Welcome, {{ userName }}</span>
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
  gap: 1rem;
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
</style>