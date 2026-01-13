<template>
  <div class="users-view">
    <Card>
      <template #title>
        <div class="card-header">
          <span>Gestionare utilizatori</span>
          <Button
            label="Adaugă utilizator"
            icon="pi pi-user-plus"
            @click="showUserDialog = true"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="users"
          :loading="usersLoading"
          :paginator="true"
          :rows="10"
          stripedRows
          responsiveLayout="scroll"
        >
          <Column field="username" header="Username" sortable />
          <Column field="full_name" header="Nume complet" sortable />
          <Column field="role" header="Rol">
            <template #body="{ data }">
              <Tag :value="data.role === 'admin' ? 'Admin' : 'Membru'" :severity="data.role === 'admin' ? 'danger' : 'info'" />
            </template>
          </Column>
          <Column field="created_at" header="Creat la" sortable>
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column header="Acțiuni" :exportable="false">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                @click="editUserRole(data)"
                v-tooltip.top="'Editează rolul'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog pentru adăugare utilizator -->
    <Dialog
      v-model:visible="showUserDialog"
      header="Adaugă utilizator nou"
      :modal="true"
      :style="{ width: '90%', maxWidth: '500px' }"
    >
      <UserForm
        v-if="showUserDialog"
        :loading="creatingUser"
        @submit="handleUserSubmit"
        @cancel="showUserDialog = false"
      />
    </Dialog>

    <!-- Dialog pentru editare rol -->
    <Dialog
      v-model:visible="showEditRoleDialog"
      header="Editează rolul utilizatorului"
      :modal="true"
      :style="{ width: '90%', maxWidth: '400px' }"
    >
      <div v-if="editingUser" class="edit-role-form">
        <div class="user-info">
          <p><strong>Username:</strong> {{ editingUser.username }}</p>
          <p v-if="editingUser.full_name"><strong>Nume:</strong> {{ editingUser.full_name }}</p>
        </div>
        <div class="field">
          <label for="role">Rol *</label>
          <Select
            id="role"
            v-model="newRole"
            :options="roles"
            optionLabel="label"
            optionValue="value"
            placeholder="Selectează rolul"
            class="role-select"
          />
        </div>
        <div class="form-actions">
          <Button
            label="Anulează"
            severity="secondary"
            @click="showEditRoleDialog = false"
          />
          <Button
            label="Salvează"
            :loading="updatingRole"
            @click="handleRoleUpdate"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { userService } from '@/services/userService'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import UserForm from '@/components/UserForm.vue'
import type { UserProfile } from '@/services/authService'

const toast = useToast()
const showUserDialog = ref(false)
const showEditRoleDialog = ref(false)
const users = ref<UserProfile[]>([])
const usersLoading = ref(false)
const creatingUser = ref(false)
const updatingRole = ref(false)
const editingUser = ref<UserProfile | null>(null)
const newRole = ref<'member' | 'admin'>('member')

const roles = [
  { label: 'Membru', value: 'member' },
  { label: 'Admin', value: 'admin' }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleUserSubmit = async (userData: {
  email: string
  username: string
  fullName?: string
  password: string
  role: 'member' | 'admin'
}) => {
  creatingUser.value = true
  try {
    const { error } = await userService.createUser(
      userData.email,
      userData.password,
      userData.username,
      userData.fullName,
      userData.role
    )

    if (error) {
      toast.add({ severity: 'error', summary: 'Eroare', detail: error.message, life: 3000 })
    } else {
      toast.add({ severity: 'success', summary: 'Succes', detail: 'Utilizator creat cu succes', life: 3000 })
      showUserDialog.value = false
      await loadUsers()
    }
  } finally {
    creatingUser.value = false
  }
}

const editUserRole = (user: UserProfile) => {
  editingUser.value = user
  newRole.value = user.role
  showEditRoleDialog.value = true
}

const handleRoleUpdate = async () => {
  if (!editingUser.value) return

  updatingRole.value = true
  try {
    const {  error } = await userService.updateUser(editingUser.value.id, {
      role: newRole.value
    })

    if (error) {
      toast.add({ severity: 'error', summary: 'Eroare', detail: error.message, life: 3000 })
    } else {
      toast.add({ severity: 'success', summary: 'Succes', detail: 'Rol actualizat cu succes', life: 3000 })
      showEditRoleDialog.value = false
      editingUser.value = null
      await loadUsers()
    }
  } finally {
    updatingRole.value = false
  }
}

const loadUsers = async () => {
  usersLoading.value = true
  try {
    const { users: usersList, error } = await userService.getAllUsers()
    if (error) {
      toast.add({ severity: 'error', summary: 'Eroare', detail: error.message, life: 3000 })
    } else {
      users.value = usersList || []
    }
  } finally {
    usersLoading.value = false
  }
}

onMounted(async () => {
  await loadUsers()
})
</script>

<style scoped>
.users-view {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.edit-role-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-info {
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 8px;
}

.user-info p {
  margin: 0.5rem 0;
  color: var(--text-color);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
}

.role-select {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .users-view {
    padding: 2rem;
  }

  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

