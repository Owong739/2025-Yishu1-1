<!-- frontend/src/App.vue -->
<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import { ref, onMounted, onUnmounted } from 'vue'

// 登入狀態（有 token 就視為已登入）
const isLoggedIn = ref(!!localStorage.getItem('token'))

// 更新登入狀態的函式
const updateLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// 監聽其他分頁的 storage 變化（跨分頁同步登入狀態）
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'token') {
    updateLoginStatus()
  }
}

onMounted(() => {
  updateLoginStatus()  // 頁面載入時檢查一次
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  // 清除定時器（如果有）
})

// 可選：每 5 秒檢查一次（防某些瀏覽器不觸發 storage 事件，較保險）
const checkInterval = setInterval(updateLoginStatus, 5000)

onUnmounted(() => {
  clearInterval(checkInterval)
})
</script>

<template>
  <!-- 只有登入後才顯示導航列 -->
  <AppHeader v-if="isLoggedIn" />

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