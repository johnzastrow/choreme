<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Try to restore auth state if token exists
  const token = localStorage.getItem('auth_token')
  if (token && !authStore.isAuthenticated) {
    await authStore.fetchCurrentUser()
  }
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
