<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import leftDoorImg from "../assets/left-door.png"
import rightDoorImg from "../assets/right-door.png"
import butterflyImg from "../assets/butterfly.png"
import borderImg from "../assets/border.png"

const emit = defineEmits(["opening", "opened"])

const opening = ref(false)
const hidden = ref(false)

let openTimer = null
let prevHtmlOverflow = ""
let prevBodyOverflow = ""
let appMain = null

// Keep the invitation behind the entrance out of the tab order until it
// actually opens — otherwise it's only visually hidden, not really hidden,
// and Tab would walk a keyboard user straight into it.
function lockBackground() {
  prevHtmlOverflow = document.documentElement.style.overflow
  prevBodyOverflow = document.body.style.overflow
  document.documentElement.style.overflow = "hidden"
  document.body.style.overflow = "hidden"

  appMain = document.getElementById("app-main")
  appMain?.setAttribute("inert", "")
}

function unlockBackground() {
  document.documentElement.style.overflow = prevHtmlOverflow
  document.body.style.overflow = prevBodyOverflow
  appMain?.removeAttribute("inert")
}

onMounted(lockBackground)

onUnmounted(() => {
  if (openTimer) clearTimeout(openTimer)
  unlockBackground()
})

async function handleOpen() {
  if (opening.value) return
  opening.value = true
  emit("opening")

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const delay = prefersReducedMotion ? 150 : 1800

  openTimer = setTimeout(async () => {
    hidden.value = true
    await nextTick()
    emit("opened")
    const target = document.getElementById("home")
    if (target) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    }
  }, delay)
}
</script>

<template>
  <Teleport to="body">
  <div
    v-if="!hidden"
    class="entrance"
    :class="{ 'is-opening': opening }"
    role="dialog"
    aria-modal="true"
    aria-label="Jemputan perkahwinan"
  >
    <div class="entrance__stage">
      <header class="entrance__title">
        <p class="entrance__eyebrow">Walimatul Urus</p>
        <h1 class="entrance__names">Nasyiaa &amp; Iskandar</h1>
        <p class="entrance__date">27 Disember 2026</p>
      </header>

      <div class="entrance__arch">
        <div class="entrance__doorframe">
          <img :src="borderImg" alt="" aria-hidden="true" class="entrance__border" />

          <div class="entrance__doors">
            <img
              :src="leftDoorImg"
              alt=""
              aria-hidden="true"
              class="entrance__door entrance__door--left"
              :class="{ 'is-open': opening }"
            />
            <img
              :src="rightDoorImg"
              alt=""
              aria-hidden="true"
              class="entrance__door entrance__door--right"
              :class="{ 'is-open': opening }"
            />
          </div>

          <div class="entrance__trigger">
            <button
              type="button"
              class="entrance__butterfly-btn"
              aria-label="Buka jemputan"
              :disabled="opening"
              @click="handleOpen"
            >
              <img
                :src="butterflyImg"
                alt=""
                class="entrance__butterfly"
                :class="{ 'is-floating': !opening }"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<style scoped>
.entrance {
  position: fixed;
  inset: 0;
  height: 100vh;
  height: 100dvh;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  transition: opacity 0.55s ease 1.15s;
}

.entrance::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #fdfaf3 0%, #dce9f3 100%);
  opacity: 1;
  transition: opacity 0.7s ease 0.55s;
}

.entrance.is-opening {
  opacity: 0;
  pointer-events: none;
}

.entrance.is-opening::before {
  opacity: 0;
}

.entrance__stage {
  position: relative;
  z-index: 1;
  width: min(92vw, 420px);
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  box-sizing: border-box;
  transform-origin: 50% 62%;
  transition: transform 1.7s cubic-bezier(0.45, 0, 0.2, 1);
  will-change: transform;
}

.is-opening .entrance__stage {
  transform: scale(2.35);
}

.entrance__title {
  position: relative;
  z-index: 5;
  text-align: center;
  flex-shrink: 0;
  transition: opacity 0.4s ease, transform 0.5s ease;
}

.is-opening .entrance__title {
  opacity: 0;
  transform: translateY(-18px);
}

.entrance__eyebrow {
  margin: 0;
  font-family: var(--font-heading);
  letter-spacing: 0.22em;
  font-size: 0.8rem;
  color: var(--navy);
  text-transform: uppercase;
}

.entrance__names {
  margin: 6px 0 0;
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 6.5vw, 2rem);
  color: var(--navy);
  font-weight: 600;
}

.entrance__date {
  margin: 4px 0 0;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.entrance__arch {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entrance__doorframe {
  position: relative;
  display: inline-flex;
}

/* --- floral border: bigger than the doors so the flowers sit outside
   the door panels, stationary while the doors swing, pointer-events off
   so it can never block the butterfly tap target --- */
.entrance__border {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 165%;
  height: auto;
  max-width: none;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.55s ease 0.5s;
}

.is-opening .entrance__border {
  opacity: 0;
}

.entrance__doors {
  position: relative;
  z-index: 1;
  height: min(54dvh, 460px);
  display: flex;
  align-items: stretch;
  perspective: 1200px;
}

.entrance__door {
  display: block;
  height: 100%;
  width: auto;
  object-fit: contain;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 1.35s cubic-bezier(0.65, 0, 0.35, 1);
}

.entrance__door--left {
  transform-origin: left center;
}

.entrance__door--right {
  transform-origin: right center;
}

.entrance__door--left.is-open {
  transform: rotateY(-105deg);
}

.entrance__door--right.is-open {
  transform: rotateY(105deg);
}

.entrance__trigger {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.is-opening .entrance__trigger {
  opacity: 0;
  transform: translate(-50%, -70%);
  pointer-events: none;
}

.entrance__butterfly-btn {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: block;
  line-height: 0;
}

.entrance__butterfly-btn:focus-visible {
  outline: 3px solid var(--navy);
  outline-offset: 8px;
  border-radius: 50%;
}

.entrance__butterfly {
  width: clamp(90px, 26vw, 110px);
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 18px rgba(74, 107, 133, 0.35));
}

.entrance__butterfly.is-floating {
  animation: butterfly-float 3s ease-in-out infinite alternate;
}

@keyframes butterfly-float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .entrance,
  .entrance::before,
  .entrance__stage,
  .entrance__title,
  .entrance__door,
  .entrance__trigger,
  .entrance__butterfly,
  .entrance__border {
    transition: none !important;
    animation: none !important;
  }
}
</style>
