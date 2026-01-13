<template>
  <div class="events-list-view">
    <Card>
      <template #title>
        <div class="card-header">
          <span>Lista evenimente</span>
          <Button
            v-if="isAdmin"
            label="Adaugă eveniment"
            icon="pi pi-plus"
            @click="showEventDialog = true"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="events"
          :loading="eventsLoading"
          :paginator="true"
          :rows="10"
          stripedRows
          responsiveLayout="scroll"
        >
          <Column field="title" header="Titlu" sortable />
          <Column field="type" header="Tip">
            <template #body="{ data }">
              <Tag :value="getEventTypeLabel(data.type)" :severity="getEventTypeSeverity(data.type)" />
            </template>
          </Column>
          <Column field="location" header="Locație" sortable />
          <Column field="event_date" header="Dată" sortable>
            <template #body="{ data }">
              {{ formatDate(data.event_date) }}
            </template>
          </Column>
          <Column field="event_time" header="Oră" sortable>
            <template #body="{ data }">
              {{ formatTime(data.event_time) }}
            </template>
          </Column>
          <Column v-if="isAdmin" header="Acțiuni">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                severity="info"
                text
                rounded
                @click="editEvent(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="confirmDelete(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog pentru adăugare/editare eveniment -->
    <Dialog
      v-model:visible="showEventDialog"
      :header="editingEvent ? 'Editează eveniment' : 'Adaugă eveniment'"
      :modal="true"
      :style="{ width: '90%', maxWidth: '500px' }"
    >
      <EventForm
        v-if="showEventDialog"
        :event="editingEvent"
        @submit="handleEventSubmit"
        @cancel="showEventDialog = false"
      />
    </Dialog>

    <!-- Confirmare ștergere -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'
import { useEvents, type Event, type CreateEventData } from '@/composables/useEvents'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import EventForm from '@/components/EventForm.vue'

const confirm = useConfirm()
const toast = useToast()
const { isAdmin } = useAuth()
const {
  events,
  loading: eventsLoading,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = useEvents()

const showEventDialog = ref(false)
const editingEvent = ref<Event | null>(null)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timeString: string) => {
  return timeString.substring(0, 5) // HH:mm
}

const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cununie: 'Cununie',
    botez: 'Botez',
    majorat: 'Majorat',
    nunta: 'Nuntă',
    altu: 'Altul'
  }
  return labels[type] || type
}

const getEventTypeSeverity = (type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
  const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
    cununie: 'success',
    botez: 'info',
    majorat: 'warning',
    nunta: 'danger',
    altu: 'secondary'
  }
  return severities[type] || 'secondary'
}

const editEvent = (event: Event) => {
  editingEvent.value = event
  showEventDialog.value = true
}

const confirmDelete = (event: Event) => {
  confirm.require({
    message: `Ești sigur că vrei să ștergi evenimentul "${event.title}"?`,
    header: 'Confirmare ștergere',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      const success = await deleteEvent(event.id)
      if (success) {
        toast.add({ severity: 'success', summary: 'Succes', detail: 'Eveniment șters cu succes', life: 3000 })
        await fetchEvents()
      } else {
        toast.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare la ștergerea evenimentului', life: 3000 })
      }
    }
  })
}

const handleEventSubmit = async (eventData: CreateEventData) => {
  let success = false

  if (editingEvent.value) {
    const updated = await updateEvent(editingEvent.value.id, eventData)
    success = !!updated
    if (success) {
      toast.add({ severity: 'success', summary: 'Succes', detail: 'Eveniment actualizat cu succes', life: 3000 })
    }
  } else {
    const created = await createEvent(eventData)
    success = !!created
    if (success) {
      toast.add({ severity: 'success', summary: 'Succes', detail: 'Eveniment creat cu succes', life: 3000 })
    }
  }

  if (success) {
    showEventDialog.value = false
    editingEvent.value = null
    await fetchEvents()
  } else {
    toast.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare la salvarea evenimentului', life: 3000 })
  }
}

onMounted(async () => {
  await fetchEvents()
})
</script>

<style scoped>
.events-list-view {
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

@media (min-width: 768px) {
  .events-list-view {
    padding: 2rem;
  }

  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

