<template>
  <form @submit.prevent="handleSubmit" class="event-form">
    <div class="field">
      <label for="title">Titlu *</label>
      <InputText
        id="title"
        v-model="formData.title"
        placeholder="Ex: Cununie - Popescu Ion și Maria"
        :class="{ 'p-invalid': errors.title }"
        required
      />
      <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
    </div>

    <div class="field">
      <label for="type">Tip eveniment *</label>
      <Select
        id="type"
        v-model="formData.type"
        :options="eventTypes"
        optionLabel="label"
        optionValue="value"
        placeholder="Selectează tipul"
        :class="{ 'p-invalid': errors.type }"
        required
      />
      <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
    </div>

    <div class="field">
      <label for="location">Locație *</label>
      <InputText
        id="location"
        v-model="formData.location"
        placeholder="Ex: Biserica Sf. Gheorghe, București"
        :class="{ 'p-invalid': errors.location }"
        required
      />
      <small v-if="errors.location" class="p-error">{{ errors.location }}</small>
    </div>

    <div class="field-row">
      <div class="field">
        <label for="event_date">Dată *</label>
        <Calendar
          id="event_date"
          v-model="formData.event_date as unknown as Date"
          dateFormat="yy-mm-dd"
          :minDate="new Date()"
          :class="{ 'p-invalid': errors.event_date }"
          required
        />
        <small v-if="errors.event_date" class="p-error">{{ errors.event_date }}</small>
      </div>

      <div class="field">
        <label for="event_time">Oră *</label>
        <InputText
          id="event_time"
          v-model="formData.event_time"
          placeholder="HH:mm"
          :class="{ 'p-invalid': errors.event_time }"
          required
        />
        <small v-if="errors.event_time" class="p-error">{{ errors.event_time }}</small>
        <small class="p-text-secondary">Format: HH:mm (ex: 14:30)</small>
      </div>
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
        :label="event ? 'Actualizează' : 'Creează'"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Event, CreateEventData } from '@/composables/useEvents'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'

interface Props {
  event?: Event | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: CreateEventData]
  cancel: []
}>()

const loading = ref(false)
const formData = ref<Omit<CreateEventData, 'event_date'> & { event_date: string | Date | Date[] | null }>({
  title: '',
  type: 'cununie',
  location: '',
  event_date: null,
  event_time: ''
})

const errors = ref<Partial<Record<keyof CreateEventData, string>>>({})

const eventTypes = [
  { label: 'Cununie', value: 'cununie' },
  { label: 'Botez', value: 'botez' },
  { label: 'Majorat', value: 'majorat' },
  { label: 'Nuntă', value: 'nunta' },
  { label: 'Altul', value: 'altu' }
]

const validateForm = () => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Titlul este obligatoriu'
  }

  if (!formData.value.type) {
    errors.value.type = 'Tipul este obligatoriu'
  }

  if (!formData.value.location.trim()) {
    errors.value.location = 'Locația este obligatorie'
  }

  if (!formData.value.event_date) {
    errors.value.event_date = 'Data este obligatorie'
  }

  if (!formData.value.event_time) {
    errors.value.event_time = 'Ora este obligatorie'
  } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.value.event_time)) {
    errors.value.event_time = 'Format invalid. Folosește HH:mm (ex: 14:30)'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // Convert date to YYYY-MM-DD format
  let dateStr = ''
  const eventDate = formData.value.event_date
  
  if (!eventDate) {
    dateStr = ''
  } else if (eventDate instanceof Date) {
    dateStr = eventDate.toISOString().split('T')[0] || ''
  } else if (typeof eventDate === 'string') {
    dateStr = eventDate
  } else if (Array.isArray(eventDate) && eventDate.length > 0) {
    const firstDate = eventDate[0]
    if (firstDate instanceof Date) {
      dateStr = firstDate.toISOString().split('T')[0] || ''
    }
  }

  if (!dateStr) {
    errors.value.event_date = 'Data este obligatorie'
    return
  }

  emit('submit', {
    ...formData.value,
    event_date: dateStr
  } as CreateEventData)
}

onMounted(() => {
  if (props.event) {
    formData.value = {
      title: props.event.title,
      type: props.event.type,
      location: props.event.location,
      event_date: props.event.event_date,
      event_time: props.event.event_time
    }
  }
})
</script>

<style scoped>
.event-form {
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

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>

