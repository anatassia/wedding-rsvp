<script setup>
defineProps({
  label: { type: String, default: "Memuatkan..." },
})
</script>

<template>
  <div class="loading-overlay" role="status" aria-live="polite">
    <span class="loading-overlay__spinner" aria-hidden="true" />
    <span class="loading-overlay__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: inherit;
  z-index: 5;
}

.loading-overlay__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: loading-overlay-spin 0.8s linear infinite;
}

.loading-overlay__label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

@keyframes loading-overlay-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-overlay__spinner {
    animation: none;
    border-top-color: var(--border);
  }
}
</style>
