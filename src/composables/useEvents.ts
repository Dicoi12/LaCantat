import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface Event {
  id: string
  title: string
  type: 'cununie' | 'botez' | 'majorat' | 'nunta' | 'altu'
  location: string
  event_date: string
  event_time: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateEventData {
  title: string
  type: 'cununie' | 'botez' | 'majorat' | 'nunta' | 'altu'
  location: string
  event_date: string
  event_time: string
}

/**
 * Composable pentru gestionarea evenimentelor
 */
export function useEvents() {
  const { currentUser, isAdmin } = useAuth()
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Obține toate evenimentele (sortate după dată)
   */
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      events.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea evenimentelor'
    } finally {
      loading.value = false
    }
  }

  /**
   * Obține evenimentele pentru o lună specifică
   */
  const fetchEventsByMonth = async (year: number, month: number) => {
    loading.value = true
    error.value = null

    try {
      // Calculează prima și ultima zi a lunii
      const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', firstDay)
        .lte('event_date', lastDay)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      events.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea evenimentelor'
    } finally {
      loading.value = false
    }
  }

  /**
   * Obține următorul eveniment (cel mai apropiat)
   * Include și evenimentele de astăzi, indiferent de oră
   */
  const getNextEvent = async (): Promise<Event | null> => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    try {
      // Obține toate evenimentele de astăzi sau viitoare
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', todayStr)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })
        .limit(1)
        .single()

      if (fetchError || !data) {
        return null
      }

      return data as Event
    } catch {
      return null
    }
  }

  /**
   * Creează un eveniment nou (doar admin)
   */
  const createEvent = async (eventData: CreateEventData): Promise<Event | null> => {
    if (!isAdmin.value || !currentUser.value) {
      error.value = 'Nu ai permisiunea de a crea evenimente'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: currentUser.value.id
        })
        .select()
        .single()

      if (createError) {
        error.value = createError.message
        return null
      }

      await fetchEvents() // Reîncarcă lista
      return data as Event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la crearea evenimentului'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizează un eveniment (doar admin)
   */
  const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>): Promise<Event | null> => {
    if (!isAdmin.value) {
      error.value = 'Nu ai permisiunea de a actualiza evenimente'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return null
      }

      await fetchEvents() // Reîncarcă lista
      return data as Event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la actualizarea evenimentului'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Șterge un eveniment (doar admin)
   */
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!isAdmin.value) {
      error.value = 'Nu ai permisiunea de a șterge evenimente'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      await fetchEvents() // Reîncarcă lista
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la ștergerea evenimentului'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchEventsByMonth,
    getNextEvent,
    createEvent,
    updateEvent,
    deleteEvent
  }
}

