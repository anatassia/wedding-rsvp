<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue"

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  confirmLabel: { type: String, default: "Sahkan" },
})
const emit = defineEmits(["confirm", "cancel"])

const dialogEl = ref(null)
const confirmBtn = ref(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) nextTick(() => confirmBtn.value?.focus())
  }
)

function onKeydown(e) {
  if (!props.open) return
  if (e.key === "Escape") emit("cancel")
}

onMounted(() => window.addEventListener("keydown", onKeydown))
onUnmounted(() => window.removeEventListener("keydown", onKeydown))
</script>

<template>
  <div v-if="open" class="confirm-dialog-backdrop" @click.self="emit('cancel')">
    <div
      ref="dialogEl"
      class="confirm-dialog card"
      role="alertdialog"
      aria-modal="true"
      :aria-label="title"
    >
      <h3>{{ title }}</h3>
      <p v-if="message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button type="button" class="btn btn--ghost" @click="emit('cancel')">Batal</button>
        <button ref="confirmBtn" type="button" class="btn" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(74, 107, 133, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.confirm-dialog {
  max-width: 360px;
  text-align: left;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
