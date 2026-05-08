import Criteria from '@/pages/Criteria.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Evaluations from '@/pages/Evaluations.vue'
import Login from '@/pages/Login.vue'
import Projects from '@/pages/Projects.vue'
import Results from '@/pages/Results.vue'
import Users from '@/pages/Users.vue'
import { isSessionExpired } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true }
  },
  {
    path: '/criteria',
    name: 'Criteria',
    component: Criteria,
    meta: { requiresAuth: true }
  },
  {
    path: '/evaluations',
    name: 'Evaluations',
    component: Evaluations,
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'Results',
    component: Results,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('auth.token')
  const authenticated = !!token && !isSessionExpired()

  if (!authenticated && token) {
    // Token present but session expired — clean up
    sessionStorage.removeItem('auth.token')
    sessionStorage.removeItem('auth.user')
    sessionStorage.removeItem('auth.lastActivity')
  }

  if (to.meta.requiresAuth && !authenticated) {
    next('/login')
  } else if (to.path === '/login' && authenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router