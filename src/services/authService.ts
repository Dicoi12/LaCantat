import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  username: string
  role: 'member' | 'admin'
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

/**
 * Serviciu pentru autentificare cu Supabase Auth
 */
export const authService = {
  /**
   * Login cu email și parolă
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, session: null, error }
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Eroare la autentificare')
      }
    }
  },

  /**
   * Sign up (înregistrare) - doar pentru admini
   */
  async signUp(
    email: string,
    password: string,
    username: string,
    fullName?: string,
    role: 'member' | 'admin' = 'member'
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || '',
            role
          }
        }
      })

      if (error) {
        return { user: null, session: null, error }
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Eroare la înregistrare')
      }
    }
  },

  /**
   * Logout
   * Gestionează și cazul când sesiunea este deja expirată/invalidă
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      // Încearcă să facă signOut
      const { error } = await supabase.auth.signOut()
      
      // Dacă eroarea indică sesiune invalidă/expirată, nu o tratăm ca eroare critică
      if (error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('session') || 
            errorMessage.includes('jwt') || 
            errorMessage.includes('expired') ||
            errorMessage.includes('invalid')) {
          // Sesiunea este deja invalidă, ceea ce este ok pentru logout
          // Returnăm null pentru a indica că logout-ul a reușit (starea este deja curățată)
          return { error: null }
        }
        return { error: new Error(error.message) }
      }
      
      return { error: null }
    } catch (error) {
      // Dacă eroarea este despre sesiune invalidă, ignorăm
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('session') || 
            errorMessage.includes('jwt') || 
            errorMessage.includes('expired') ||
            errorMessage.includes('invalid')) {
          return { error: null }
        }
      }
      return {
        error: error instanceof Error ? error : new Error('Eroare la logout')
      }
    }
  },

  /**
   * Obține utilizatorul curent
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Obține sesiunea curentă
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Obține profilul utilizatorului curent
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return null
      }

      return data as UserProfile
    } catch {
      return null
    }
  },

  /**
   * Reînnoiește sesiunea curentă
   */
  async refreshSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        return { session: null, error }
      }
      return { session: data.session, error: null }
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Eroare la reînnoirea sesiunii')
      }
    }
  },

  /**
   * Ascultă schimbările de autentificare
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

