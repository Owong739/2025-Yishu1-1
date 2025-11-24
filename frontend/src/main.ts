// frontend/src/main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 引入 router

createApp(App).use(router).mount('#app')