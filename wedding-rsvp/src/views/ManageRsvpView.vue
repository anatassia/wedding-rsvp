<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import DateCard from "../components/rsvp/DateCard.vue"
import ManageBooking from "../components/rsvp/ManageBooking.vue"
import { lookupRsvp, updateRsvp, cancelRsvp } from "../services/api.js"
import { useEventDates } from "../composables/useEventDates.js"

const { dates, load: loadDates } = useEventDates()
onMounted(loadDates)

const phase = ref("lookup") // lookup | view | edit
const referenceCode = ref("")
const phone = ref("")
const lookupError = ref("")
const looking = ref(false)

const rsvp = ref(null)
const currentDate = computed(() => dates.value.find((d) => d.id === rsvp.value?.event_date_id) || null)

const editForm = reactive({ event_date_id: "", party_size: "", companion_names: "", notes: "" })
const updateError = ref("")
const updating = ref(false)
const cancelling = ref(false)
const cancelError = ref("")

const effectiveMax = computed(() => {
  const date = dates.value.find((d) => d.id === editForm.event_date_id)
  if (!date) return 0
  const ownExisting = date.id === rsvp.value?.event_date_id ? rsvp.value.party_size : 0
  return Math.min(3, Math.max(0, date.remaining + ownExisting))
})

async function handleLookup() {
  if (looking.value) return
  looking.value = true
  lookupError.value = ""
  try {
    const result = await lookupRsvp(referenceCode.value.trim(), phone.value.trim())
    rsvp.value = result.rsvp
    phase.value = "view"
  } catch (err) {
    lookupError.value = err.message
  } finally {
    looking.value = false
  }
}

function startEdit() {
  editForm.event_date_id = rsvp.value.event_date_id
  editForm.party_size = rsvp.value.party_size
  editForm.companion_names = rsvp.value.companion_names || ""
  editForm.notes = rsvp.value.notes || ""
  updateError.value = ""
  phase.value = "edit"
}

async function handleUpdate() {
  if (updating.value) return
  updating.value = true
  updateError.value = ""
  try {
    const result = await updateRsvp(referenceCode.value.trim(), phone.value.trim(), {
      event_date_id: editForm.event_date_id,
      party_size: editForm.party_size,
      companion_names: editForm.companion_names,
      notes: editForm.notes,
    })
    rsvp.value = result.rsvp
    phase.value = "view"
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function handleCancel() {
  if (cancelling.value) return
  cancelling.value = true
  cancelError.value = ""
  try {
    const result = await cancelRsvp(referenceCode.value.trim(), phone.value.trim())
    rsvp.value = result.rsvp
  } catch (err) {
    cancelError.value = err.message
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <section class="section">
    <div class="container manage-rsvp">
      <div v-if="phase === 'lookup'">
        <h1>Semak / Ubah RSVP</h1>
        <p>Masukkan kod rujukan dan nombor telefon yang digunakan semasa RSVP.</p>

        <form @submit.prevent="handleLookup">
          <div class="field">
            <label for="reference_code">Kod Rujukan</label>
            <input id="reference_code" v-model="referenceCode" type="text" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="phone">Nombor Telefon</label>
            <input id="phone" v-model="phone" type="tel" required />
          </div>

          <p v-if="lookupError" class="alert alert--error" role="alert">{{ lookupError }}</p>

          <button type="submit" class="btn" :disabled="looking" style="width: 100%">
            {{ looking ? "Menyemak..." : "Semak RSVP" }}
          </button>
        </form>
      </div>

      <ManageBooking
        v-else-if="phase === 'view' && rsvp"
        :rsvp="rsvp"
        :date="currentDate"
        :cancelling="cancelling"
        :cancel-error="cancelError"
        @edit="startEdit"
        @cancel="handleCancel"
      />

      <div v-else-if="phase === 'edit'">
        <h2>Ubah RSVP</h2>

        <h3>Pilih Sesi</h3>
        <div class="date-list">
          <DateCard
            v-for="date in dates"
            :key="date.id"
            :date="date"
            :selectable="true"
            :selected="editForm.event_date_id === date.id"
            @select="(id) => (editForm.event_date_id = id)"
          />
        </div>

        <div class="field">
          <label for="edit_party_size">Bilangan Tetamu</label>
          <select id="edit_party_size" v-model.number="editForm.party_size">
            <option v-for="n in Math.min(3, effectiveMax) || 1" :key="n" :value="n">{{ n }} orang</option>
          </select>
        </div>

        <div class="field">
          <label for="edit_companions">Nama Tetamu Iringan</label>
          <textarea id="edit_companions" v-model="editForm.companion_names" rows="2" />
        </div>

        <div class="field">
          <label for="edit_notes">Catatan</label>
          <textarea id="edit_notes" v-model="editForm.notes" rows="2" />
        </div>

        <p v-if="updateError" class="alert alert--error" role="alert">{{ updateError }}</p>

        <div class="step-actions">
          <button type="button" class="btn btn--ghost" :disabled="updating" @click="phase = 'view'">
            Kembali
          </button>
          <button type="button" class="btn" :disabled="updating" @click="handleUpdate">
            {{ updating ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.manage-rsvp {
  max-width: 560px;
}

.date-list {
  display: grid;
  gap: 14px;
  margin: 14px 0 20px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
</style>
