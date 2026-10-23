<script setup>
import { useRoute } from "vue-router"
import AppHeader from "./components/AppHeader.vue"
import AppFooter from "./components/AppFooter.vue"

const route = useRoute()
</script>

<template>
  <AppHeader v-if="!route.meta.hideChrome" />
  <main id="app-main">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <AppFooter v-if="!route.meta.hideChrome" />
</template>
