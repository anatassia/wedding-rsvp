<script setup>
import { computed } from "vue"
import { formatMalayDate, formatEventTime, getMalayDayName } from "../../utils/formatDate.js"

const props = defineProps({
  date: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
})
const emit = defineEmits(["select"])

const isFull = computed(() => props.date.remaining <= 0)
const isUnavailable = computed(() => !props.date.is_open || isFull.value)

const status = computed(() => {
  if (!props.date.is_open) return { label: "Ditutup", tone: "full" }
  if (isFull.value) return { label: "Penuh", tone: "full" }
  if (props.date.remaining <= props.date.capacity * 0.1) return { label: "Terhad", tone: "limited" }
  return { label: "Tersedia", tone: "open" }
})

function handleSelect() {
  if (!props.selectable || isUnavailable.value) return
  emit("select", props.date.id)
}
</script>

<template>
  <button
    type="button"
    class="date-card"
    :class="{ 'is-selected': selected, 'is-disabled': selectable && isUnavailable }"
    :disabled="selectable && isUnavailable"
    @click="handleSelect"
  >
    <span class="date-card__time">{{ formatEventTime(date.start_time, date.end_time) }}</span>
    <span class="date-card__weekday">{{ formatMalayDate(date.event_date) }}, {{ getMalayDayName(date.event_date) }}</span>
    <span class="date-card__venue">{{ date.venue }}</span>
    <span class="date-card__counts">
      {{ date.confirmed_count }} / {{ date.capacity }} orang disahkan &middot; {{ date.remaining }} tempat lagi
    </span>

    <span
      class="badge"
      :class="{
        'badge--open': status.tone === 'open',
        'badge--limited': status.tone === 'limited',
        'badge--full': status.tone === 'full',
      }"
    >
      {{ status.label }}
    </span>
  </button>
</template>

<style scoped>
.date-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  width: 100%;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 18px;
  padding: 18px 20px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.date-card:not(.is-disabled):hover {
  border-color: var(--green);
}

.date-card.is-selected {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(123, 166, 196, 0.2);
}

.date-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.date-card__time {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--navy);
}

.date-card__weekday,
.date-card__venue,
.date-card__counts {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.badge {
  margin-top: 8px;
  width: fit-content;
}
</style>
