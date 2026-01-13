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

    const response = await authService.signOut()

    if (response.error) {
      error.value = response.error.message
      loading.value = false
      return false
    }

    currentUser.value = null
    currentSession.value = null
    userProfile.value = null
    loading.value = false

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
        currentSession.value = session
        currentUser.value = session.user
        await loadUserProfile(session.user.id)
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
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
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        currentUser.value = null
        currentSession.value = null
        userProfile.value = null
      } else if (event === 'TOKEN_REFRESHED' && session) {
        currentSession.value = session
      }
    })
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

  // Inițializare la mount
  onMounted(async () => {
    await initAuth()
    setupAuthListener()
  })

  // Cleanup la unmount
  onUnmounted(() => {
    removeAuthListener()
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
    initAuth
  }
}

