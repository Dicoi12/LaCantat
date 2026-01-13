<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>Autentificare</template>
      <template #content>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label for="email">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="email@example.com"
              :class="{ 'p-invalid': errors.email }"
              required
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="field">
            <label for="password">Parolă</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Parola ta"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': errors.password }"
              required
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div v-if="authError" class="error-message">
            <Message severity="error" :closable="false">{{ authError }}</Message>
          </div>

          <Button
            type="submit"
            label="Autentificare"
            :loading="loading"
            class="login-button"
          />

          <div class="signup-link">
            <span>Nu ai cont? </span>
            <router-link to="/signup">Creează cont</router-link>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const { signIn, loading, error: authError } = useAuth()

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string }>({})

const validateForm = () => {
  errors.value = {}

  if (!email.value) {
    errors.value.email = 'Email-ul este obligatoriu'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Email-ul nu este valid'
  }

  if (!password.value) {
    errors.value.password = 'Parola este obligatorie'
  } else if (password.value.length < 6) {
    errors.value.password = 'Parola trebuie să aibă cel puțin 6 caractere'
  }

  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  const success = await signIn(email.value, password.value)

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

@media (min-width: 768px) {
  .login-container {
    padding: 2rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
}

.error-message {
  margin-top: 0.5rem;
}

.login-button {
  width: 100%;
  margin-top: 0.5rem;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.signup-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>

