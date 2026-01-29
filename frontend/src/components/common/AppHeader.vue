<!-- src/components/common/AppHeader.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const userRole = ref('')

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
    { label: 'Manage Task', path: '/taskManager' },
    { label: 'Manage Project', path: '/project-manager/ProjectManager' },

  ],
  'Business Analyst': [
    { label: 'My Profile', path: '/profile/business-analyst' },
    { label: 'Requirements', path: '/business-analyst/requirements' },
    { label: 'User Stories', path: '/business-analyst/stories' },
    { label: 'Current Sprint', path: '/business-analyst/current-sprint' },
    { label: 'My Tasks', path: '/business-analyst/my-tasks' },

  ],
  'Developer': [
    { label: 'My Profile', path: '/profile/developer' },
    { label: 'My Tasks', path: '/developer/my-tasks' },
    { label: 'Current Sprint', path: '/developer/current-sprint' },
    { label: 'My Team', path: '/developer/my-team' },
  
  ],
  'Tester': [
    { label: 'My Profile', path: '/profile/tester' },
    { label: 'Test Cases', path: '/tester/test-cases' },
    { label: 'Current Sprint Tasks', path: '/tester/current-sprint-tasks' },
    { label: 'Submit Bug', path: '/tester/bug-report' },
    { label: 'My Team', path: '/tester/my-team' },
   
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

// 監聽 localStorage 變化
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user' || event.key === 'userRole' || event.key === 'token') {
    updateUserInfo()
  }
}

onMounted(() => {
  updateUserInfo()
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <header v-if="userRole">
    <h1>Agile Dashboard</h1>

    <nav class="main-nav">
      <!-- 所有角色共用的 Dashboard -->
      <router-link to="/main" class="nav-item">Dashboard</router-link>

      <!-- 角色專屬 + 共用項目 -->
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
