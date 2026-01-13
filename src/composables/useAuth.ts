import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService, type UserProfile } from '@/services/authService'
import type { User, Session } from '@supabase/supabase-js'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const userProfile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

let authStateListener: { data: { subscription: { unsubscribe: () => void } } } | null = null

/**
 * Composable pentru gestionarea autentificării
 */
export function useAuth() {
  const router = useRouter()

  /**
   * Verifică dacă utilizatorul este autentificat
   */
  const isAuthenticated = computed(() => !!currentUser.value && !!currentSession.value)

  /**
   * Verifică dacă utilizatorul este admin
   */
  const isAdmin = computed(() => userProfile.value?.role === 'admin')

  /**
   * Verifică dacă utilizatorul este member
   */
  const isMember = computed(() => userProfile.value?.role === 'member')

  /**
   * Login
   */
  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    const response = await authService.signIn(email, password)

    if (response.error) {
      error.value = response.error.message
      loading.value = false
      return false
    }

    if (response.user && response.session) {
      currentUser.value = response.user
      currentSession.value = response.session
      await loadUserProfile(response.user.id)
      loading.value = false
      return true
    }

    loading.value = false
    return false
  }

  /**
   * Sign up (înregistrare)
   */
  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    role: 'member' | 'admin' = 'member'
  ) => {
    loading.value = true
    error.value = null

    const response = await authService.signUp(email, password, username, fullName, role)

    if (response.error) {
      error.value = response.error.message
      loading.value = false
      return false
    }

    if (response.user && response.session) {
      currentUser.value = response.user
      currentSession.value = response.session
      await loadUserProfile(response.user.id)
      loading.value = false
      return true
    }

    loading.value = false
    return false
  }

  /**
   * Logout
   */
  const signOut = async () => {
    loading.value = true
    error.value = null

    // Întotdeauna curăță starea locală, chiar dacă signOut() eșuează
    // (de exemplu, dacă sesiunea este deja expirată)
    currentUser.value = null
    currentSession.value = null
    userProfile.value = null

    // Încearcă să facă signOut pe server, dar nu blochează dacă eșuează
    try {
      const response = await authService.signOut()
      if (response.error) {
        // Dacă există eroare (ex: sesiune expirată), ignorăm și continuăm
        console.warn('SignOut error (ignored):', response.error.message)
      }
    } catch (err) {
      // Dacă signOut aruncă o excepție (ex: sesiune invalidă), ignorăm
      console.warn('SignOut exception (ignored):', err)
    }

    loading.value = false

    // Redirecționează întotdeauna la login, indiferent de rezultat
    router.push('/login')
    return true
  }

  /**
   * Încarcă profilul utilizatorului
   */
  const loadUserProfile = async (userId: string) => {
    const profile = await authService.getUserProfile(userId)
    userProfile.value = profile
  }

  /**
   * Inițializează autentificarea (verifică sesiunea existentă)
   */
  const initAuth = async () => {
    loading.value = true
    try {
      const session = await authService.getSession()
      if (session?.user) {
        // Verifică dacă sesiunea este validă încercând să obțină profilul
        try {
          await loadUserProfile(session.user.id)
          currentSession.value = session
          currentUser.value = session.user
        } catch (err) {
          // Dacă nu poate încărca profilul, sesiunea este invalidă
          console.error('Invalid session, clearing auth state:', err)
          await signOut()
        }
      }
    } catch (err: any) {
      // Dacă eroarea indică sesiune invalidă, curăță starea
      if (err?.message?.includes('session') || err?.message?.includes('JWT')) {
        console.error('Invalid session detected, clearing auth state:', err)
        currentUser.value = null
        currentSession.value = null
        userProfile.value = null
        // Nu apelăm signOut() aici pentru a evita redirect-uri infinite
      } else {
        console.error('Error initializing auth:', err)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Configurează listener pentru schimbări de autentificare
   */
  const setupAuthListener = () => {
    authStateListener = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        currentUser.value = session.user
        currentSession.value = session
        try {
          await loadUserProfile(session.user.id)
        } catch (err) {
          console.error('Error loading user profile:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        currentUser.value = null
        currentSession.value = null
        userProfile.value = null
        // Redirecționează la login doar dacă nu suntem deja acolo
        if (router.currentRoute.value.name !== 'login' && router.currentRoute.value.name !== 'signup') {
          router.push('/login')
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token-ul a fost reînnoit cu succes
        currentSession.value = session
        if (session.user) {
          currentUser.value = session.user
        }
        console.log('Token refreshed successfully')
      } else if (event === 'USER_UPDATED' && session) {
        currentSession.value = session
        if (session.user) {
          currentUser.value = session.user
        }
      }
    })
  }

  /**
   * Verifică și reînnoiește sesiunea dacă este aproape de expirare
   */
  const checkAndRefreshSession = async () => {
    try {
      const session = await authService.getSession()
      if (session) {
        // Verifică dacă token-ul expiră în următoarele 5 minute
        const expiresAt = session.expires_at
        if (expiresAt) {
          const expiresIn = expiresAt - Math.floor(Date.now() / 1000)
          // Dacă expiră în următoarele 5 minute, forțează refresh
          if (expiresIn < 300) {
          const { session: refreshedSession, error } = await authService.refreshSession()
          if (error) {
            console.error('Failed to refresh session:', error)
            // Dacă refresh-ul eșuează, curăță starea și redirecționează
            await signOut()
          } else if (refreshedSession) {
            currentSession.value = refreshedSession
            if (refreshedSession.user) {
              currentUser.value = refreshedSession.user
            }
          }
          }
        }
      }
    } catch (err) {
      console.error('Error checking session:', err)
    }
  }

  /**
   * Oprește listener-ul
   */
  const removeAuthListener = () => {
    if (authStateListener) {
      authStateListener.data.subscription.unsubscribe()
      authStateListener = null
    }
  }

  let refreshInterval: ReturnType<typeof setInterval> | null = null

  // Inițializare la mount
  onMounted(async () => {
    await initAuth()
    setupAuthListener()
    
    // Verifică și reînnoiește sesiunea la fiecare 5 minute
    refreshInterval = setInterval(() => {
      checkAndRefreshSession()
    }, 5 * 60 * 1000) // 5 minute
  })

  // Cleanup la unmount
  onUnmounted(() => {
    removeAuthListener()
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  })

  return {
    // State
    currentUser,
    currentSession,
    userProfile,
    loading,
    error,
    // Computed
    isAuthenticated,
    isAdmin,
    isMember,
    // Methods
    signIn,
    signUp,
    signOut,
    loadUserProfile,
    initAuth,
    checkAndRefreshSession
  }
}

