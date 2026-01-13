<template>
  <form @submit.prevent="handleSubmit" class="user-form">
    <div class="field">
      <label for="email">Email *</label>
      <InputText
        id="email"
        v-model="formData.email"
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
        v-model="formData.username"
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
        v-model="formData.fullName"
        placeholder="Popescu Ion"
        :class="{ 'p-invalid': errors.fullName }"
      />
      <small v-if="errors.fullName" class="p-error">{{ errors.fullName }}</small>
    </div>

    <div class="field">
      <label for="password">Parolă *</label>
      <Password
        id="password"
        v-model="formData.password"
        placeholder="Minim 6 caractere"
        :feedback="true"
        toggleMask
        :class="{ 'p-invalid': errors.password }"
        required
      />
      <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
    </div>

    <div class="field">
      <label for="role">Rol *</label>
      <Select
        id="role"
        v-model="formData.role"
        :options="roles"
        optionLabel="label"
        optionValue="value"
        placeholder="Selectează rolul"
        :class="{ 'p-invalid': errors.role }"
        required
      />
      <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
    </div>

    <div class="form-actions">
      <Button
        type="button"
        label="Anulează"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        type="submit"
        label="Creează"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Button from 'primevue/button'

interface Props {
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: {
    email: string
    username: string
    fullName?: string
    password: string
    role: 'member' | 'admin'
  }]
  cancel: []
}>()

const formData = ref({
  email: '',
  username: '',
  fullName: '',
  password: '',
  role: 'member' as 'member' | 'admin'
})

const errors = ref<Partial<Record<keyof typeof formData.value, string>>>({})

const roles = [
  { label: 'Membru', value: 'member' },
  { label: 'Admin', value: 'admin' }
]

const validateForm = () => {
  errors.value = {}

  if (!formData.value.email) {
    errors.value.email = 'Email-ul este obligatoriu'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Email-ul nu este valid'
  }

  if (!formData.value.username) {
    errors.value.username = 'Username-ul este obligatoriu'
  } else if (formData.value.username.length < 3) {
    errors.value.username = 'Username-ul trebuie să aibă cel puțin 3 caractere'
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.value.username)) {
    errors.value.username = 'Username-ul poate conține doar litere, cifre și underscore'
  }

  if (!formData.value.password) {
    errors.value.password = 'Parola este obligatorie'
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Parola trebuie să aibă cel puțin 6 caractere'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  emit('submit', {
    email: formData.value.email,
    username: formData.value.username,
    fullName: formData.value.fullName || undefined,
    password: formData.value.password,
    role: formData.value.role
  })
}

onMounted(() => {
  // Reset form
  formData.value = {
    email: '',
    username: '',
    fullName: '',
    password: '',
    role: 'member'
  }
})
</script>

<style scoped>
.user-form {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>

