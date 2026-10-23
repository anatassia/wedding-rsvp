<script setup>
import { computed } from "vue"
import { formatClock12 } from "../utils/formatDate.js"

const props = defineProps({
  dates: { type: Array, default: () => [] },
})

function toMinutes(time) {
  if (!time) return null
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function fromMinutes(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0")
  const m = String(mins % 60).padStart(2, "0")
  return `${h}:${m}`
}

const agendas = computed(() =>
  props.dates.map((d, i) => {
    const start = toMinutes(d.start_time)
    const end = toMinutes(d.end_time)
    const mid = start !== null && end !== null ? fromMinutes(Math.round((start + end) / 2)) : null

    return {
      id: d.id,
      label: `Sesi ${i + 1}`,
      meta: `${formatClock12(d.start_time)} &ndash; ${formatClock12(d.end_time)} &middot; ${d.venue}`,
      steps: [
        { time: formatClock12(d.start_time), title: "Ketibaan Tetamu", text: "Jamuan dibuka untuk para tetamu yang hadir." },
        { time: formatClock12(mid), title: "Ketibaan Pengantin", text: "Pasangan pengantin tiba untuk bersama tetamu." },
        { time: formatClock12(d.end_time), title: "Majlis Bersurai", text: "Terima kasih atas kesudian hadir dan mendoakan kami." },
      ],
    }
  })
)
</script>

<template>
  <div class="container container--narrow">
    <header class="section__head">
      <h2 class="section__title">Atur Cara</h2>
    </header>

    <div class="agenda" v-for="agenda in agendas" :key="agenda.id">
      <header class="agenda__head">
        <p class="eyebrow">{{ agenda.label }}</p>
        <p class="agenda__meta" v-html="agenda.meta" />
      </header>

      <ol class="timeline">
        <li v-for="step in agenda.steps" :key="step.title" class="timeline__item">
          <p class="timeline__time">{{ step.time }}</p>
          <h3 class="timeline__title">{{ step.title }}</h3>
          <p class="timeline__text">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.agenda {
  margin-bottom: 36px;
}

.agenda:last-child {
  margin-bottom: 0;
}

.agenda__head {
  text-align: center;
  margin-bottom: 18px;
}

.agenda__meta {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 18px;
}

.timeline__item {
  position: relative;
  padding-left: 22px;
  border-left: 2px solid var(--border);
}

.timeline__time {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 2px;
}

.timeline__title {
  margin: 0 0 4px;
}

.timeline__text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.92rem;
}
</style>
