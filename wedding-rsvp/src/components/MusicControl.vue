<script setup>
import { ref, computed } from "vue"

const audioUrl = import.meta.env.VITE_WEDDING_AUDIO_URL || ""
const audioEl = ref(null)
const playing = ref(false)
const hasAudio = computed(() => Boolean(audioUrl))

// Called by the envelope component right after the "Buka Jemputan" click —
// a real user gesture — so this never fights the browser's autoplay policy.
function startAfterUserGesture() {
  if (!hasAudio.value || !audioEl.value) return
  audioEl.value.play().then(() => {
    playing.value = true
  }).catch(() => {
    // Autoplay was blocked even with the gesture (rare); leave it muted —
    // the visible toggle below still lets the visitor start it manually.
  })
}

function toggle() {
  if (!hasAudio.value || !audioEl.value) return
  if (playing.value) {
    audioEl.value.pause()
    playing.value = false
  } else {
    audioEl.value.play().then(() => {
      playing.value = true
    }).catch(() => {})
  }
}

defineExpose({ startAfterUserGesture })
</script>

<template>
  <div class="music-control">
    <audio v-if="hasAudio" ref="audioEl" :src="audioUrl" loop preload="none" />
    <button
      type="button"
      class="music-control__btn"
      :disabled="!hasAudio"
      :aria-pressed="playing"
      :aria-label="playing ? 'Matikan muzik' : 'Mainkan muzik'"
      :title="hasAudio ? (playing ? 'Matikan muzik' : 'Mainkan muzik') : 'Tiada muzik dikonfigurasikan'"
      @click="toggle"
    >
      <span aria-hidden="true">{{ playing ? "🔊" : "🔈" }}</span>
    </button>
  </div>
</template>

<style scoped>
.music-control {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 30;
}

.music-control__btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--white);
  box-shadow: var(--shadow);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-control__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.music-control__btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
</style>
