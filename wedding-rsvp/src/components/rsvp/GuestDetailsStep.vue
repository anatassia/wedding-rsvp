<script setup>
import { computed } from "vue"

const props = defineProps({
  modelValue: { type: Object, required: true },
  maxAllowed: { type: Number, required: true },
})
const emit = defineEmits(["update:modelValue", "back", "next"])

const PARTY_LABELS = {
  1: "Saya sahaja",
  2: "Dua orang",
  3: "Tiga orang",
  4: "Empat orang",
  5: "Lima orang",
}

function update(field, value) {
  emit("update:modelValue", { ...props.modelValue, [field]: value })
}

const partyOptions = computed(() => [1, 2, 3, 4, 5].filter((n) => n <= props.maxAllowed))

const errors = computed(() => {
  const e = {}
  if (!props.modelValue.guest_name?.trim()) e.guest_name = "Nama penuh diperlukan"
  if (!props.modelValue.party_size) e.party_size = "Sila pilih bilangan tetamu"
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)
</script>

<template>
  <div class="guest-step">
    <h2>Butiran Tetamu</h2>

    <div class="field">
      <label for="guest_name">Nama Penuh *</label>
      <input
        id="guest_name"
        type="text"
        :value="modelValue.guest_name"
        @input="update('guest_name', $event.target.value)"
      />
      <span v-if="errors.guest_name" class="field-error" role="alert">{{ errors.guest_name }}</span>
    </div>

    <fieldset class="field party-size">
      <legend>Jumlah yang Hadir *</legend>
      <label v-for="n in partyOptions" :key="n" class="party-size__option">
        <input
          type="radio"
          name="party_size"
          :value="n"
          :checked="modelValue.party_size === n"
          @change="update('party_size', n)"
        />
        {{ n }} &mdash; {{ PARTY_LABELS[n] }}
      </label>
      <p class="party-size__note">
        Jumlah termasuk diri anda. Maksimum 5 orang bagi setiap jemputan.
      </p>
      <span v-if="maxAllowed < 5" class="field-error" style="color: var(--text-muted)">
        Tempat yang tinggal terhad kepada {{ maxAllowed }} orang untuk tarikh ini.
      </span>
    </fieldset>

    <div class="field">
      <label for="companions">Nama Tetamu Iringan (jika ada)</label>
      <textarea
        id="companions"
        rows="2"
        :value="modelValue.companion_names"
        @input="update('companion_names', $event.target.value)"
      />
    </div>

    <div class="field">
      <label for="notes">Catatan</label>
      <textarea
        id="notes"
        rows="2"
        :value="modelValue.notes"
        @input="update('notes', $event.target.value)"
      />
    </div>

    <div class="step-actions">
      <button type="button" class="btn btn--ghost" @click="emit('back')">Kembali</button>
      <button type="button" class="btn" :disabled="!isValid" @click="emit('next')">Semak Semula</button>
    </div>
  </div>
</template>

<style scoped>
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.party-size legend {
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0;
  margin-bottom: 6px;
}

.party-size__option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
  padding: 8px 0;
}

.party-size__note {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 8px 0 0;
}
</style>
