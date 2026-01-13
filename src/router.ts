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
  // Verifică sesiunea curentă
  const { data: { session } } = await supabase.auth.getSession();

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
      // Obține profilul utilizatorului pentru a verifica rolul
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        next('/');
        return;
      }
    }

    next();
  }
});

export default router; 