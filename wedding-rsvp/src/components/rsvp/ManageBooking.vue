<script setup>
import { ref } from "vue"
import { formatMalayDate, getMalayDayName, formatEventTime } from "../../utils/formatDate.js"

const props = defineProps({
  rsvp: { type: Object, required: true },
  date: { type: Object, default: null },
  cancelling: { type: Boolean, default: false },
  cancelError: { type: String, default: "" },
})
const emit = defineEmits(["edit", "cancel"])

const confirmingCancel = ref(false)
</script>

<template>
  <div class="manage-booking">
    <h2>Tempahan Anda</h2>
    <p class="manage-booking__code">Kod Rujukan: <strong>{{ rsvp.reference_code }}</strong></p>

    <dl class="review-list">
      <div>
        <dt>Tarikh</dt>
        <dd>{{ date ? formatMalayDate(date.event_date) : "—" }}</dd>
      </div>
      <div v-if="date">
        <dt>Hari</dt>
        <dd>{{ getMalayDayName(date.event_date) }}</dd>
      </div>
      <div v-if="date">
        <dt>Masa</dt>
        <dd>{{ formatEventTime(date.start_time, date.end_time) }}</dd>
      </div>
      <div>
        <dt>Nama</dt>
        <dd>{{ rsvp.guest_name }}</dd>
      </div>
      <div>
        <dt>Bilangan Tetamu</dt>
        <dd>{{ rsvp.party_size }} orang</dd>
      </div>
      <div v-if="rsvp.companion_names">
        <dt>Tetamu Iringan</dt>
        <dd>{{ rsvp.companion_names }}</dd>
      </div>
      <div v-if="rsvp.notes">
        <dt>Catatan</dt>
        <dd>{{ rsvp.notes }}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{{ rsvp.status === "confirmed" ? "Disahkan" : "Dibatalkan" }}</dd>
      </div>
    </dl>

    <p v-if="cancelError" class="alert alert--error" role="alert">{{ cancelError }}</p>

    <template v-if="rsvp.status === 'confirmed'">
      <div v-if="!confirmingCancel" class="step-actions">
        <button type="button" class="btn btn--outline" @click="confirmingCancel = true">
          Batalkan RSVP
        </button>
        <button type="button" class="btn" @click="emit('edit')">Ubah RSVP</button>
      </div>

      <div v-else class="confirm-cancel" role="alertdialog" aria-label="Sahkan pembatalan">
        <p>Adakah anda pasti mahu membatalkan RSVP ini?</p>
        <div class="step-actions">
          <button type="button" class="btn btn--ghost" @click="confirmingCancel = false">
            Tidak, kembali
          </button>
          <button type="button" class="btn btn--outline" :disabled="cancelling" @click="emit('cancel')">
            {{ cancelling ? "Membatalkan..." : "Ya, batalkan" }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.manage-booking__code {
  text-align: center;
  color: var(--text-muted);
}

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
  gap: 12px;
}

.confirm-cancel {
  text-align: center;
}
</style>
