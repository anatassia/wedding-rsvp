<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import AppHeader from "./components/AppHeader.vue"
import AppFooter from "./components/AppFooter.vue"
import BottomNav from "./components/BottomNav.vue"

const route = useRoute()
const showBottomNav = computed(() => !route.path.startsWith("/admin"))
</script>

<template>
  <AppHeader v-if="!route.meta.hideChrome" />
  <main id="app-main" :class="{ 'has-bottom-nav': showBottomNav }">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <AppFooter v-if="!route.meta.hideChrome" />
  <BottomNav v-if="showBottomNav" />
</template>

<style>
@media (max-width: 720px) {
  #app-main.has-bottom-nav {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }
}
</style>
