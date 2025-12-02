import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Projects from '@/pages/Projects.vue'
import Criteria from '@/pages/Criteria.vue'
import Evaluations from '@/pages/Evaluations.vue'
import Results from '@/pages/Results.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router