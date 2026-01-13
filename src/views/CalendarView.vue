<template>
  <div class="calendar-view">
    <!-- Card cu următorul eveniment -->
    <Card class="next-event-card">
      <template #title>
        <div class="card-title">
          <span>Următorul eveniment</span>
          <Tag
            v-if="nextEvent && daysUntilEvent !== null"
            :value="daysUntilEventText"
            :severity="daysUntilEvent === 0 ? 'success' : 'info'"
            class="days-badge"
          />
        </div>
      </template>
      <template #content>
        <div v-if="nextEventLoading" class="loading">
          <ProgressSpinner />
        </div>
        <div v-else-if="nextEvent" class="next-event">
          <div class="next-event-header">
            <h3>{{ nextEvent.title }}</h3>
            <p class="time-remaining" v-if="daysUntilEvent !== null">
              <span v-if="daysUntilEvent === 0">Evenimentul este astăzi</span>
              <span v-else-if="daysUntilEvent === 1">Timp rămas: mâine</span>
              <span v-else>Timp rămas: {{ daysUntilEvent }} zile</span>
            </p>
          </div>
          <div class="event-details">
            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatDate(nextEvent.event_date) }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-clock"></i>
              <span>{{ formatTime(nextEvent.event_time) }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-map-marker"></i>
              <span>{{ nextEvent.location }}</span>
            </div>
            <div class="detail-item">
              <Tag :value="getEventTypeLabel(nextEvent.type)" :severity="getEventTypeSeverity(nextEvent.type)" />
            </div>
          </div>
        </div>
        <div v-else class="no-event">
          <p>Nu există evenimente programate</p>
        </div>
      </template>
    </Card>

    <Card class="calendar-card">
      <template #title>
        <div class="card-header">
          <span>Calendar evenimente</span>
          <Button
            v-if="isAdmin"
            label="Adaugă eveniment"
            icon="pi pi-plus"
            @click="openAddEventDialog"
          />
        </div>
      </template>
      <template #content>
        <div class="calendar-container">
          <SimpleCalendar
            v-model="selectedDate"
            :event-dates="eventDatesList"
            @date-select="onDateSelect"
            @month-change="onMonthChange"
          />
        </div>

        <!-- Lista evenimentelor pentru luna selectată -->
        <div class="events-list">
          <h3>Evenimente - {{ currentMonthLabel }}</h3>
          <div v-if="eventsLoading" class="loading">
            <ProgressSpinner />
          </div>
          <div v-else-if="filteredEvents.length === 0" class="no-events">
            <p>Nu există evenimente în această lună</p>
          </div>
          <div v-else class="events-grid">
            <Card
              v-for="event in filteredEvents"
              :key="event.id"
              class="event-card"
            >
              <template #title>
                <div class="event-card-header">
                  <span>{{ event.title }}</span>
                  <div v-if="isAdmin" class="event-actions">
                    <Button
                      icon="pi pi-pencil"
                      severity="info"
                      text
                      rounded
                      size="small"
                      @click="editEvent(event)"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      rounded
                      size="small"
                      @click="confirmDelete(event)"
                    />
                  </div>
                </div>
              </template>
              <template #content>
                <div class="event-card-content">
                  <div class="event-info">
                    <div class="info-item">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatDate(event.event_date) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="pi pi-clock"></i>
                      <span>{{ formatTime(event.event_time) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ event.location }}</span>
                    </div>
                    <div class="info-item">
                      <Tag :value="getEventTypeLabel(event.type)" :severity="getEventTypeSeverity(event.type)" />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
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
        @cancel="handleEventCancel"
      />
    </Dialog>

    <!-- Dialog pentru evenimentele dintr-o zi -->
    <Dialog
      v-model:visible="showDayEventsDialog"
      :header="`Evenimente - ${selectedDayLabel}`"
      :modal="true"
      :style="{ width: '90%', maxWidth: '600px' }"
    >
      <div v-if="dayEventsLoading" class="loading">
        <ProgressSpinner />
      </div>
      <div v-else-if="selectedDayEvents.length === 0" class="no-events">
        <p>Nu există evenimente în această zi</p>
      </div>
      <div v-else class="day-events-list">
        <Card
          v-for="event in selectedDayEvents"
          :key="event.id"
          class="day-event-card"
        >
          <template #title>
            <div class="event-card-header">
              <span>{{ event.title }}</span>
              <div v-if="isAdmin" class="event-actions">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  text
                  rounded
                  size="small"
                  @click="editEventFromDialog(event)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click="confirmDeleteFromDialog(event)"
                />
              </div>
            </div>
          </template>
          <template #content>
            <div class="event-card-content">
              <div class="event-info">
                <div class="info-item">
                  <i class="pi pi-clock"></i>
                  <span>{{ formatTime(event.event_time) }}</span>
                </div>
                <div class="info-item">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ event.location }}</span>
                </div>
                <div class="info-item">
                  <Tag :value="getEventTypeLabel(event.type)" :severity="getEventTypeSeverity(event.type)" />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </Dialog>

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
        @cancel="handleEventCancel"
      />
    </Dialog>

    <!-- Confirmare ștergere -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'
