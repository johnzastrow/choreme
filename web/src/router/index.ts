import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/views/LayoutView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue')
        },
        {
          path: 'account',
          name: 'account',
          component: () => import('@/views/AccountView.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: { requiresManager: true }
        },
        {
          path: 'chores',
          name: 'chores',
          component: () => import('@/views/ChoresView.vue')
        },
        {
          path: 'rewards',
          name: 'rewards',
          component: () => import('@/views/RewardsView.vue')
        },
        {
          path: 'transfers',
          name: 'transfers',
          component: () => import('@/views/TransfersView.vue')
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Try to fetch current user if token exists
      const token = localStorage.getItem('auth_token')
      if (token) {
        const success = await authStore.fetchCurrentUser()
        if (!success) {
          next({ name: 'login' })
          return
        }
      } else {
        next({ name: 'login' })
        return
      }
    }

    // Check if route requires manager role
    if (to.meta.requiresManager && !authStore.isManager) {
      next({ name: 'dashboard' })
      return
    }
  }

  // Redirect to dashboard if already authenticated and trying to access login/register
  if (!to.meta.requiresAuth && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
