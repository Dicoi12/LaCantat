import { supabase } from '@/lib/supabase'
import type { UserProfile } from './authService'

/**
 * Serviciu pentru gestionarea utilizatorilor (doar pentru admini)
 */
export const userService = {
  /**
   * Creează un utilizator nou (doar admini)
   * Folosește Supabase Admin API sau crează prin auth.signUp
   */
  async createUser(
    email: string,
    password: string,
    username: string,
    fullName?: string,
    role: 'member' | 'admin' = 'member'
  ): Promise<{ user: any | null; error: Error | null }> {
    try {
      // Folosim signUp normal - Supabase va crea automat profilul prin trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || '',
            role
          },
          emailRedirectTo: undefined // Nu trimitem email de confirmare
        }
      })

      if (error) {
        return { user: null, error }
      }

      // Dacă user-ul este creat, actualizăm profilul cu rolul corect
      if (data.user) {
        // Așteptăm puțin pentru ca trigger-ul să creeze profilul
        await new Promise(resolve => setTimeout(resolve, 500))

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role, username, full_name: fullName || null })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Eroare la crearea utilizatorului')
      }
    }
  },

  /**
   * Obține toți utilizatorii (doar admini)
   */
  async getAllUsers(): Promise<{ users: UserProfile[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { users: null, error }
      }

      return { users: data as UserProfile[], error: null }
    } catch (error) {
      return {
        users: null,
        error: error instanceof Error ? error : new Error('Eroare la încărcarea utilizatorilor')
      }
    }
  },

  /**
   * Actualizează un utilizator (doar admini)
   */
  async updateUser(
    userId: string,
    updates: Partial<Pick<UserProfile, 'username' | 'full_name' | 'role'>>
  ): Promise<{ user: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { user: null, error }
      }

      return { user: data as UserProfile, error: null }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Eroare la actualizarea utilizatorului')
      }
    }
  },

  /**
   * Șterge un utilizator (doar admini)
   * Șterge din user_profiles. Pentru ștergere completă din auth.users,
   * folosește Supabase Dashboard sau configurează service role key
   */
  async deleteUser(userId: string): Promise<{ error: Error | null }> {
    try {
      // Ștergem din user_profiles
      // Dacă vrei ștergere completă din auth.users, folosește Supabase Dashboard
      // sau configurează service role key pentru Admin API
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Eroare la ștergerea utilizatorului')
      }
    }
  }
}

