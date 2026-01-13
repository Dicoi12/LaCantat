<template>
  <!-- Desktop Menu -->
  <Menubar :model="menuItems" class="app-menu desktop-menu">
    <template #start>
      <div class="menu-logo">
        <div class="logo-content">
          <div class="logo-row">
            <i class="pi pi-music" style="font-size: 1.5rem"></i>
            <span class="menu-title">LaCantat</span>
          </div>
          <div class="user-greeting">
            hello, {{ userProfile?.full_name || userProfile?.username || 'utilizator' }}
          </div>
        </div>
      </div>
    </template>
    <template #end>
      <div class="menu-user">
        <span class="user-name">{{ userProfile?.full_name || userProfile?.username || 'Utilizator' }}</span>
        <Button
          icon="pi pi-sign-out"
          label="Logout"
          severity="secondary"
          text
          @click="handleLogout"
        />
      </div>
    </template>
  </Menubar>

  <!-- Mobile Menu -->
  <div class="mobile-menu">
    <div class="mobile-header">
      <div class="menu-logo">
        <div class="logo-content">
          <div class="logo-row">
            <i class="pi pi-music"></i>
            <span class="menu-title">LaCantat</span>
          </div>
          <div class="user-greeting">
            hello, {{ userProfile?.full_name || userProfile?.username || 'utilizator' }}
          </div>
        </div>
      </div>
      <div class="mobile-menu-icons">
        <button
          v-for="(item, index) in menuItems"
          :key="index"
          :class="['menu-icon-btn', { active: item.class?.includes('p-highlight') }]"
          @click="handleMenuClick(item)"
          :title="typeof item.label === 'string' ? item.label : ''"
        >
          <i :class="item.icon"></i>
        </button>
      </div>
      <Button
        icon="pi pi-sign-out"
        severity="secondary"
        text
        rounded
        @click="handleLogout"
        class="logout-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import type { MenuItem } from 'primevue/menuitem'

const router = useRouter()
const route = useRoute()
const { userProfile, isAdmin, signOut } = useAuth()

const handleLogout = async () => {
  await signOut()
}

const handleMenuClick = (item: MenuItem) => {
  if (item.command) {
    // PrimeVue command expects MenuItemCommandEvent, but our commands are simple functions
    // Create a mock event object
    const mockEvent = {
      originalEvent: new Event('click'),
      item: item
    } as any
    item.command(mockEvent)
  }
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      label: 'Calendar',
      icon: 'pi pi-calendar',
      command: () => router.push('/'),
      class: route.name === 'calendar' ? 'p-highlight' : ''
    },
    {
      label: 'Evenimente',
      icon: 'pi pi-list',
      command: () => router.push('/events'),
      class: route.name === 'events' ? 'p-highlight' : ''
    }
  ]

  if (isAdmin.value) {
    items.push({
      label: 'Utilizatori',
      icon: 'pi pi-users',
      command: () => router.push('/users'),
      class: route.name === 'users' ? 'p-highlight' : ''
    })
  }

  return items
})
</script>

<style scoped>
.app-menu {
  margin-bottom: 1rem;
  border-radius: 0;
}

.menu-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.25rem;
}

.logo-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Desktop - logo pe o singură linie */
.desktop-menu .logo-content {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.desktop-menu .user-greeting {
  margin-left: 0.5rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--surface-border);
}

.menu-title {
  color: var(--text-color);
}

.user-greeting {
  font-size: 0.65rem;
  color: var(--text-color-secondary);
  font-weight: 400;
  line-height: 1;
  opacity: 0.7;
}

.menu-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--surface-border);
  position: relative;
}

.mobile-header .menu-logo {
  font-size: 1rem;
  flex-shrink: 0;
}

.mobile-header .menu-logo i {
  font-size: 1.25rem;
}

.logout-btn {
  min-width: auto;
  padding: 0.5rem;
  flex-shrink: 0;
}

.mobile-menu-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.menu-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color-secondary);
  font-size: 1.25rem;
}

.menu-icon-btn:hover {
  background: var(--surface-hover);
  color: var(--primary-color);
}

.menu-icon-btn.active {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border: 2px solid var(--primary-color);
}

.menu-icon-btn i {
  font-size: 1.25rem;
}

/* Desktop - hide mobile menu */
@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }

  
}

/* Mobile - hide desktop menu, show mobile menu */
@media (max-width: 768px) {
  .desktop-menu {
    display: none !important;
  }

  .mobile-menu {
    display: block;
    margin-bottom: 1rem;
  }

  .menu-logo {
    font-size: 1rem;
  }

  .menu-title {
    font-size: 1rem;
  }

  .user-greeting {
    font-size: 0.6rem;
  }

  .user-name {
    display: none;
  }
}
</style>

