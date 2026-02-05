<!-- frontend/src/App.vue -->
<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router' // 1. 引入路由工具

// 2. 初始化路由
const route = useRoute()

// --- 👇 组员原本的逻辑 (保持不变) 👇 ---

// 登入狀態 (有 token 就視為登入)
const isLoggedIn = ref(!!localStorage.getItem('token'))

// 更新登入狀態的函式
const updateLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// 監聽其他分頁的 storage 變化 (跨分頁同步登入狀態)
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'token') {
    updateLoginStatus()
  }
}

onMounted(() => {
  updateLoginStatus() // 頁面載入時檢查一次
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  // 清除定時器 (如果有)
})

// 可選: 每 5 秒檢查一次 (防某些瀏覽器不觸發 storage 事件，較保險)
const checkInterval = setInterval(updateLoginStatus, 5000)

onUnmounted(() => {
  clearInterval(checkInterval)
})

// --- 👆 组员原本的逻辑结束 👆 ---


// --- 👇 我们新增的逻辑 (修复层级问题) 👇 ---

// 计算属性：决定是否真正显示 Header
const shouldShowHeader = computed(() => {
  // 1. 如果没登录，肯定不显示
  if (!isLoggedIn.value) return false
  
  // 2. 如果已登录，但当前在 登录页(/) 或 注册页(/register)，也不显示
  // (根据你的截图，根目录 '/' 就是登录页)
  const hidePaths = ['/', '/login', '/register']
  if (hidePaths.includes(route.path)) {
    return false
  }
  
  // 其他情况显示
  return true
})
</script>

<template>
  <!-- 只有当应该显示时，才渲染导航列 -->
  <!-- 修改点：把 v-if="isLoggedIn" 改成了 v-if="shouldShowHeader" -->
  <AppHeader v-if="shouldShowHeader" />

  <!-- 頁面內容 -->
  <router-view />
</template>

<style>
/* 全局重置樣式 */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f5f7;
}

/* 避免導航列蓋住內容 */
main,
.profile-page,
.manage-page {
  margin-top: 80px; /* 根據你的 AppHeader 高度調整 */
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>