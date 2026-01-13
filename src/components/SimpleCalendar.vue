<template>
  <div class="simple-calendar">
    <div class="calendar-header">
      <Button
        icon="pi pi-chevron-left"
        text
        rounded
        @click="previousMonth"
        aria-label="Luna precedentă"
      />
      <h3 class="month-year">{{ monthYearLabel }}</h3>
      <Button
        icon="pi pi-chevron-right"
        text
        rounded
        @click="nextMonth"
        aria-label="Luna următoare"
      />
    </div>
    
    <div class="calendar-weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
    </div>
    
    <div class="calendar-days">
      <div
        v-for="day in calendarDays"
        :key="day.key"
        :class="[
          'calendar-day',
          {
            'other-month': day.isOtherMonth,
            'today': day.isToday,
            'has-event': day.hasEvent,
            'selected': day.isSelected
          }
        ]"
        @click="selectDate(day.date)"
      >
        <span class="day-number">{{ day.day }}</span>
        <span v-if="day.hasEvent" class="event-dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'

interface Props {
  modelValue: Date
  eventDates?: string[] // Array de date în format YYYY-MM-DD
}

interface CalendarDay {
  day: number
  date: Date
  isOtherMonth: boolean
  isToday: boolean
  hasEvent: boolean
  isSelected: boolean
  key: string
}

const props = withDefaults(defineProps<Props>(), {
  eventDates: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
  'date-select': [date: Date]
  'month-change': [date: Date]
}>()

const currentDate = ref(new Date(props.modelValue))
const selectedDate = ref<Date | null>(null)

const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleDateString('ro-RO', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Prima zi a lunii
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Luni = 0
  
  // Ultima zi a lunii
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Ultima zi a lunii precedente
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Zilele din luna precedentă
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: false,
      hasEvent: hasEventOnDate(date),
      isSelected: selectedDate.value?.getTime() === date.getTime(),
      key: `prev-${day}`
    })
  }
  
  // Zilele din luna curentă
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    const isToday = date.getTime() === today.getTime()
    days.push({
      day,
      date,
      isOtherMonth: false,
      isToday,
      hasEvent: hasEventOnDate(date),
      isSelected: selectedDate.value?.getTime() === date.getTime(),
      key: `current-${day}`
    })
  }
  
  // Zilele din luna următoare pentru a completa săptămâna
  const remainingDays = 42 - days.length // 6 săptămâni * 7 zile
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    date.setHours(0, 0, 0, 0)
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: false,
      hasEvent: hasEventOnDate(date),
      isSelected: selectedDate.value?.getTime() === date.getTime(),
      key: `next-${day}`
    })
  }
  
  return days
})

const hasEventOnDate = (date: Date): boolean => {
  // Convert date to YYYY-MM-DD using local timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  return props.eventDates.includes(dateStr)
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  emit('update:modelValue', date)
  emit('date-select', date)
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
  emit('month-change', newDate)
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
  emit('month-change', newDate)
}

// Watch pentru sincronizare cu modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const newDate = new Date(newValue)
    if (newDate.getMonth() !== currentDate.value.getMonth() || 
        newDate.getFullYear() !== currentDate.value.getFullYear()) {
      currentDate.value = newDate
    }
  }
})
</script>

<style scoped>
.simple-calendar {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: var(--surface-card);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.month-year {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--text-color);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  padding: 0.25rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all 0.2s;
  padding: 0.25rem;
  min-height: 35px;
}

.calendar-day:hover {
  background-color: var(--surface-hover);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  position: relative;
}

.calendar-day.today::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background-color: rgba(34, 197, 94, 0.2); /* Verde transparent */
  border-radius: 50%;
  z-index: 0;
}

.calendar-day.today .day-number {
  position: relative;
  z-index: 1;
  border: 2px solid #22c55e; /* Verde pentru cerc */
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.calendar-day.selected {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.calendar-day.has-event {
  font-weight: 500;
}

.day-number {
  font-size: 0.8rem;
}

.event-dot {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: #3b82f6; /* Albastru */
  border-radius: 50%;
  z-index: 1;
}

.calendar-day.today .event-dot {
  background-color: #3b82f6; /* Albastru pentru evenimente */
  z-index: 2;
}

.calendar-day.selected .event-dot {
  background-color: white;
  box-shadow: 0 0 0 1px var(--primary-color);
}

.calendar-day.has-event:hover .event-dot {
  width: 10px;
  height: 10px;
  bottom: 3px;
  background-color: #2563eb; /* Albastru mai închis la hover */
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 35px;
    padding: 0.25rem;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
  
  .calendar-day.today::before {
    width: 28px;
    height: 28px;
  }
  
  .calendar-day.today .day-number {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
    border-width: 1.5px;
  }
  
  .event-dot {
    width: 6px;
    height: 6px;
  }
}
</style>

