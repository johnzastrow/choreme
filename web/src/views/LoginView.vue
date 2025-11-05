<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12" rounded="lg">
          <v-card-title class="text-h4 text-center pa-6 primary white--text">
            <v-icon left size="large" color="white">mdi-home-heart</v-icon>
            ChoreMe
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                required
                :error-messages="emailError"
              />

              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                required
                :error-messages="passwordError"
                class="mt-4"
              />

              <v-alert
                v-if="authStore.error"
                type="error"
                class="mt-4"
                closable
                @click:close="authStore.error = null"
              >
                {{ authStore.error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mt-6"
                :loading="authStore.loading"
              >
                Log In
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <span class="text-body-2">Don't have an account?</span>
            <v-btn
              color="primary"
              variant="text"
              :to="{ name: 'register' }"
            >
              Sign Up
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

async function handleLogin() {
  // Reset errors
  emailError.value = ''
  passwordError.value = ''

  // Validate
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
