<template>
  <div class="signup-container">
    <div class="signup-wrapper">
      <div class="signup-header">
        <div class="logo-section">
          <i class="pi pi-music logo-icon"></i>
          <h1 class="app-title">LaCantat</h1>
          <p class="app-subtitle">Creează-ți contul</p>
        </div>
      </div>
      <Card class="signup-card">
        <template #content>
        <form @submit.prevent="handleSignUp" class="signup-form">
          <div class="field">
            <label for="email">
              <i class="pi pi-envelope"></i>
              Email *
            </label>
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
            <label for="username">
              <i class="pi pi-user"></i>
              Username *
            </label>
            <InputText
              id="username"
              v-model="username"
              placeholder="nume_utilizator"
              :class="{ 'p-invalid': errors.username }"
              required
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

          <div class="field">
            <label for="fullName">
              <i class="pi pi-id-card"></i>
              Nume complet
            </label>
            <InputText
              id="fullName"
              v-model="fullName"
              placeholder="Popescu Ion"
              :class="{ 'p-invalid': errors.fullName }"
            />
            <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
          </div>

          <div class="field">
            <label for="password">
              <i class="pi pi-lock"></i>
              Parolă *
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="Minim 6 caractere"
              :feedback="true"
              toggleMask
              :class="{ 'p-invalid': errors.password }"
              required
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="field">
            <label for="confirmPassword">
              <i class="pi pi-lock"></i>
              Confirmă parola *
            </label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Reintrodu parola"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': errors.confirmPassword }"
              required
            />
            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
          </div>

          <div v-if="authError" class="error-message">
            <Message severity="error" :closable="false">{{ authError }}</Message>
          </div>

          <Button
            type="submit"
            label="Creează cont"
            :loading="loading"
            class="signup-button"
            icon="pi pi-user-plus"
          />

          <div class="login-link">
            <span>Ai deja cont? </span>
            <router-link to="/login">Autentifică-te</router-link>
          </div>
        </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const toast = useToast()
const { signUp, loading, error: authError } = useAuth()

const email = ref('')
const username = ref('')
const fullName = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref<{ 
  email?: string
  username?: string
  fullName?: string
  password?: string
  confirmPassword?: string
}>({})

const validateForm = () => {
  errors.value = {}

  if (!email.value) {
    errors.value.email = 'Email-ul este obligatoriu'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Email-ul nu este valid'
  }

  if (!username.value) {
    errors.value.username = 'Username-ul este obligatoriu'
  } else if (username.value.length < 3) {
    errors.value.username = 'Username-ul trebuie să aibă cel puțin 3 caractere'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    errors.value.username = 'Username-ul poate conține doar litere, cifre și underscore'
  }

  if (!password.value) {
    errors.value.password = 'Parola este obligatorie'
  } else if (password.value.length < 6) {
    errors.value.password = 'Parola trebuie să aibă cel puțin 6 caractere'
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Confirmarea parolei este obligatorie'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Parolele nu se potrivesc'
  }

  return Object.keys(errors.value).length === 0
}

const handleSignUp = async () => {
  if (!validateForm()) {
    return
  }

  // Request-ul a fost trimis - apelăm signUp
  await signUp(
    email.value,
    password.value,
    username.value,
    fullName.value || undefined,
    'member' // Toți utilizatorii noi sunt membri
  )

  // După ce request-ul a fost trimis, facem redirect la login
  // Chiar dacă există erori (ex: email confirmation necesară), utilizatorul va vedea mesajul pe login
  toast.add({
    severity: 'success',
    summary: 'Cont creat',
    detail: 'Te rugăm să verifici emailul pentru a confirma contul. Apoi te poți autentifica.',
    life: 5000
  })

  router.push('/login')
}
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, rgba(99, 102, 241, 0.8) 100%);
  position: relative;
  overflow: hidden;
}

.signup-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 20s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.signup-wrapper {
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  color: var(--text-color);
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  display: block;
  animation: float 3s ease-in-out infinite;
  color: var(--text-color);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: var(--text-color);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
  color: var(--text-color-secondary);
}

.signup-card {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  background: var(--surface-card);
  border: none;
}

.signup-card :deep(.p-card-body) {
  padding: 2rem;
}

.signup-card :deep(.p-card-content) {
  padding: 0;
}

.signup-form {
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
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.field label i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.field :deep(.p-inputtext),
.field :deep(.p-password input) {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--surface-border);
  transition: all 0.2s;
  font-size: 1rem;
}

.field :deep(.p-inputtext:focus),
.field :deep(.p-password input:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.2);
  outline: none;
}

.field :deep(.p-password) {
  width: 100%;
}

.field :deep(.p-password-panel) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-message {
  margin-top: 0.5rem;
}

.signup-button {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.signup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
  color: var(--text-color-secondary);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.login-link a:hover {
  text-decoration: underline;
  color: var(--primary-color);
  opacity: 0.8;
}

@media (min-width: 768px) {
  .signup-container {
    padding: 2rem;
  }

  .signup-card :deep(.p-card-body) {
    padding: 2.5rem;
  }
}

@media (max-width: 600px) {
  .signup-container {
    padding: 0.5rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .logo-icon {
    font-size: 2.5rem;
  }
}
</style>

