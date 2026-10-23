<script setup>
import { ref, watch } from "vue"
import { formatMalayDate, formatEventTime } from "../../utils/formatDate.js"
import { adminListGuests, adminExportCsv } from "../../services/api.js"

const props = defineProps({
  dates: { type: Array, required: true },
  accessToken: { type: String, required: true },
})

const guests = ref([])
const loading = ref(true)
const error = ref("")
const search = ref("")
const dateFilter = ref("")
const statusFilter = ref("")
const exporting = ref(false)

async function load() {
  loading.value = true
  error.value = ""
  try {
    const { guests: rows } = await adminListGuests(props.accessToken, {
      search: search.value,
      date_id: dateFilter.value,
      status: statusFilter.value,
    })
    guests.value = rows
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

let debounceHandle = null
watch([search, dateFilter, statusFilter], () => {
  clearTimeout(debounceHandle)
  debounceHandle = setTimeout(load, 300)
})

load()

async function handleExport() {
  exporting.value = true
  try {
    const blob = await adminExportCsv(props.accessToken, {
      search: search.value,
      date_id: dateFilter.value,
      status: statusFilter.value,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "guest-list.csv"
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    error.value = err.message
  } finally {
    exporting.value = false
  }
}

defineExpose({ reload: load })
</script>

<template>
  <div class="guest-list">
    <div class="guest-list__filters">
      <input v-model="search" type="text" placeholder="Cari nama atau kod rujukan" />
      <select v-model="dateFilter">
        <option value="">Semua Sesi</option>
        <option v-for="date in dates" :key="date.id" :value="date.id">
          {{ formatMalayDate(date.event_date) }}, {{ formatEventTime(date.start_time, date.end_time) }}
        </option>
      </select>
      <select v-model="statusFilter">
        <option value="">Semua Status</option>
        <option value="confirmed">Disahkan</option>
        <option value="cancelled">Dibatalkan</option>
      </select>
      <button type="button" class="btn btn--outline" :disabled="exporting" @click="handleExport">
        {{ exporting ? "Mengeksport..." : "Eksport CSV" }}
      </button>
    </div>

    <p v-if="loading">Memuatkan...</p>
    <p v-else-if="error" class="alert alert--error">{{ error }}</p>
    <p v-else-if="!guests.length">Tiada rekod dijumpai.</p>

    <table v-else class="guest-list__table">
      <thead>
        <tr>
          <th>Kod Rujukan</th>
          <th>Nama</th>
          <th>Sesi</th>
          <th>Bilangan</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in guests" :key="row.id">
          <td>{{ row.reference_code }}</td>
          <td>{{ row.guest_name }}</td>
          <td>{{ row.event_dates ? formatEventTime(row.event_dates.start_time, row.event_dates.end_time) : "—" }}</td>
          <td>{{ row.party_size }}</td>
          <td>
            <span class="badge" :class="row.status === 'confirmed' ? 'badge--open' : 'badge--full'">
              {{ row.status === "confirmed" ? "Disahkan" : "Dibatalkan" }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.guest-list__filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.guest-list__filters input,
.guest-list__filters select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  font: inherit;
}

.guest-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.guest-list__table th,
.guest-list__table td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
}
</style>
