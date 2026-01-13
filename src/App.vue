<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppMenu from '@/components/AppMenu.vue'

const { isAuthenticated } = useAuth()
</script>

<template>
  <AppMenu v-if="isAuthenticated" />
  <RouterView />
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
