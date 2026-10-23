<script setup>
import { formatMalayDate, formatEventTime, getMalayDayName } from "../../utils/formatDate.js"

defineProps({
  date: { type: Object, required: true },
  form: { type: Object, required: true },
  submitting: { type: Boolean, default: false },
  error: { type: String, default: "" },
})
const emit = defineEmits(["back", "confirm"])
</script>

<template>
  <div class="review-step">
    <h2>Semakan</h2>

    <dl class="review-list">
      <div>
        <dt>Tarikh</dt>
        <dd>{{ formatMalayDate(date.event_date) }}</dd>
      </div>
      <div>
        <dt>Hari</dt>
        <dd>{{ getMalayDayName(date.event_date) }}</dd>
      </div>
      <div>
        <dt>Masa</dt>
        <dd>{{ formatEventTime(date.start_time, date.end_time) }}</dd>
      </div>
      <div>
        <dt>Venue</dt>
        <dd>{{ date.venue }}</dd>
      </div>
      <div>
        <dt>Nama</dt>
        <dd>{{ form.guest_name }}</dd>
      </div>
      <div>
        <dt>Telefon</dt>
        <dd>{{ form.phone }}</dd>
      </div>
      <div>
        <dt>Bilangan Tetamu</dt>
        <dd>{{ form.party_size }} orang</dd>
      </div>
      <div v-if="form.companion_names">
        <dt>Tetamu Iringan</dt>
        <dd>{{ form.companion_names }}</dd>
      </div>
      <div v-if="form.notes">
        <dt>Catatan</dt>
        <dd>{{ form.notes }}</dd>
      </div>
    </dl>

    <p v-if="error" class="alert alert--error" role="alert" aria-live="assertive">{{ error }}</p>

    <div class="step-actions">
      <button type="button" class="btn btn--ghost" :disabled="submitting" @click="emit('back')">
        Kembali
      </button>
      <button type="button" class="btn" :disabled="submitting" @click="emit('confirm')">
        {{ submitting ? "Menghantar..." : "Sahkan Kehadiran" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.review-list {
  display: grid;
  gap: 12px;
  margin: 0 0 20px;
}

.review-list > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.review-list dt {
  color: var(--text-muted);
}

.review-list dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.step-actions {
  display: flex;
  justify-content: space-between;
}
</style>
