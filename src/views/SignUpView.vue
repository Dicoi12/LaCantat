<template>
  <div class="signup-container">
    <Card class="signup-card">
      <template #title>Creare cont</template>
      <template #content>
        <form @submit.prevent="handleSignUp" class="signup-form">
          <div class="field">
            <label for="email">Email *</label>
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
            <label for="username">Username *</label>
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
            <label for="fullName">Nume complet</label>
            <InputText
              id="fullName"
              v-model="fullName"
              placeholder="Popescu Ion"
              :class="{ 'p-invalid': errors.fullName }"
            />
            <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
          </div>

          <div class="field">
            <label for="password">Parolă *</label>
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
            <label for="confirmPassword">Confirmă parola *</label>
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
          />

          <div class="login-link">
            <span>Ai deja cont? </span>
            <router-link to="/login">Autentifică-te</router-link>
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

  const success = await signUp(
    email.value,
    password.value,
    username.value,
    fullName.value || undefined,
    'member' // Toți utilizatorii noi sunt membri
  )

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.signup-card {
  width: 100%;
  max-width: 450px;
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
  font-weight: 500;
}

.error-message {
  margin-top: 0.5rem;
}

.signup-button {
  width: 100%;
  margin-top: 0.5rem;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .signup-container {
    padding: 0.5rem;
  }
}
</style>

