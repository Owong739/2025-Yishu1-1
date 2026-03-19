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
import ProjectOwnerProfile from '../components/ProjectOwnerProfile.vue';

import AdminManageAccount from '../components/AdminManageAccount.vue';
import SupervisorManageAccount from '../components/SupervisorManageAccount.vue';
import TaskManager from '../components/TaskManager.vue';

const router = createRouter({
  history: createWebHistory(),

  routes: [
     // UPDATED ROUTE: Allow multiple roles
    { 
      path: '/task-manager', 
      name: 'TaskManager', 
      component: () => import('../components/TaskManager.vue'), 
      meta: { 
        requiresAuth: true,
          meta: { allowedRoles: ['Project Manager', 'Business Analyst', 'Developer', 'Tester', 'UAT User'] } 
      } 
    },
    { path: '/', name: 'Login', component: LoginPage },
    { path: '/register', name: 'Register', component: RegisterPage },
    { path: '/main', name: 'Main', component: MainPage, meta: { requiresAuth: true } },
    { path: '/project/:id', name: 'ProjectDetail', component: () => import('../components/ProjectDetail.vue')},
    { path: '/profile/supervisor', name: 'SupervisorProfile', component: SupervisorProfile, meta: { requiresRole: 'Supervisor' } },
    { path: '/profile/admin', name: 'AdminProfile', component: AdminProfile, meta: { requiresRole: 'Admin' } },
    { path: '/profile/Project-manager', name: 'ProjectManagerProfile', component: ProjectManagerProfile, meta: { requiresRole: 'Project Manager' } },
    { path: '/profile/business-analyst', name: 'BusinessAnalystProfile', component: BusinessAnalystProfile, meta: { requiresRole: 'Business Analyst' } },
    { path: '/profile/developer', name: 'DeveloperProfile', component: DeveloperProfile, meta: { requiresRole: 'Developer' } },
    { path: '/profile/tester', name: 'TesterProfile', component: TesterProfile, meta: { requiresRole: 'Tester' } },
    { path: '/profile/uat-user', name: 'UATUserProfile', component: UATUserProfile, meta: { requiresRole: 'UAT User' } },
    { path: '/profile/Project-owner', name: 'ProjectOwnerProfile', component: ProjectOwnerProfile, meta: { requiresRole: 'Project Owner' } },

    { path: '/admin/manage-accounts', name: 'AdminManageAccounts', component: AdminManageAccount, meta: { requiresRole: 'Admin' } },

    { path: '/supervisor/manage-accounts', name: 'SupervisorManageAccounts', component: SupervisorManageAccount, meta: { requiresRole: 'Supervisor' } },

    //{ path: '/project-manager/taskManager', name: 'TaskManager', component: TaskManager, meta: { requiresRole: 'Project Manager' } }
  ]
});

// 全局路由守衛（根據 role 控制存取）
router.beforeEach((to, _, next) => {  // ← 用 _ 忽略 from 參數
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (to.meta.requiresAuth || to.meta.requiresRole) {
    if (!token) {
      alert('請先登入');
      return next('/');
    }
  }

  //Check Role Array (For Task Manager)
  if (to.meta.allowedRoles) {
    const allowed = to.meta.allowedRoles as string[];
    if (!allowed.includes(userRole || '') && userRole !== 'Admin') {
      alert(`你沒有權限進入此頁面`);
      return next('/main');
    }
  }
  
  if (to.meta.requiresRole) {
    if (userRole !== to.meta.requiresRole && userRole !== 'Admin') {
      alert(`你沒有權限進入此頁面（需要 ${to.meta.requiresRole} 角色）`);
      return next('/main');
    }
  }

  next();
});

export default router;