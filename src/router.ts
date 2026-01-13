import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/EventsListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// Navigation guard pentru protecția rutelor
router.beforeEach(async (to, _from, next) => {
  try {
    // Verifică sesiunea curentă
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Dacă există eroare de sesiune invalidă, curăță și redirecționează
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Curăță sesiunea invalidă
      await supabase.auth.signOut();
      if (to.meta.requiresAuth !== false) {
        next('/login');
        return;
      }
    }

    if (to.meta.requiresAuth === false) {
      // Dacă utilizatorul este deja autentificat și încearcă să acceseze login/signup, redirecționează la calendar
      if (session && (to.name === 'login' || to.name === 'signup')) {
        next('/');
      } else {
        next();
      }
    } else {
      // Rute care necesită autentificare
      if (!session) {
        next('/login');
        return;
      }

      // Verifică dacă ruta necesită admin
      if (to.meta.requiresAdmin) {
        try {
          // Obține profilul utilizatorului pentru a verifica rolul
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // Dacă nu există profil sau eroare, sesiunea este invalidă
          if (profileError || !profile) {
            console.error('Profile error or not found:', profileError);
            await supabase.auth.signOut();
            next('/login');
            return;
          }

          if (profile.role !== 'admin') {
            next('/');
            return;
          }
        } catch (err) {
          console.error('Error checking admin role:', err);
          await supabase.auth.signOut();
          next('/login');
          return;
        }
      }

      next();
    }
  } catch (err: any) {
    // Dacă eroarea indică sesiune invalidă, curăță și redirecționează
    if (err?.message?.includes('session') || err?.message?.includes('JWT')) {
      console.error('Invalid session in router guard:', err);
      await supabase.auth.signOut();
      if (to.meta.requiresAuth !== false) {
        next('/login');
      } else {
        next();
      }
    } else {
      console.error('Router guard error:', err);
      next();
    }
  }
});

export default router; 