import { useEvents, type Event, type CreateEventData } from '@/composables/useEvents'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import EventForm from '@/components/EventForm.vue'
import SimpleCalendar from '@/components/SimpleCalendar.vue'

const confirm = useConfirm()
const toast = useToast()
const { isAdmin } = useAuth()
const {
  events,
  loading: eventsLoading,
  fetchEventsByMonth,
  getNextEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = useEvents()

const selectedDate = ref<Date>(new Date())
const showEventDialog = ref(false)
const editingEvent = ref<Event | null>(null)
const showDayEventsDialog = ref(false)
const selectedDayEvents = ref<Event[]>([])
const dayEventsLoading = ref(false)
const selectedDayDate = ref<Date | null>(null)
const nextEvent = ref<Event | null>(null)
const nextEventLoading = ref(true)

const currentMonth = computed(() => selectedDate.value.getMonth() + 1)
const currentYear = computed(() => selectedDate.value.getFullYear())

const currentMonthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString('ro-RO', {
    month: 'long',
    year: 'numeric'
  })
})

// Evenimente filtrate pentru luna curentă
const filteredEvents = computed(() => {
  return events.value.filter(event => {
    // Parse date string YYYY-MM-DD using local timezone
    const [year, month, day] = event.event_date.split('-').map(Number)
    const eventDate = new Date(year!, month! - 1, day!)
    return eventDate.getMonth() + 1 === currentMonth.value &&
           eventDate.getFullYear() === currentYear.value
  })
})

// Obține lista de date cu evenimente pentru calendar
const eventDatesList = computed(() => {
  return filteredEvents.value
    .map(event => {
      // Return date string as-is (already in YYYY-MM-DD format)
      return event.event_date
    })
    .filter((date): date is string => !!date)
})

// Obține evenimentele pentru o zi specifică
const getEventsForDate = (date: Date): Event[] => {
  // Convert date to YYYY-MM-DD using local timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  return filteredEvents.value.filter(event => {
    // Compare directly with event_date string (already in YYYY-MM-DD format)
    return event.event_date === dateStr
  })
}

