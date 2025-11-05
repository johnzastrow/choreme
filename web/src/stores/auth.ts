import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { User, LoginRequest, RegisterRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() =>
    user.value?.role === 'system_admin' ||
    user.value?.role === 'admin'
  )
  const isManager = computed(() =>
    user.value?.role === 'system_admin' ||
    user.value?.role === 'admin' ||
    user.value?.role === 'manager'
  )
  const isWorker = computed(() => user.value?.role === 'worker')

  async function login(credentials: LoginRequest) {
    try {
      loading.value = true
      error.value = null
      const response = await api.login(credentials)
      user.value = response.user
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    try {
      loading.value = true
      error.value = null
      const response = await api.register(data)
      user.value = response.user
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    try {
      loading.value = true
      user.value = await api.getCurrentUser()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch user'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    api.logout()
    user.value = null
  }

  async function updateProfile(data: Partial<User>) {
    try {
      loading.value = true
      error.value = null
      user.value = await api.updateCurrentUser(data)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Profile update failed'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    isWorker,
    login,
    register,
    fetchCurrentUser,
    logout,
    updateProfile,
  }
})
