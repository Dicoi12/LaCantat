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
        <DatePicker
          id="event_date"
          v-model="formData.event_date as unknown as Date"
          dateFormat="dd-mm-yy"
          :minDate="new Date()"
          :class="{ 'p-invalid': errors.event_date }"
          required
          showIcon
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
import { ref, onMounted, watch } from 'vue'
import type { Event, CreateEventData } from '@/composables/useEvents'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
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

  // Convert date to YYYY-MM-DD format (avoiding timezone issues)
  let dateStr = ''
  const eventDate = formData.value.event_date
  
  if (!eventDate) {
    dateStr = ''
  } else if (eventDate instanceof Date) {
    // Use local date components to avoid timezone conversion issues
    const year = eventDate.getFullYear()
    const month = String(eventDate.getMonth() + 1).padStart(2, '0')
    const day = String(eventDate.getDate()).padStart(2, '0')
    dateStr = `${year}-${month}-${day}`
  } else if (typeof eventDate === 'string') {
    dateStr = eventDate
  } else if (Array.isArray(eventDate) && eventDate.length > 0) {
    const firstDate = eventDate[0]
    if (firstDate instanceof Date) {
      // Use local date components to avoid timezone conversion issues
      const year = firstDate.getFullYear()
      const month = String(firstDate.getMonth() + 1).padStart(2, '0')
      const day = String(firstDate.getDate()).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
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

const resetForm = () => {
  formData.value = {
    title: '',
    type: 'cununie',
    location: '',
    event_date: null,
    event_time: ''
  }
  errors.value = {}
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
  } else {
    resetForm()
  }
})

// Watch pentru a reseta formularul când event devine null
watch(() => props.event, (newEvent) => {
  if (newEvent) {
    formData.value = {
      title: newEvent.title,
      type: newEvent.type,
      location: newEvent.location,
      event_date: newEvent.event_date,
      event_time: newEvent.event_time
    }
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.field label::before {
  content: '';
  width: 3px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 2px;
}

.field :deep(.p-inputtext),
.field :deep(.p-select),
.field :deep(.p-calendar input) {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid var(--surface-border);
  transition: all 0.2s;
  font-size: 1rem;
}

.field :deep(.p-inputtext:focus),
.field :deep(.p-select:focus),
.field :deep(.p-calendar input:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.2);
  outline: none;
}

.field :deep(.p-select) {
  width: 100%;
}

.field :deep(.p-calendar) {
  width: 100%;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
}

.form-actions :deep(.p-button) {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.form-actions :deep(.p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .field-row {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>

