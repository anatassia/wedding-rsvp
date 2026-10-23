<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import DateCard from "../components/rsvp/DateCard.vue"
import GuestDetailsStep from "../components/rsvp/GuestDetailsStep.vue"
import ReviewStep from "../components/rsvp/ReviewStep.vue"
import { createRsvp } from "../services/api.js"
import { useEventDates } from "../composables/useEventDates.js"
import { formatEventTime } from "../utils/formatDate.js"

const { dates, loading: datesLoading, load: loadDates } = useEventDates()
onMounted(loadDates)

const phase = ref("date") // date | details | review | done

const form = reactive({
  event_date_id: "",
  guest_name: "",
  party_size: "",
  companion_names: "",
  notes: "",
})

const submitError = ref("")
const submitting = ref(false)
const confirmedRsvp = ref(null)
const codeCopied = ref(false)

const selectedDate = computed(() => dates.value.find((d) => d.id === form.event_date_id) || null)
const effectiveMax = computed(() => {
  if (!selectedDate.value) return 0
  return Math.min(5, Math.max(0, selectedDate.value.remaining))
})

function chooseDate(id) {
  form.event_date_id = id
}

async function handleConfirm() {
  if (submitting.value) return
  submitting.value = true
  submitError.value = ""
  try {
    const { rsvp } = await createRsvp({
      event_date_id: form.event_date_id,
      guest_name: form.guest_name,
      party_size: form.party_size,
      companion_names: form.companion_names,
      notes: form.notes,
    })
    confirmedRsvp.value = rsvp
    phase.value = "done"
  } catch (err) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}

async function copyCode() {
  if (!confirmedRsvp.value) return
  try {
    await navigator.clipboard.writeText(confirmedRsvp.value.reference_code)
    codeCopied.value = true
    setTimeout(() => (codeCopied.value = false), 2000)
  } catch {
    /* clipboard unavailable — the code is still shown and selectable manually */
  }
}
</script>

<template>
  <section class="section">
    <div class="container rsvp-view">
      <div v-if="phase === 'date'">
        <h2>Pilih Sesi</h2>
        <p v-if="datesLoading">Memuatkan sesi...</p>
        <p
          v-else-if="dates.every((d) => !d.is_open || d.remaining <= 0)"
          class="alert alert--error"
          role="alert"
        >
          Maaf, kedua-dua sesi kini tidak tersedia.
        </p>
        <div v-else class="date-list">
          <DateCard
            v-for="date in dates"
            :key="date.id"
            :date="date"
            :selectable="true"
            :selected="form.event_date_id === date.id"
            @select="chooseDate"
          />
        </div>
        <div class="step-actions">
          <span />
          <button type="button" class="btn" :disabled="!form.event_date_id" @click="phase = 'details'">
            Seterusnya
          </button>
        </div>
      </div>

      <GuestDetailsStep
        v-else-if="phase === 'details'"
        :model-value="form"
        @update:model-value="(val) => Object.assign(form, val)"
        :max-allowed="effectiveMax"
        @back="phase = 'date'"
        @next="phase = 'review'"
      />

      <ReviewStep
        v-else-if="phase === 'review'"
        :date="selectedDate"
        :form="form"
        :submitting="submitting"
        :error="submitError"
        @back="phase = 'details'"
        @confirm="handleConfirm"
      />

      <div v-else-if="phase === 'done'" class="done-step" role="status" aria-live="polite">
        <h2>Terima Kasih!</h2>
        <p>
          Terima kasih kerana mengesahkan kehadiran.<br />
          Kehadiran anda telah direkodkan. Sila simpan kod rujukan ini untuk
          menyemak atau mengubah RSVP anda.
        </p>

        <div class="reference-code">
          <span class="reference-code__value">{{ confirmedRsvp?.reference_code }}</span>
          <button type="button" class="btn btn--outline" @click="copyCode">
            {{ codeCopied ? "Disalin!" : "Salin Kod" }}
          </button>
        </div>

        <p>
          Sesi: <strong>{{ confirmedRsvp && formatEventTime(selectedDate?.start_time, selectedDate?.end_time) }}</strong>
          &middot; Bilangan: <strong>{{ confirmedRsvp?.party_size }} orang</strong>
        </p>

        <router-link to="/" class="btn btn--ghost">Kembali ke Halaman Utama</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rsvp-view {
  max-width: 560px;
}

.date-list {
  display: grid;
  gap: 14px;
  margin: 20px 0;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.done-step {
  text-align: center;
}

.reference-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.reference-code__value {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--navy);
  background: var(--bg-soft);
  padding: 10px 18px;
  border-radius: 12px;
}
</style>
