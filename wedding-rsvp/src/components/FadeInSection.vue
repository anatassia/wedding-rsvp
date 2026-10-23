<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const el = ref(null)
const visible = ref(false)
let observer = null

onMounted(() => {
  if (typeof IntersectionObserver === "undefined") {
    visible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      })
    },
    { threshold: 0.15 }
  )

  if (el.value) observer.observe(el.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="fade-in-section" :class="{ 'is-visible': visible }">
    <slot />
  </div>
</template>
