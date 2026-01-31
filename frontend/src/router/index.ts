import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from '../components/LoginPage.vue';
import RegisterPage from '../components/RegisterPage.vue';
import MainPage from '../components/MainPage.vue';

import SupervisorProfile from '../components/SupervisorProfile.vue';
import AdminProfile from '../components/AdminProfile.vue';
import ProjectManagerProfile from '../components/ProjectManagerProfile.vue';
import BusinessAnalystProfile from '../components/BusinessAnalystProfile.vue';
import DeveloperProfile from '../components/DeveloperProfile.vue';
import TesterProfile from '../components/TesterProfile.vue';
import UATUserProfile from '../components/UATUserProfile.vue';
import ProductOwnerProfile from '../components/ProductOwnerProfile.vue';

import AdminManageAccount from '../components/AdminManageAccount.vue';
import SupervisorManageAccount from '../components/SupervisorManageAccount.vue';
import TaskManager from '../components/TaskManager.vue';

const router = createRouter({
  history: createWebHistory(),

  routes: [
    { path: '/', name: 'Login', component: LoginPage },
    { path: '/register', name: 'Register', component: RegisterPage },
    { path: '/main', name: 'Main', component: MainPage, meta: { requiresAuth: true } },

    // 所有 path 小寫統一
    { path: '/profile/supervisor', name: 'SupervisorProfile', component: SupervisorProfile, meta: { requiresRole: 'Supervisor' } },
    { path: '/profile/admin', name: 'AdminProfile', component: AdminProfile, meta: { requiresRole: 'Admin' } },
    { path: '/profile/project-manager', name: 'ProjectManagerProfile', component: ProjectManagerProfile, meta: { requiresRole: 'Project Manager' } },
    { path: '/profile/business-analyst', name: 'BusinessAnalystProfile', component: BusinessAnalystProfile, meta: { requiresRole: 'Business Analyst' } },
    { path: '/profile/developer', name: 'DeveloperProfile', component: DeveloperProfile, meta: { requiresRole: 'Developer' } },
    { path: '/profile/tester', name: 'TesterProfile', component: TesterProfile, meta: { requiresRole: 'Tester' } },
    { path: '/profile/uat-user', name: 'UATUserProfile', component: UATUserProfile, meta: { requiresRole: 'UAT User' } },
    { path: '/profile/product-owner', name: 'ProductOwnerProfile', component: ProductOwnerProfile, meta: { requiresRole: 'Product Owner' } },

    { path: '/admin/manage-accounts', name: 'AdminManageAccounts', component: AdminManageAccount, meta: { requiresRole: 'Admin' } },
    { path: '/supervisor/manage-accounts', name: 'SupervisorManageAccounts', component: SupervisorManageAccount, meta: { requiresRole: 'Supervisor' } },
    { path: '/project-manager/taskmanager', name: 'TaskManager', component: TaskManager, meta: { requiresRole: 'Project Manager' } },

    // redirect 舊大寫 path 到新小寫 path
    { path: '/profile/Project-manager', redirect: '/profile/project-manager' },
    { path: '/profile/Product-owner', redirect: '/profile/product-owner' },
    { path: '/profile/Business-analyst', redirect: '/profile/business-analyst' },

    // 萬用 fallback
    { path: '/:catchAll(.*)', redirect: '/main' }
  ]
});

// 全局路由守衛（trim 比較 + String 解決 TS 錯誤）
router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (to.meta.requiresAuth || to.meta.requiresRole) {
    if (!token) {
      alert('請先登入');
      return next('/');
    }
  }

  if (to.meta.requiresRole) {
    const normalizedUserRole = (userRole || '').trim().toLowerCase();  // 小寫 + trim
    const normalizedRequired = String(to.meta.requiresRole || '').trim().toLowerCase();  // 小寫 + trim

    if (normalizedUserRole !== normalizedRequired && normalizedUserRole !== 'admin') {
      alert(`你沒有權限進入此頁面（需要 ${to.meta.requiresRole} 角色）`);
      return next('/main');
    }
  }

  next();
});
export default router;