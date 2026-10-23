<script setup>
import { ref } from "vue"
import { formatMalayDate, formatEventTime } from "../../utils/formatDate.js"
import { adminSetEventDate } from "../../services/api.js"
import ConfirmDialog from "./ConfirmDialog.vue"

const props = defineProps({
  dates: { type: Array, required: true },
  accessToken: { type: String, required: true },
})
const emit = defineEmits(["changed"])

const busyId = ref(null)
const errorById = ref({})
const capacityDrafts = ref({})
const confirmTarget = ref(null)

function draftFor(date) {
  if (capacityDrafts.value[date.id] === undefined) {
    capacityDrafts.value[date.id] = date.capacity
  }
  return capacityDrafts.value[date.id]
}

function requestToggle(date) {
  confirmTarget.value = date
}

async function confirmToggle() {
  const date = confirmTarget.value
  confirmTarget.value = null
  if (!date) return

  busyId.value = date.id
  errorById.value[date.id] = ""
  try {
    await adminSetEventDate(props.accessToken, date.id, { is_open: !date.is_open })
    emit("changed")
  } catch (err) {
    errorById.value[date.id] = err.message
  } finally {
    busyId.value = null
  }
}

async function saveCapacity(date) {
  const value = Number(capacityDrafts.value[date.id])
  if (!Number.isInteger(value) || value < 0) {
    errorById.value[date.id] = "Kapasiti tidak sah"
    return
  }
  busyId.value = date.id
  errorById.value[date.id] = ""
  try {
    await adminSetEventDate(props.accessToken, date.id, { capacity: value })
    emit("changed")
  } catch (err) {
    errorById.value[date.id] = err.message
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="date-manager">
    <div v-for="date in dates" :key="date.id" class="date-manager__row card">
      <div class="date-manager__info">
        <strong>{{ formatMalayDate(date.event_date) }}, {{ formatEventTime(date.start_time, date.end_time) }}</strong> — {{ date.venue }}
        <div class="date-manager__stats">
          {{ date.confirmed_count }} disahkan · {{ date.remaining }} tempat lagi ·
          kapasiti {{ date.capacity }}
        </div>
      </div>

      <div class="date-manager__controls">
        <label class="date-manager__capacity">
          Kapasiti
          <input
            type="number"
            min="0"
            v-model.number="capacityDrafts[date.id]"
            :value="draftFor(date)"
          />
        </label>
        <button type="button" class="btn btn--outline" :disabled="busyId === date.id" @click="saveCapacity(date)">
          Simpan
        </button>
        <button type="button" class="btn" :disabled="busyId === date.id" @click="requestToggle(date)">
          {{ date.is_open ? "Tutup Tarikh" : "Buka Semula" }}
        </button>
      </div>

      <p v-if="errorById[date.id]" class="alert alert--error">{{ errorById[date.id] }}</p>
    </div>

    <ConfirmDialog
      :open="confirmTarget !== null"
      :title="confirmTarget?.is_open ? 'Tutup pendaftaran?' : 'Buka semula pendaftaran?'"
      :message="
        confirmTarget?.is_open
          ? 'Tetamu tidak akan dapat mendaftar untuk tarikh ini sehingga dibuka semula.'
          : 'Tetamu akan dapat mendaftar semula untuk tarikh ini.'
      "
      confirm-label="Sahkan"
      @confirm="confirmToggle"
      @cancel="confirmTarget = null"
    />
  </div>
</template>

<style scoped>
.date-manager {
  display: grid;
  gap: 14px;
}

.date-manager__row {
  text-align: left;
}

.date-manager__stats {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 4px;
}

.date-manager__controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.date-manager__capacity {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.date-manager__capacity input {
  width: 80px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
}
</style>
