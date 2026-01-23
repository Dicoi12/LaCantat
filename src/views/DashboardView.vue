<template>
  <div class="dashboard">
    <Card class="next-event-card">
      <template #title>
        <div class="card-title">
          <span>Următorul eveniment programat</span>
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
          <h2>{{ nextEvent.title }}</h2>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEvents, type Event } from '@/composables/useEvents'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'

const { getNextEvent } = useEvents()

const nextEvent = ref<Event | null>(null)
const nextEventLoading = ref(true)

// Calculează numărul de zile până la eveniment
const daysUntilEvent = computed<number | null>(() => {
  if (!nextEvent.value) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventDate = new Date(nextEvent.value.event_date)
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

const loadNextEvent = async () => {
  nextEventLoading.value = true
  nextEvent.value = await getNextEvent()
  nextEventLoading.value = false
}

onMounted(async () => {
  await loadNextEvent()
})
</script>

<style scoped>
.dashboard {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.next-event-card {
  margin-bottom: 2rem;
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

.next-event h2 {
  margin-top: 0;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item i {
  color: var(--primary-color);
}

.no-event {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

@media (min-width: 768px) {
  .dashboard {
    padding: 2rem;
  }
}
</style>
