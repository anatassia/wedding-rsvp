<script setup>
import { ref } from "vue"
import FloralDecoration from "./FloralDecoration.vue"

const emit = defineEmits(["opened"])

const opening = ref(false)
const hidden = ref(false)

function handleOpen() {
  if (opening.value) return
  opening.value = true
  emit("opened")

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const delay = prefersReducedMotion ? 150 : 1100

  setTimeout(() => {
    hidden.value = true
  }, delay)
}
</script>

<template>
  <div
    v-if="!hidden"
    class="envelope-overlay"
    :class="{ 'is-opening': opening }"
    role="dialog"
    aria-modal="true"
    aria-label="Jemputan perkahwinan"
  >
    <FloralDecoration corner="top-left" />
    <FloralDecoration corner="bottom-right" />

    <div class="envelope-overlay__content">
      <p class="envelope-overlay__tagline">Sebuah janji, satu cinta</p>

      <div class="envelope">
        <div class="envelope__back" />
        <div class="envelope__letter">
          <p class="envelope__arabic">السلام عليكم</p>
          <p class="envelope__title">Jemputan Walimatulurus</p>
          <p class="envelope__names">Iskandar &amp; Nasyiaa</p>
        </div>
        <div class="envelope__flap" />

        <button
          type="button"
          class="envelope__seal"
          :disabled="opening"
          @click="handleOpen"
        >
          Buka Jemputan
        </button>
      </div>

      <p class="envelope-overlay__instruction">Tekan meterai untuk masuk ke laman jemputan</p>
    </div>
  </div>
</template>

<style scoped>
.envelope-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, var(--navy) 0%, #6f93ad 55%, var(--silver-blue) 100%);
  transition: opacity 0.5s ease;
}

.envelope-overlay.is-opening {
  opacity: 0;
  pointer-events: none;
}

.envelope-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 24px;
  text-align: center;
}

.envelope-overlay__tagline {
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 1.2rem;
  margin: 0;
}

.envelope {
  position: relative;
  width: 280px;
  height: 190px;
}

.envelope__back {
  position: absolute;
  inset: 0;
  background: var(--silver-blue);
  border-radius: 10px;
  box-shadow: 0 20px 40px rgba(74, 107, 133, 0.25);
}

.envelope__letter {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 14px;
  bottom: 10px;
  background: var(--white);
  border-radius: 8px;
  padding: 18px 14px;
  box-shadow: 0 6px 16px rgba(74, 107, 133, 0.15);
  transition: transform 0.7s ease 0.3s;
  z-index: 1;
}

.envelope__arabic {
  font-size: 1.1rem;
  color: var(--navy);
  margin: 0 0 10px;
}

.envelope__title {
  font-family: var(--font-heading);
  color: var(--navy);
  font-size: 0.95rem;
  margin: 0 0 4px;
}

.envelope__names {
  font-family: var(--font-heading);
  color: var(--green);
  font-weight: 600;
  margin: 0;
}

.envelope__flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: var(--navy);
  clip-path: polygon(0 0, 100% 0, 50% 85%);
  border-radius: 10px 10px 0 0;
  transform-origin: top center;
  transition: transform 0.6s ease;
  z-index: 2;
}

.envelope__seal {
  position: absolute;
  top: 78px;
  left: 50%;
  transform: translateX(-50%);
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: none;
  background: var(--green);
  color: var(--white);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(74, 107, 133, 0.3);
  z-index: 3;
  transition: transform 0.2s ease;
}

.envelope__seal:hover:not(:disabled) {
  transform: translateX(-50%) scale(1.05);
}

.envelope__seal:focus-visible {
  outline: 3px solid var(--white);
  outline-offset: 3px;
}

.is-opening .envelope__flap {
  transform: rotateX(180deg);
}

.is-opening .envelope__letter {
  transform: translateY(-46px);
}

.is-opening .envelope__seal {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.envelope-overlay__instruction {
  color: var(--white);
  opacity: 0.85;
  font-size: 0.9rem;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .envelope-overlay,
  .envelope__flap,
  .envelope__letter,
  .envelope__seal {
    transition: none !important;
  }
}
</style>