const selectedDayLabel = computed(() => {
  if (!selectedDayDate.value) return ''
  return selectedDayDate.value.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const onDateSelect = (date: Date) => {
  selectedDayDate.value = date
  const dayEvents = getEventsForDate(date)
  
  // Deschide dialogul dacă există evenimente în ziua selectată
  if (dayEvents.length > 0) {
    selectedDayEvents.value = dayEvents
    showDayEventsDialog.value = true
  } else {
    // Dacă nu există evenimente, resetează selecția
    selectedDayEvents.value = []
    showDayEventsDialog.value = false
  }
}

const onMonthChange = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  selectedDate.value = date
  fetchEventsByMonth(year, month)
}

const formatDate = (dateString: string) => {
  // Parse date string YYYY-MM-DD using local timezone
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year!, month! - 1, day!)
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

// Calculează numărul de zile până la eveniment
const daysUntilEvent = computed<number | null>(() => {
  if (!nextEvent.value) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Parse date string YYYY-MM-DD using local timezone
  const [year, month, day] = nextEvent.value.event_date.split('-').map(Number)
  const eventDate = new Date(year!, month! - 1, day!)
  eventDate.setHours(0, 0, 0, 0)

  const diffTime = eventDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

// Text pentru badge-ul cu zilele rămase
const daysUntilEventText = computed(() => {
  if (daysUntilEvent.value === null) return ''
  
  if (daysUntilEvent.value === 0) {
    return 'Astăzi'
  } else if (daysUntilEvent.value === 1) {
    return 'Mâine'
  } else {
    return `În ${daysUntilEvent.value} zile`
  }
})

// Încarcă următorul eveniment
const loadNextEvent = async () => {
  nextEventLoading.value = true
  nextEvent.value = await getNextEvent()
  nextEventLoading.value = false
}

const openAddEventDialog = () => {
  editingEvent.value = null
  showEventDialog.value = true
}

const editEvent = (event: Event) => {
  editingEvent.value = event
  showEventDialog.value = true
}

const editEventFromDialog = (event: Event) => {
  showDayEventsDialog.value = false
  editingEvent.value = event
  showEventDialog.value = true
}

const confirmDeleteFromDialog = (event: Event) => {
  confirm.require({
    message: `Ești sigur că vrei să ștergi evenimentul "${event.title}"?`,
    header: 'Confirmare ștergere',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      const success = await deleteEvent(event.id)
      if (success) {
        toast.add({ severity: 'success', summary: 'Succes', detail: 'Eveniment șters cu succes', life: 3000 })
        await fetchEventsByMonth(currentYear.value, currentMonth.value)
        await loadNextEvent() // Reîncarcă următorul eveniment
        // Reîncarcă evenimentele din dialog
        if (selectedDayDate.value) {
          selectedDayEvents.value = getEventsForDate(selectedDayDate.value)
          if (selectedDayEvents.value.length === 0) {
            showDayEventsDialog.value = false
          }
        }
      } else {
        toast.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare la ștergerea evenimentului', life: 3000 })
      }
    }
  })
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
        await fetchEventsByMonth(currentYear.value, currentMonth.value)
        await loadNextEvent() // Reîncarcă următorul eveniment
      } else {
        toast.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare la ștergerea evenimentului', life: 3000 })
      }
    }
  })
}

const handleEventCancel = () => {
  showEventDialog.value = false
  editingEvent.value = null
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
    await fetchEventsByMonth(currentYear.value, currentMonth.value)
    await loadNextEvent() // Reîncarcă următorul eveniment
    // Reîncarcă evenimentele din dialog dacă este deschis
    if (selectedDayDate.value && showDayEventsDialog.value) {
      selectedDayEvents.value = getEventsForDate(selectedDayDate.value)
    }
  } else {
    toast.add({ severity: 'error', summary: 'Eroare', detail: 'Eroare la salvarea evenimentului', life: 3000 })
  }
}

onMounted(async () => {
  await fetchEventsByMonth(currentYear.value, currentMonth.value)
  await loadNextEvent()
})
</script>

<style scoped>
.calendar-view {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.next-event-card {
  margin-bottom: 1.5rem;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.days-badge {
  font-size: 0.875rem;
  font-weight: 600;
}

.next-event-header {
  margin-bottom: 1rem;
}

.next-event h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.next-event .time-remaining {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.next-event .event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.next-event .detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-event .detail-item i {
  color: var(--primary-color);
  width: 20px;
}

.next-event .no-event {
  text-align: center;
  padding: 1rem;
  color: var(--text-color-secondary);
}

.next-event .loading {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.calendar-card {
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.calendar-container {
  margin-bottom: 2rem;
}

.events-list {
  margin-top: 2rem;
}

.events-list h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.events-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.event-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.event-card-content {
  padding: 0;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item i {
  color: var(--primary-color);
  width: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-event-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.day-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .calendar-view {
    padding: 2rem;
  }

  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

