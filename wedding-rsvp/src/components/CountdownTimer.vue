<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"

const props = defineProps({
  target: { type: String, default: "2026-12-27T11:30:00+08:00" },
})

const now = ref(Date.now())
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const targetMs = computed(() => new Date(props.target).getTime())
const remainingMs = computed(() => Math.max(0, targetMs.value - now.value))
const isComplete = computed(() => remainingMs.value <= 0)

const parts = computed(() => {
  const totalSeconds = Math.floor(remainingMs.value / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
})

function pad(n) {
  return String(n).padStart(2, "0")
}
</script>

<template>
  <div class="countdown" role="timer" aria-live="off">
    <p v-if="isComplete" class="countdown__done">Hari bahagia telah tiba!</p>
    <div v-else class="countdown__grid">
      <div class="countdown__cell">
        <span class="countdown__value">{{ pad(parts.days) }}</span>
        <span class="countdown__label">Hari</span>
      </div>
      <div class="countdown__cell">
        <span class="countdown__value">{{ pad(parts.hours) }}</span>
        <span class="countdown__label">Jam</span>
      </div>
      <div class="countdown__cell">
        <span class="countdown__value">{{ pad(parts.minutes) }}</span>
        <span class="countdown__label">Minit</span>
      </div>
      <div class="countdown__cell">
        <span class="countdown__value">{{ pad(parts.seconds) }}</span>
        <span class="countdown__label">Saat</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-width: 420px;
  margin: 0 auto;
}

.countdown__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 6px;
  box-shadow: var(--shadow);
}

.countdown__value {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 5vw, 2.1rem);
  font-weight: 600;
  color: var(--navy);
  font-variant-numeric: tabular-nums;
}

.countdown__label {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.countdown__done {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--green);
}

@media (max-width: 360px) {
  .countdown__grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 240px;
  }
}
</style>
